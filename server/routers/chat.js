const router = require('koa-router')()
const chatController = require('./../controllers/chat')

const routers = router
  .get('/list', chatController.getChatList)

module.exports = routers

