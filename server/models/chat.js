const Mock = require('mockjs')

module.exports = {
    async chatList () {
        const result = Mock.mock({
            ['chats|20']: [
                {
                    'id|+1': 0,
                    'avatar': function() {
                        return Mock.Random.image('100x100', Mock.Random.color(), '#000000', 'Avatar');
                    }, // 生成头像图片的 URL，背景色为随机色
                    'nickname': '@cname', // 中文名字
                    'message': () => Mock.mock('@csentence(1, 20)')
                }
            ]
        })
        return result.chats;
    }
}