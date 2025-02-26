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
('之寓店', '#a7d5aa'),
('云玺店', '#f6db9c'), 
('绿地店', '#f5d7e3'), 
('大悦城店', '#bbbfe0'), 
('光谷新都店', '#a9d7ed'),
('高新四路店', '#f4afa9');

INSERT INTO course_types (description, price) VALUES
('瑜伽小班', 90),
('普拉提器械', 100),
('私教', 120);


INSERT INTO schedules (open_id,course_name,start_time,end_time,course_date,location,course_type_id,course_type_desc,course_type_price) VALUES
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '垫上维密塑型', '18:30:00', '19:30:00', '2025-02-14', '绿地店', 2, '瑜伽小班', 90),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '垫上减脂塑型', '19:40:00', '20:40:00', '2025-02-14', '绿地店', 2, '瑜伽小班', 90),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提蜜桃臀', '18:30:00', '19:30:00', '2025-02-18', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提折角腰', '19:40:00', '20:40:00', '2025-02-18', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提肩背', '18:30:00', '19:30:00', '2025-02-19', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提漫画腿', '19:40:00', '20:40:00', '2025-02-19', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '垫上维密塑型', '18:30:00', '19:30:00', '2025-02-21', '绿地店', 2, '瑜伽小班', 90),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '垫上大球瑜伽', '19:40:00', '20:40:00', '2025-02-21', '绿地店', 2, '瑜伽小班', 90),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提核心激活', '10:00:00', '11:00:00', '2025-02-22', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提铅笔腿', '15:00:00', '16:00:00', '2025-02-23', '云玺店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提A4腰', '18:30:00', '19:30:00', '2025-02-23', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提蜜桃臀', '19:40:00', '20:40:00', '2025-02-23', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '垫上大球瑜伽', '12:10:00', '13:10:00', '2025-02-24', '云玺店', 2, '瑜伽小班', 90),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提一字肩', '18:30:00', '19:30:00', '2025-02-24', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提折角腰', '19:40:00', '20:40:00', '2025-02-24', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提蜜桃臀', '18:30:00', '19:30:00', '2025-02-25', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '1V2私教', '19:40:00', '20:40:00', '2025-02-25', '之寓店', 3, '私教', 120),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提肩背', '18:30:00', '19:30:00', '2025-02-26', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提漫画腿', '19:40:00', '20:40:00', '2025-02-26', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '垫上维密塑型', '18:40:00', '19:40:00', '2025-02-28', '绿地店', 2, '瑜伽小班', 90),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '垫上大球瑜伽', '19:50:00', '20:50:00', '2025-02-28', '绿地店', 2, '瑜伽小班', 90),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提核心激活', '10:00:00', '11:00:00', '2025-03-01', '云玺店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '1V2私教', '14:00:00', '15:00:00', '2025-03-01', '之寓店', 3, '私教', 120),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提拜拜肉', '15:00:00', '16:00:00', '2025-03-01', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提折角腰', '18:30:00', '19:30:00', '2025-03-01', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提蜜桃臀', '19:40:00', '20:40:00', '2025-03-01', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提A4腰', '18:30:00', '19:30:00', '2025-03-02', '之寓店', 1, '普拉提器械', 100),
('oofUA5QgUj0jlMd_9BHlkhsoSbbk', '普拉提蜜桃臀', '19:40:00', '20:40:00', '2025-03-02', '之寓店', 1, '普拉提器械', 100);




