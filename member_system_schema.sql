/* === 1. 建立（或切換到）專案資料庫 === */
CREATE DATABASE IF NOT EXISTS `member_system`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `member_system`;

/* === 2. 使用者表（帳號／權限） === */
CREATE TABLE `users` (
  `user_id`       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,            -- PK：系統內部流水號
  `username`      VARCHAR(50)  NOT NULL UNIQUE,                       -- 登入帳號（唯一）
  `password_hash` VARCHAR(255) NOT NULL,                              -- 密碼雜湊（bcrypt）
  `role`          ENUM('admin','user') NOT NULL DEFAULT 'user',       -- 角色權限
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* === 3. 會員資料表（對應 add_member / edit_member / admin_dashboard） ===
   流水號 seq 由觸發器自動產生，每種 member_type 各自累加
   member_id 為 STORED 產生欄位：
      VIP →  'VIP0001'、Regular → 'R0001'  */
CREATE TABLE `members` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,           -- PK
  `user_id`      INT UNSIGNED NOT NULL,                             -- 擁有者（FK→users）
  `name`         VARCHAR(100) NOT NULL,
  `email`        VARCHAR(100) NOT NULL,
  `member_type`  ENUM('VIP','Regular') NOT NULL DEFAULT 'Regular',
  `seq`          INT UNSIGNED NOT NULL,                             -- 由 trigger 填入
  `member_id`    VARCHAR(7)
        GENERATED ALWAYS AS (
          CASE
            WHEN `member_type`='VIP'
              THEN CONCAT('VIP', LPAD(`seq`,4,'0'))
            ELSE CONCAT('R',  LPAD(`seq`,4,'0'))
          END) STORED UNIQUE,
  `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (`member_type`,`seq`),
  CONSTRAINT `fk_members_user`
      FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* === 4. 依會員類型自動遞增 seq === */
DELIMITER //
CREATE TRIGGER trg_members_set_seq
BEFORE INSERT ON members
FOR EACH ROW
BEGIN
  DECLARE lastSeq INT DEFAULT 0;
  SELECT COALESCE(MAX(`seq`),0) INTO lastSeq
    FROM `members`
    WHERE `member_type` = NEW.`member_type`;
  SET NEW.`seq` = lastSeq + 1;
END//
DELIMITER ;

/* === 5. 可選：預先建立一組管理者帳號（帳/密：admin / admin123）=== */
INSERT INTO `users` (`username`,`password_hash`,`role`)
VALUES ('admin',
        '$2y$10$ijcIhX1lBOAAbp5iKw2jQeU48HwOrsZ6O/uhhMldBn8MYN4mcXovW',  -- 密碼 admin123
        'admin');

-- login_attempts：追蹤每次登入嘗試
CREATE TABLE IF NOT EXISTS login_attempts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(50)  NOT NULL,
  ip_address   VARBINARY(16) NOT NULL,
  attempted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  success      TINYINT(1)   NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- auth_tokens：Remember-Me（雙 token）表
CREATE TABLE IF NOT EXISTS auth_tokens (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  selector       CHAR(12)     NOT NULL UNIQUE,
  validator_hash CHAR(64)     NOT NULL,
  expires_at     DATETIME     NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;