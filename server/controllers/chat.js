const chatService = require('./../services/chat')

module.exports = { 
     /**
     * 聊天列表
     * @param  {obejct} ctx 上下文对象
     */
    async getChatList (ctx) {
        let chatListResult = await chatService.chatList()
        const result = {}
        result.message = chatListResult || []
        result.code = 200
        ctx.body = result
    }
}