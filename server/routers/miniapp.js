const router = require('koa-router')()
const miniappController = require('./../controllers/miniapp')

const routers = router
  .post('/auth/getUserInfo', miniappController.getUserInfo)
  .post('/schedule/addSchedule', miniappController.addSchedule)
  .get('/schedule/getScheduleList', miniappController.getScheduleList)
  .get('/schedule/getHistoryScheduleList', miniappController.getHistoryScheduleList)
  .post('/schedule/deleteSchedule', miniappController.deleteSchedule)
  .post('/schedule/editSchedule', miniappController.editSchedule)
  .get('/schedule/getLocationList', miniappController.getLocationList)
  .get('/schedule/getCourseTypeList', miniappController.getCourseTypeList)
  .post('/schedule/getWeekScheduleList', miniappController.getWeekScheduleList)

module.exports = routers

