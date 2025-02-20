CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- 用户的唯一标识
    open_id VARCHAR(255) NOT NULL UNIQUE,      -- 微信的 openid
    nickname VARCHAR(255),                    -- 用户的昵称
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 账户创建时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 最后更新时间
);

CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,            -- 排课的唯一标识
    open_id VARCHAR(255) NOT NULL,                  -- 关联到用户
    course_name VARCHAR(255) NOT NULL,             -- 课程名称
    start_time TIME NOT NULL,                      -- 课程开始时间
    end_time TIME NOT NULL,                        -- 课程结束时间
    week_day VARCHAR(255) NOT NULL,                         -- 上课的星期几（1-7代表周一到周日）
    location VARCHAR(255) NOT NULL,                -- 上课地点
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 最后更新时间
    FOREIGN KEY (open_id) REFERENCES users(open_id)  -- 关联到用户表
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- 打卡记录的唯一标识
    open_id VARCHAR(255) NOT NULL,                  -- 关联到用户
    schedule_id INT NOT NULL,                       -- 关联到具体的课程
    clock_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 打卡时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (open_id) REFERENCES users(open_id),  -- 关联到用户表
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) -- 关联到课程表
);

CREATE TABLE hourly_rate (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- 记录的唯一标识
    open_id VARCHAR(255) NOT NULL,              -- 关联到用户
    rate DECIMAL(10, 2) NOT NULL,              -- 课时费率
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 最后更新时间
    FOREIGN KEY (open_id) REFERENCES users(open_id) -- 关联到用户表
);
