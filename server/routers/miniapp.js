const router = require('koa-router')()
const chatController = require('./../controllers/miniapp')

const routers = router
  .post('/auth/getUserInfo', chatController.getUserInfo)
  .post('/schedule/addSchedule', chatController.addSchedule)
  .get('/schedule/getScheduleList', chatController.getScheduleList)
  .post('/schedule/deleteSchedule', chatController.deleteSchedule)

module.exports = routers

