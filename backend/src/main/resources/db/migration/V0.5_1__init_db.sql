/*
 Navicat Premium Data Transfer

 Source Server         : basicai-alidev-mysql
 Source Server Type    : MySQL
 Source Server Version : 50736
 Source Host           : nlb.alidev.beisai.com:3306
 Source Schema         : x1_community

 Target Server Type    : MySQL
 Target Server Version : 50736
 File Encoding         : 65001

 Date: 27/08/2022 11:50:16
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for class
-- ----------------------------
DROP TABLE IF EXISTS `class`;
CREATE TABLE `class` (
                         `id` bigint(20) NOT NULL AUTO_INCREMENT,
                         `ontology_id` bigint(20) NOT NULL,
                         `name` varchar(256) NOT NULL,
                         `color` varchar(255) DEFAULT NULL,
                         `tool_type` enum('POLYGON','BOUNDING_BOX','POLYLINE','KEY_POINT','SEGMENTATION','CUBOID') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                         `tool_type_options` json DEFAULT NULL,
                         `attributes` json DEFAULT NULL,
                         `is_deleted` bit(1) NOT NULL DEFAULT b'0',
                         `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         `created_by` bigint(20) NOT NULL,
                         `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         `updated_by` bigint(20) DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         KEY `idx_ontology_id_name` (`ontology_id`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for classification
-- ----------------------------
DROP TABLE IF EXISTS `classification`;
CREATE TABLE `classification` (
                                  `id` bigint(20) NOT NULL AUTO_INCREMENT,
                                  `ontology_id` bigint(20) NOT NULL,
                                  `name` varchar(256) NOT NULL,
                                  `is_required` bit(1) NOT NULL,
                                  `input_type` enum('RADIO','TEXT','MULTI_SELECTION','DROPDOWN') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
                                  `options` json DEFAULT NULL,
                                  `is_deleted` bit(1) NOT NULL DEFAULT b'0',
                                  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  `created_by` bigint(20) NOT NULL,
                                  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                  `updated_by` bigint(20) DEFAULT NULL,
                                  PRIMARY KEY (`id`),
                                  KEY `idx_ontology_id_name` (`ontology_id`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for data
-- ----------------------------
DROP TABLE IF EXISTS `data`;
CREATE TABLE `data` (
                        `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
                        `dataset_id` bigint(20) DEFAULT NULL COMMENT '数据集ID',
                        `name` varchar(255) DEFAULT NULL COMMENT '数据名称',
                        `content` json DEFAULT NULL COMMENT '内容（文件夹路径、版本信息）',
                        `status` enum('INVALID','VALID') DEFAULT 'VALID' COMMENT '数据状态',
                        `annotation_status` enum('ANNOTATED','NOT_ANNOTATED','INVALID') DEFAULT 'NOT_ANNOTATED' COMMENT '数据标注状态',
                        `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
                        `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
                        `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                        `updated_by` bigint(20) DEFAULT NULL COMMENT '更改人ID',
                        PRIMARY KEY (`id`) USING BTREE,
                        KEY `idx_dataset_id_type_created_at` (`dataset_id`,`created_at`) USING BTREE,
                        KEY `idx_dataset_id_type_annotation_count` (`dataset_id`) USING BTREE,
                        KEY `idx_dataset_id_type` (`dataset_id`) USING BTREE,
                        KEY `idx_dataset_id_type_num_created_at` (`dataset_id`,`created_at`) USING BTREE,
                        KEY `idx_dataset_id_type_num_annotation_count` (`dataset_id`) USING BTREE,
                        KEY `idx_dataset_id_type_name` (`dataset_id`,`name`) USING BTREE,
                        KEY `idx_dataset_id_type_num_name` (`dataset_id`,`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3090434 DEFAULT CHARSET=utf8mb4 COMMENT='数据';

-- ----------------------------
-- Table structure for data_annotation
-- ----------------------------
DROP TABLE IF EXISTS `data_annotation`;
CREATE TABLE `data_annotation` (
                                   `id` bigint(20) NOT NULL AUTO_INCREMENT,
                                   `dataset_id` bigint(20) DEFAULT NULL,
                                   `data_id` bigint(20) DEFAULT NULL,
                                   `classification_id` bigint(20) DEFAULT NULL,
                                   `classification_attributes` json DEFAULT NULL,
                                   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                                   `created_by` bigint(20) DEFAULT NULL,
                                   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   `updated_by` bigint(20) DEFAULT NULL,
                                   PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for data_annotation_object
-- ----------------------------
DROP TABLE IF EXISTS `data_annotation_object`;
CREATE TABLE `data_annotation_object` (
                                          `id` bigint(20) NOT NULL AUTO_INCREMENT,
                                          `dataset_id` bigint(20) DEFAULT NULL,
                                          `data_id` bigint(20) DEFAULT NULL,
                                          `class_id` bigint(20) DEFAULT NULL,
                                          `class_attributes` json DEFAULT NULL,
                                          `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                                          `created_by` bigint(20) DEFAULT NULL,
                                          `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                          `updated_by` bigint(20) DEFAULT NULL,
                                          PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for data_annotation_record
-- ----------------------------
DROP TABLE IF EXISTS `data_annotation_record`;
CREATE TABLE `data_annotation_record` (
                                          `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
                                          `dataset_id` bigint(20) NOT NULL COMMENT '数据集id',
                                          `serial_no` bigint(20) DEFAULT NULL COMMENT '流水号',
                                          `created_by` bigint(20) DEFAULT NULL COMMENT '创建者',
                                          `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                          PRIMARY KEY (`id`) USING BTREE,
                                          UNIQUE KEY `uk_dataset_id_created_by` (`dataset_id`,`created_by`) USING BTREE COMMENT 'dataset_id,created_by唯一索引'
) ENGINE=InnoDB AUTO_INCREMENT=60875 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='dataset锁定记录';

-- ----------------------------
-- Table structure for data_edit
-- ----------------------------
DROP TABLE IF EXISTS `data_edit`;
CREATE TABLE `data_edit` (
                             `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
                             `annotation_record_id` bigint(20) DEFAULT NULL COMMENT '标注记录表',
                             `dataset_id` bigint(20) NOT NULL COMMENT '数据集id',
                             `data_id` bigint(20) NOT NULL COMMENT '数据id',
                             `model_id` bigint(20) DEFAULT NULL COMMENT '模型id',
                             `model_version` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '模型版本',
                             `created_by` bigint(20) NOT NULL COMMENT '创建者',
                             `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                             PRIMARY KEY (`id`) USING BTREE,
                             UNIQUE KEY `uk_data_id` (`data_id`) USING BTREE COMMENT 'data_id唯一索引'
) ENGINE=InnoDB AUTO_INCREMENT=67941 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='data锁定表';

-- ----------------------------
-- Table structure for dataset
-- ----------------------------
DROP TABLE IF EXISTS `dataset`;
CREATE TABLE `dataset` (
                           `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
                           `name` varchar(255) NOT NULL COMMENT '数据集名称',
                           `type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE') NOT NULL DEFAULT 'LIDAR_FUSION' COMMENT '数据类型',
                           `description` text COMMENT '描述',
                           `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
                           `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                           `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
                           `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                           `updated_by` bigint(20) DEFAULT NULL COMMENT '更改人ID',
                           PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=750011 DEFAULT CHARSET=utf8mb4 COMMENT='数据集';

-- ----------------------------
-- Table structure for dataset_class
-- ----------------------------
DROP TABLE IF EXISTS `dataset_class`;
CREATE TABLE `dataset_class` (
                                 `id` bigint(20) NOT NULL AUTO_INCREMENT,
                                 `class_id` bigint(20) DEFAULT NULL,
                                 `ontology_id` bigint(20) DEFAULT NULL,
                                 `dataset_id` bigint(20) NOT NULL,
                                 `name` varchar(256) NOT NULL,
                                 `color` varchar(255) DEFAULT NULL,
                                 `tool_type` enum('POLYGON','BOUNDING_BOX','POLYLINE','KEY_POINT','SEGMENTATION','CUBOID') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                                 `tool_type_options` json DEFAULT NULL,
                                 `attributes` json DEFAULT NULL,
                                 `is_deleted` bit(1) NOT NULL DEFAULT b'0',
                                 `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 `created_by` bigint(20) DEFAULT NULL,
                                 `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 `updated_by` bigint(20) DEFAULT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `idx_dataset_id_name` (`dataset_id`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for dataset_classification
-- ----------------------------
DROP TABLE IF EXISTS `dataset_classification`;
CREATE TABLE `dataset_classification` (
                                          `id` bigint(20) NOT NULL AUTO_INCREMENT,
                                          `classification_id` bigint(20) DEFAULT NULL,
                                          `ontology_id` bigint(20) DEFAULT NULL,
                                          `dataset_id` bigint(20) NOT NULL,
                                          `name` varchar(256) NOT NULL,
                                          `is_required` bit(1) NOT NULL,
                                          `input_type` enum('RADIO','TEXT','MULTI_SELECTION','DROPDOWN') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
                                          `options` json DEFAULT NULL,
                                          `is_deleted` bit(1) NOT NULL DEFAULT b'0',
                                          `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                          `created_by` bigint(20) DEFAULT NULL,
                                          `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                          `updated_by` bigint(20) DEFAULT NULL,
                                          PRIMARY KEY (`id`),
                                          KEY `idx_dataset_id_name` (`dataset_id`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for export_record
-- ----------------------------
DROP TABLE IF EXISTS `export_record`;
CREATE TABLE `export_record` (
                                 `id` bigint(20) NOT NULL AUTO_INCREMENT,
                                 `serial_number` bigint(40) NOT NULL COMMENT '流水号',
                                 `file_id` bigint(20) DEFAULT NULL COMMENT '文件ID',
                                 `file_name` varchar(100) DEFAULT NULL COMMENT '文件名称',
                                 `generated_num` int(11) DEFAULT '0' COMMENT '已生成数量',
                                 `total_num` int(11) DEFAULT NULL COMMENT '总数',
                                 `status` enum('UNSTARTED','GENERATING','COMPLETED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT 'UNSTARTED' COMMENT '状态(UNSTARTED:未开始,GENERATING:生成中,COMPLETED:已完成,FAILED:失败)',
                                 `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
                                 `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                 `updated_by` bigint(20) DEFAULT NULL COMMENT '更改人ID',
                                 PRIMARY KEY (`id`) USING BTREE,
                                 UNIQUE KEY `unx_serial_number` (`serial_number`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=480017 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for file
-- ----------------------------
DROP TABLE IF EXISTS `file`;
CREATE TABLE `file` (
                        `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
                        `name` varchar(255) NOT NULL COMMENT '文件名称（上传后的新名称）',
                        `original_name` varchar(255) NOT NULL COMMENT '原名称',
                        `path` varchar(1000) NOT NULL COMMENT '文件上传后的路径（相对路径）',
                        `type` varchar(50) DEFAULT NULL COMMENT '文件类型MIME',
                        `size` bigint(20) DEFAULT NULL COMMENT '文件大小',
                        `bucket_name` varchar(50) DEFAULT NULL COMMENT '文件存储的桶名称',
                        `created_at` datetime DEFAULT NULL COMMENT '创建时间',
                        `created_by` bigint(20) DEFAULT NULL COMMENT '创建人ID',
                        `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                        `updated_by` bigint(20) DEFAULT NULL COMMENT '更改人ID',
                        `relation_id` bigint(20) DEFAULT NULL COMMENT '关联原始文件ID',
                        `relation` enum('LARGE_THUMBTHUMBNAIL','MEDIUM_THUMBTHUMBNAIL','SMALL_THUMBTHUMBNAIL','BINARY','BINARY_COMPRESSED','POINT_CLOUD_RENDER_IMAGE') CHARACTER SET utf8 DEFAULT NULL COMMENT '关联关系',
                        `path_hash` bigint(64) DEFAULT NULL COMMENT 'path hash值',
                        `extra_info` json DEFAULT NULL COMMENT '文件扩展信息',
                        PRIMARY KEY (`id`) USING BTREE,
                        UNIQUE KEY `idx_path_hash` (`path_hash`) USING BTREE,
                        KEY `idx_relation_id` (`relation_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=571 DEFAULT CHARSET=utf8mb4 COMMENT='文件表';

-- ----------------------------
-- Table structure for model
-- ----------------------------
DROP TABLE IF EXISTS `model`;
CREATE TABLE `model` (
                         `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
                         `name` varchar(255) NOT NULL COMMENT '模型名称',
                         `version` varchar(255) NOT NULL COMMENT '模型版本',
                         `description` text COMMENT '描述',
                         `scenario` varchar(128) DEFAULT NULL COMMENT '场景',
                         `classes` json DEFAULT NULL COMMENT 'class类',
                         `dataset_type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE') DEFAULT NULL,
                         `model_code` enum('PRE_LABEL','COCO_80') DEFAULT NULL,
                         `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
                         `created_at` datetime NOT NULL,
                         `created_by` bigint(20) NOT NULL,
                         `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                         `updated_by` bigint(20) DEFAULT NULL,
                         PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30005 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for model_job
-- ----------------------------
DROP TABLE IF EXISTS `model_job`;
CREATE TABLE `model_job` (
                             `id` bigint(20) NOT NULL AUTO_INCREMENT,
                             `model_serial_no` bigint(20) NOT NULL COMMENT '模型运行流水号',
                             `model_code` enum('PRE_LABEL','COCO80') NOT NULL COMMENT '模型编码',
                             `job_params` json DEFAULT NULL COMMENT 'job参数',
                             `job_status` enum('COMMITED','RUNNING','DONE','FAILED') NOT NULL COMMENT '任务状态',
                             `created_at` datetime NOT NULL COMMENT '创建时间',
                             `created_by` bigint(20) NOT NULL COMMENT '创建者',
                             `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                             `updated_by` bigint(20) DEFAULT NULL COMMENT '更新者',
                             PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for ontology
-- ----------------------------
DROP TABLE IF EXISTS `ontology`;
CREATE TABLE `ontology` (
                            `id` bigint(20) NOT NULL AUTO_INCREMENT,
                            `name` varchar(256) NOT NULL,
                            `type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'dataset type',
                            `is_deleted` bit(1) NOT NULL DEFAULT b'0',
                            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            `created_by` bigint(20) NOT NULL,
                            `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            `updated_by` bigint(20) DEFAULT NULL,
                            `is_default` bit(1) DEFAULT NULL,
                            PRIMARY KEY (`id`),
                            KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=480003 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
                        `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
                        `username` varchar(64) DEFAULT NULL COMMENT 'login username',
                        `password` varchar(64) NOT NULL DEFAULT '' COMMENT 'encode password',
                        `nickname` varchar(50) DEFAULT NULL COMMENT 'user nickname',
                        `avatar_id` bigint(20) DEFAULT NULL COMMENT 'avatar id. file table primary key',
                        `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'user created time',
                        `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'user updated time',
                        `last_login_at` datetime DEFAULT NULL COMMENT 'last login time',
                        `status` enum('NORMAL','FORBIDDEN') DEFAULT 'NORMAL',
                        PRIMARY KEY (`id`) USING BTREE,
                        UNIQUE KEY `uniq_username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COMMENT='user table';

SET FOREIGN_KEY_CHECKS = 1;
