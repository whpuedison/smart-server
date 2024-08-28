const chatModel = require('./../models/chat')

module.exports = {
    async chatList() {
        const res = await chatModel.chatList()
        return res
    }
}