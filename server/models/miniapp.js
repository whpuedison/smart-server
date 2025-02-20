const dbUtils = require('./../utils/db-util')

const miniapp = {
     // 检查用户是否存在，如果不存在则插入用户数据
     async addUserIfNotExist(openid, nickname) {
        try {
            // 查询用户是否存在
            const existingUser = await dbUtils.findDataById('users', openid);
            if (!existingUser || existingUser.length === 0) {
                // 用户不存在，插入新用户
                const newUser = { 'open_id': openid };
                await dbUtils.insertData('users', newUser);
            }
        } catch (error) {
            throw new Error('添加用户失败: ' + error.message);
        }
    },
    // 创建新课程
    async addSchedule(model) {
        try {
        // 调用通用的插入方法
        const result = await dbUtils.insertData('schedules', model);
        return result;
        } catch (error) {
        throw new Error('课程创建失败: ' + error.message);
        }
    },

    // 获取排课列表
    async getScheduleList(openid) {
        try {
            // 从数据库查询排课信息
            const schedules = await dbUtils.findDataById('schedules', openid);
            
            // 如果没有课程安排，返回空数组
            if (!schedules || schedules.length === 0) {
                return [];
            }
            
            // 返回查询到的排课数据，无需排序，交由 server 层处理
            return schedules;
        } catch (error) {
            throw new Error('获取排课列表失败: ' + error.message);
        }
    },

    // 删除课程
    async deleteScheduleById(id) {
        try {
            console.log(typeof id, id)
            const result = await dbUtils.deleteData('schedules', id);
            console.log(result);
            // 判断删除结果
            if (result.affectedRows > 0) {
                return true
            } else {
                throw new Error('课程删除失败');
            }
        } catch (error) {
            throw new Error('删除课程失败: ' + error.message);
        }
    }
}


module.exports = miniapp
