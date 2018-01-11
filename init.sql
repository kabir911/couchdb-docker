grant all on *.* to 'root'@'%';
grant all privileges on *.* to 'admin'@'%' identified by 'admin' with grant option;
flush privileges;
create database ssd;
use ssd;
DROP TABLE IF EXISTS `trades`;
CREATE TABLE `trades` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `doc_id` varchar(1024) NOT NULL,
    `seq` varchar(1024) NOT NULL,
    `doc` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX docidx(`doc_id`),
    INDEX seqidx(`seq`)
) ENGINE=InnoDB;
DROP TABLE IF EXISTS `last_seq`;
CREATE TABLE `last_seq` (
    `seq` varchar(1024) NOT NULL
) ENGINE=InnoDB;
DROP TABLE IF EXISTS `last_seq_log`;
CREATE TABLE `last_seq_log` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,    
    `seq` varchar(1024) NOT NULL,
    `action` smallint NOT NULL DEFAULT 0,
    `action_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX seqidx(`seq`)    
) ENGINE=InnoDB;
INSERT INTO `last_seq` (seq) VALUES ('');

DROP TRIGGER IF EXISTS INSERT_last_seq;
DELIMITER //
CREATE TRIGGER INSERT_last_seq AFTER INSERT ON last_seq
FOR EACH ROW BEGIN
    INSERT INTO last_seq_log (seq, action) VALUES (NEW.seq, 0);
END//
DELIMITER ;

DROP TRIGGER IF EXISTS UPDATE_last_seq;
DELIMITER //
CREATE TRIGGER UPDATE_last_seq AFTER UPDATE ON last_seq
FOR EACH ROW BEGIN
    INSERT INTO last_seq_log (seq, action) VALUES (NEW.seq, 1);
END//
DELIMITER ;

DROP TRIGGER IF EXISTS DELETE_last_seq;
DELIMITER //
CREATE TRIGGER DELETE_last_seq AFTER DELETE ON last_seq
FOR EACH ROW BEGIN
    INSERT INTO last_seq_log (seq, action) VALUES (OLD.seq, 2);
END//
DELIMITER ;

