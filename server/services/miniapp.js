const axios = require('axios');
const miniappModel = require('./../models/miniapp')
const { calcIntervalMin } = require('./../utils/utils');
const { query } = require('./../utils/db-util')

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

  async getScheduleList(openid) {
    try {
      // 查询今天及今天以后的排课数据，按 course_date 排序
      const schedules = await query(`
        SELECT id, course_name, location, start_time, end_time, course_date, course_type_id, course_type_desc, course_type_price
        FROM schedules 
        WHERE open_id = ? 
          AND course_date >= CURDATE() 
        ORDER BY course_date ASC
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
      const [mondayStr, sundayStr] = customDate
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
  
      const fullDuration = calcIntervalMin(START_TIME, END_TIME)
  
      // 查询自定义日期范围内的排课数据
      const schedules = await query(`
        SELECT id, course_name, location, start_time, end_time, course_date
        FROM schedules 
        WHERE open_id = ? 
          AND course_date BETWEEN ? AND ?
        ORDER BY course_date ASC, start_time ASC
      `, [openid, mondayStr, sundayStr]);
  
      // 构造自定义日期范围的排课数据结构
      const weekSchedule = [];
      const startDate = new Date(mondayStr);
      const endDate = new Date(sundayStr);
      while (startDate <= endDate) {
        const dateKey = startDate.toISOString().split('T')[0]; // 格式化为 'yyyy-mm-dd'
        const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][startDate.getDay()];
        const weekDate = dateKey.slice(5); // 获取 MM-DD 格式
  
        // 筛选出该日期的所有排课数据
        const daySchedule = schedules.filter(schedule => {
          return new Date(schedule.course_date).toISOString().split('T')[0] === dateKey;
        }).map(schedule => {
          const startTime = schedule.start_time.slice(0, 5)
          const endTime = schedule.end_time.slice(0, 5)
          const left = `${calcIntervalMin(START_TIME, startTime) / fullDuration * 100}%`;
          const width = `${calcIntervalMin(startTime, endTime) / fullDuration * 100}%`;
          return {
            startTime,
            endTime,
            left,
            width,
            courseName: schedule.course_name,
            location: schedule.location
          }
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
      ORDER BY course_date DESC
    `, [openid, targetYear, targetMonth]);  // SQL月份从1开始，所以要加1

    let totalSalary = 0; // 用来累计课时费
  
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
      return {
        schedules: Object.values(groupedSchedules),
        totalSalary: totalSalary.toFixed(2)  // 返回总课时费
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