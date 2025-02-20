const miniappService = require('./../services/miniapp')

module.exports = { 
    /**
     * 获取用户信息
     * @param  {object} ctx 上下文对象
     */
    async getUserInfo(ctx) {
        const { code } = ctx.request.body;

        try {
            // 调用 miniappService 获取用户信息
            let userInfoResult = await miniappService.getUserInfo(code);
            
            // 构造返回结果
            const result = {
                data: userInfoResult || {},
                code: 200
            };
            ctx.body = result;
        } catch (error) {
            // 错误处理
            console.error('获取用户信息失败:', error);
            ctx.status = 500; // 设置 HTTP 状态码为 500
            ctx.body = {
                code: 500,
                message: '服务器内部错误，请稍后再试',
                error: error.message || '未知错误'
            };
        }
    },

     /**
     * 新增课程
     * @param {object} ctx 上下文对象
     */
     async addSchedule(ctx) {
        const { courseName, weekValue, startTime, endTime, location } = ctx.request.body;

        console.log('ctx.request.body', ctx.request.body)
         // 从请求头中获取 openid
        const openid = ctx.headers.openid;

        // 如果没有提供 openid，则返回错误
        if (!openid) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: 'openid 未提供'
            };
            return;
        }
        // 将课程信息存入数据库
        try {
            const result = await miniappService.addSchedule({
                open_id: openid,
                course_name: courseName,
                week_day: weekValue,
                start_time: startTime,
                end_time: endTime,
                location
            });

            // 返回新增成功的结果
            ctx.body = {
                code: 200,
                message: '课程新增成功'
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '课程新增失败',
                error: error.message
            };
        }
    },

      /**
     * 获取用户的排课列表
     * @param {object} ctx 上下文对象
     */
      async getScheduleList(ctx) {
        // 从请求头中获取 openid
        const openid = ctx.headers.openid;

        // 如果没有提供 openid，则返回错误
        if (!openid) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: 'openid 未提供'
            };
            return;
        }

        try {
            // 调用 miniappService 获取排课列表
            const scheduleList = await miniappService.getScheduleList(openid);

            // 返回排课列表
            ctx.body = {
                code: 200,
                message: '获取排课列表成功',
                data: scheduleList
            };
        } catch (error) {
            // 错误处理
            console.error('获取排课列表失败:', error);
            ctx.status = 500; // 设置 HTTP 状态码为 500
            ctx.body = {
                code: 500,
                message: '服务器内部错误，请稍后再试',
                error: error.message || '未知错误'
            };
        }
    },

     // 删除课程
     async deleteSchedule(ctx) {
        // 从请求体获取课程ID和openid
        const { scheduleId } = ctx.request.body;
        const openid = ctx.headers.openid;

        // 如果没有提供课程ID或openid，则返回错误
        if (!scheduleId || !openid) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                message: '课程ID或openid 未提供'
            };
            return;
        }

        try {
            // 调用 miniappService 删除课程
            await miniappService.deleteSchedule(scheduleId, openid);

            // 返回成功响应
            ctx.body = {
                code: 200,
                message: '课程删除成功'
            };
        } catch (error) {
            // 错误处理
            console.error('删除课程失败:', error);
            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '删除课程失败',
                error: error.message || '未知错误'
            };
        }
    }
};
