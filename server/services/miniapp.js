const axios = require('axios');
const { OpenAI } = require('openai');
const NodeCache = require('node-cache');
const marked = require('marked');
const { parse } = require('node-html-parser');
const { gfmHeadingId } = require('marked-gfm-heading-id');
const { mangle } = require('marked-mangle');
const outlineCache = new NodeCache({ stdTTL: 3600 * 24 * 30 }); // 缓存1个月
const miniappModel = require('./../models/miniapp')
const { calcIntervalMin } = require('./../utils/utils');
const { query } = require('./../utils/db-util')

// 配置marked
marked.use(gfmHeadingId());
marked.use(mangle());

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.KEY
});


module.exports = {
    async getUserInfo(code) {
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=wxa3f7a06bb04bbf11&secret=090d93bdada81b72cc8df609608a3399&js_code=${code}&grant_type=authorization_code`;
        try {
            const response = await axios.get(url);
            const { openid, session_key, errcode, errmsg } = response.data;
            if (errcode) {
              throw new Error(errmsg);
            }
            // 获取用户信息后，调用 addUserIfNotExist 来确保用户存在
            await miniappModel.addUserIfNotExist(openid);
            return { openid, session_key };
          } catch (error) {
            throw new Error('Error fetching userInfo from WeChat: ' + error.message);
        }
    },

    /**
   * 新增课程
   * @param {Object} courseData 课程数据
   * @returns {Promise} 返回课程创建结果
   */
  async addSchedule(scheduleData) {
    try {
      // 使用 Course 模型的 create 方法来插入数据
      const course = await miniappModel.addSchedule(scheduleData);
      return course;  // 返回插入的课程数据
    } catch (error) {
      throw new Error('课程新增失败：' + error.message);
    }
  },

async generateCourseOutline(courseName, courseType) {
  try {
      const cacheKey = `outline_${courseName}_${courseType}`;
      const cachedOutline = outlineCache.get(cacheKey);
      if (cachedOutline) {
          return cachedOutline;
      }

      const prompt = `针对课程名称，分析课程强度，写出排课提纲，列一下相关瑜伽体式
                      课程名称：${courseName}
                      基本要求：
                      1. 格式为Markdown列表
                      2. 不要返回标题
                      3. 不要中英文夹杂，言简意赅
                      4. 用ul、li展示
                      举个例子：精准拉伸（课程名称）
                      大纲如下：
                      1.调息
                      2.热身：山式站立-前屈-下犬-八体投地-眼镜蛇-下犬-动态下犬10组（拉伸小腿后侧）-单腿下犬（右）-动态骑马式10组（拉伸大腿前侧）-新月式-矛式-下犬-动态下犬-单腿下犬（左）-动态骑马式-新月式-矛式-下犬
                      3.力量：战士二-反战士二-侧角伸展-侧角扭转-下犬-（反侧）
                      4.拉伸：半神猴（拉伸大腿后侧）-鸽子式（拉伸臀外侧及大腿外侧）-下犬-（反侧）-四脚跪姿变体（拉伸小腿后侧）-坐角式（拉伸大腿内侧）-坐角侧伸展-仰卧-仰卧扭脊式
                      5.休息术
                      `;

      const completion = await deepseek.chat.completions.create({
          messages: [
              { role: "system", content: "你是一个专业的瑜伽老师，行业翘楚" },
              { role: "user", content: prompt }
          ],
          model: "deepseek-chat",
          temperature: 0.7,
          max_tokens: 500
      });

      const markdownContent = completion.choices[0].message.content;
      
      // 将Markdown转换为rich-text nodes
      const htmlContent = marked.parse(markdownContent);
      const nodes = this.htmlToNodes(htmlContent);
      
      // 存入缓存
      outlineCache.set(cacheKey, nodes);
      
      return nodes;
  } catch (error) {
      console.error('生成课程提纲失败:', error);
      throw new Error('生成课程提纲失败');
  }
},

/**
 * 将HTML转换为rich-text nodes
 * @param {string} html HTML内容
 * @returns {Array} rich-text nodes
 */
htmlToNodes(html) {
    const root = parse(html);
    return this.parseElement(root);
},

/**
 * 递归解析DOM元素
 * @param {HTMLElement} element DOM元素
 * @returns {Array} 解析后的nodes
 */
parseElement(element) {
    const nodes = [];
    
    element.childNodes.forEach(child => {
        if (child.nodeType === 3) { // 文本节点
            const text = child.text.trim();
            if (text) {
                nodes.push({
                    type: 'text',
                    text: text
                });
            }
        } else if (child.nodeType === 1) { // 元素节点
            const node = {
                name: child.tagName.toLowerCase(),
                attrs: {},
                children: this.parseElement(child)
            };
            
            // 处理常见标签属性
            if (child.tagName.toLowerCase() === 'a') {
                node.attrs.href = child.getAttribute('href');
            }
            if (child.tagName.toLowerCase() === 'img') {
                node.attrs.src = child.getAttribute('src');
                node.attrs.alt = child.getAttribute('alt');
            }
            
            nodes.push(node);
        }
    });
    
    return nodes;
},

  async getScheduleList(openid) {
    try {
      // 查询今天及今天以后的排课数据，按 course_date 排序
      const schedules = await query(`
        SELECT id, course_name, location, start_time, end_time, course_date, course_type_id, course_type_desc, course_type_price
        FROM schedules 
        WHERE open_id = ? 
          AND course_date >= CURDATE() 
        ORDER BY course_date ASC, start_time ASC
      `, [openid]);
  
      // 将查询结果按 course_date 分组
      const groupedSchedules = schedules.reduce((acc, schedule) => {
        const formattedDate = new Date(schedule.course_date);
        const dateKey = `${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}-${formattedDate.getDate().toString().padStart(2, '0')}`;
        const fullDate = `${formattedDate.getFullYear()}-${dateKey}`;
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[formattedDate.getDay()];
        // 如果日期组不存在，创建一个新的
        if (!acc[dateKey]) {
          acc[dateKey] = {
            courseDate: dateKey, // 使用日期作为 courseData
            weekDay,
            list: []
          };
        }
        const startTime = schedule.start_time.slice(0, -3)
        const endTime = schedule.end_time.slice(0, -3)
        // 添加课程信息到对应日期的列表中
        acc[dateKey].list.push({
          id: schedule.id,
          courseName: schedule.course_name,
          location: schedule.location,
          startTime,
          endTime,
          timeRange: `${startTime}~${endTime}`,
          fullDate: fullDate,
          courseType: {
            id: schedule.course_type_id,
            description: schedule.course_type_desc,
            price: schedule.course_type_price
          }
        });
        return acc;
      }, {});
  
      // 转换成数组格式并返回
      return Object.values(groupedSchedules);
  
    } catch (error) {
      throw new Error('获取排课列表失败：' + error.message);
    }
  },   

  async getWeekScheduleList(openid, customDate) {
    try {
      const [mondayStr, sundayStr] = customDate;
      const START_TIME = '10:00'; // 课程最早开始时间
      const END_TIME = '21:00'; // 课程最晚结束时间
      // 将时间字符串转换为小时数
      const startHour = parseInt(START_TIME.split(':')[0], 10);
      const endHour = parseInt(END_TIME.split(':')[0], 10);
  
      // 生成从 startHour 到 endHour 的小时数组
      const hoursArray = [];
      for (let hour = startHour; hour < endHour; hour++) {
        hoursArray.push(hour);
      }
  
      const fullDuration = calcIntervalMin(START_TIME, END_TIME);
  
      // 查询自定义日期范围内的排课数据
      const schedules = await query(`
        SELECT id, course_name, location, start_time, end_time, course_date
        FROM schedules 
        WHERE open_id = ? 
          AND course_date BETWEEN ? AND ?
        ORDER BY course_date ASC, start_time ASC
      `, [openid, mondayStr, sundayStr]);

      // 格式化日期为 'yyyy-mm-dd' 形式，避免时区差异
      const formatDate = (date) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(date).toLocaleDateString('en-CA', options).replace(/\//g, '-');
      };
  
      // 构造自定义日期范围的排课数据结构
      const weekSchedule = [];
      const startDate = new Date(mondayStr);
      const endDate = new Date(sundayStr);
      while (startDate <= endDate) {
        const dateKey = formatDate(startDate); // 使用本地日期格式（YYYY-MM-DD）
        const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][startDate.getDay()];
        const weekDate = dateKey.slice(5); // 获取 MM-DD 格式
  
        // 筛选出该日期的所有排课数据
        const daySchedule = schedules.filter(schedule => {
          return formatDate(schedule.course_date) === dateKey;
        }).map(schedule => {
          const startTime = schedule.start_time.slice(0, 5);
          const endTime = schedule.end_time.slice(0, 5);
          const left = `${calcIntervalMin(START_TIME, startTime) / fullDuration * 100}%`;
          const width = `${calcIntervalMin(startTime, endTime) / fullDuration * 100}%`;
          return {
            startTime,
            endTime,
            left,
            width,
            courseName: schedule.course_name,
            location: schedule.location
          };
        });
  
        weekSchedule.push({
          weekDay,
          weekDate,
          list: daySchedule
        });
  
        // 增加日期
        startDate.setDate(startDate.getDate() + 1);
      }
  
      return {
        list: weekSchedule,
        xAxisData: hoursArray
      };
  
    } catch (error) {
      throw new Error('获取排课列表失败：' + error.message);
    }
  },  

  async getHistoryScheduleList(openid, yearMonth) {
    try {
    const targetDate = new Date(yearMonth);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;

    const schedules = await query(`
      SELECT id, course_name, location, start_time, end_time, course_date, course_type_id, course_type_desc, course_type_price
      FROM schedules 
      WHERE open_id = ? 
        AND course_date < CURDATE() 
        AND YEAR(course_date) = ? 
        AND MONTH(course_date) = ?
      ORDER BY course_date ASC, start_time ASC
    `, [openid, targetYear, targetMonth]);  // SQL月份从1开始，所以要加1

    let totalSalary = 0; // 用来累计课时费
    let storeSalaries = {}; // 用于存储每个门店的薪资
  
      // 将查询结果按 course_date 分组
      const groupedSchedules = schedules.reduce((acc, schedule) => {
        const formattedDate = new Date(schedule.course_date);
        const dateKey = `${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}-${formattedDate.getDate().toString().padStart(2, '0')}`;
        const fullDate = `${formattedDate.getFullYear()}-${dateKey}`;
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[formattedDate.getDay()];
        // 如果日期组不存在，创建一个新的
        if (!acc[dateKey]) {
          acc[dateKey] = {
            courseDate: dateKey, // 使用日期作为 courseData
            weekDay,
            list: []
          };
        }
        const startTime = schedule.start_time.slice(0, -3)
        const endTime = schedule.end_time.slice(0, -3)
        totalSalary += schedule.course_type_price;
        // 增加到对应门店的薪资
        if (!storeSalaries[schedule.location]) {
          storeSalaries[schedule.location] = 0;
        }
        storeSalaries[schedule.location] += schedule.course_type_price;
        // 添加课程信息到对应日期的列表中
        acc[dateKey].list.push({
          id: schedule.id,
          courseName: schedule.course_name,
          location: schedule.location,
          startTime,
          endTime,
          timeRange: `${startTime}~${endTime}`,
          fullDate: fullDate,
          courseType: {
            id: schedule.course_type_id,
            description: schedule.course_type_desc,
            price: schedule.course_type_price
          }
        });
        return acc;
      }, {});

      // 转换成数组格式并返回
    const storeSalaryArray = Object.keys(storeSalaries).map(location => ({
      location,
      salary: storeSalaries[location].toFixed(2)
    }));
  
      // 转换成数组格式并返回
      return {
        schedules: Object.values(groupedSchedules),
        totalSalary: totalSalary.toFixed(2), // 返回总课时费
        storeSalary: storeSalaryArray  // 返回门店薪资
      };
    } catch (error) {
      throw new Error('获取排课列表失败：' + error.message);
    }
  },  

   /**
   * 删除课程
   * @param {number} id 课程的ID
   * @returns {Promise} 返回删除结果
   */
   async deleteSchedule(id) {
    try {
      // 调用模型层删除课程
      const result = await miniappModel.deleteScheduleById(id);
      return result;
    } catch (error) {
      throw new Error('删除课程失败：' + error.message);
    }
  },

  // 编辑课程
  async editSchedule(payload) {
    try {
        // 调用模型层的更新函数，更新课程信息
        const updatedSchedule = await miniappModel.editSchedule(payload);
        
        // 返回更新结果
        return updatedSchedule;
    } catch (error) {
        throw new Error('编辑课程失败：' + error.message);
    }
},

async getLocationList() {
  try {
    const schedules = await query('SELECT * FROM locations');
    return schedules;
  } catch (error) {
    throw new Error('获取门店列表失败：' + error.message);
  }
},  

async getCourseTypeList() {
  try {
    const list = await query('SELECT * FROM course_types');
    return list;
  } catch (error) {
    throw new Error('获取课程类型列表失败：' + error.message);
  }
},  
}