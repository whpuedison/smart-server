const axios = require('axios');
const miniappModel = require('./../models/miniapp')
const utils = require('./../utils/utils');

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
      // 查询排课数据
      const schedules = await miniappModel.getScheduleList(openid);
  
      // 获取当前日期
      const currentDate = new Date();
      const currentDay = currentDate.getDay(); // 获取当前是星期几 (0-6，0代表星期天，1代表星期一)
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // 如果是星期天，距离周一是-6天，否则是1 - 当前日期
      const mondayDate = new Date(currentDate);
      mondayDate.setDate(currentDate.getDate() + diffToMonday); // 设置为当前周的周一
  
      // 生成当前周的所有日期（周一到周日）
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(mondayDate);
        date.setDate(mondayDate.getDate() + i); // 设置为周一到周日的日期
        weekDates.push({
          day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],  // 星期几
          date: date.toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
        });
      }
  
      // 格式化并将数据按照星期几分组
      const formattedSchedules = schedules.reduce((acc, course) => {
        // 查找该天是否已经有排课，如果没有就创建一个新的
        let dayGroup = acc.find(item => item.weekDay === course.week_day);
        if (!dayGroup) {
          dayGroup = { 
            weekDay: course.week_day, 
            weekDayDate: weekDates.find(item => item.day === course.week_day).date, // 获取对应日期
            list: [] 
          };
          acc.push(dayGroup);
        }
  
        // 将课程时间格式化为仅包含小时和分钟（例如：08:00）
        dayGroup.list.push({
          id: course.id,
          courseName: course.course_name,
          startTime: utils.formatTime(course.start_time),
          endTime: utils.formatTime(course.end_time),
          location: course.location,
        });
  
        return acc;
      }, []);
  
      // 排序：按周几顺序（1-7代表周一到周日）
      const sortedSchedules = formattedSchedules.sort((a, b) => {
        const weekDaysOrder = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        return weekDaysOrder.indexOf(a.weekDay) - weekDaysOrder.indexOf(b.weekDay);
      });
  
      return sortedSchedules;
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
}
}