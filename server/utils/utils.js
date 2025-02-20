// 格式化时间，保留小时和分钟

module.exports = { 
    formatTime(time) {
        // 假设时间是 '08:00:00' 格式，返回 '08:00'
        return time.substring(0, 5); // 只取前 5 个字符 (小时:分钟)
    }
}