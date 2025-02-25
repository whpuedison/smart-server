-- 创建用户表（含字符集）
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    open_id VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建课程类型表
CREATE TABLE course_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 创建地点表（关键表，明确字符集）
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL  -- HEX格式如 #FF5733
);

-- 创建排课表
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    open_id VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    course_type_id INT NOT NULL,
    course_type_desc VARCHAR(255) NOT NULL,
    course_type_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (open_id) REFERENCES users(open_id),
    FOREIGN KEY (course_type_id) REFERENCES course_types(id)
);

INSERT INTO locations (description, color) VALUES
('绿地店', '#bcddbe'), 
('云玺店', '#f1ffff'), 
('之寓店', '#e8f5e9');

INSERT INTO course_types (description, price) VALUES
('瑜伽小班', 90),
('普拉提器械', 100);