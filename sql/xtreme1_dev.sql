/*
 Navicat Premium Dump SQL

 Source Server         : xtreme1
 Source Server Type    : MySQL
 Source Server Version : 80035 (8.0.35)
 Source Host           : 192.168.200.157:3306
 Source Schema         : xtreme1_dev

 Target Server Type    : MySQL
 Target Server Version : 80035 (8.0.35)
 File Encoding         : 65001

 Date: 07/03/2025 18:49:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for class
-- ----------------------------
DROP TABLE IF EXISTS `class`;
CREATE TABLE `class`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ontology_id` bigint NOT NULL,
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `tool_type` enum('POLYGON','BOUNDING_BOX','POLYLINE','KEY_POINT','SEGMENTATION','CUBOID') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tool_type_options` json NULL,
  `attributes` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NOT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_ontology_id_name_tool_type`(`ontology_id` ASC, `name` ASC, `tool_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 42 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '本体-标签' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for classification
-- ----------------------------
DROP TABLE IF EXISTS `classification`;
CREATE TABLE `classification`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ontology_id` bigint NOT NULL,
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_required` bit(1) NOT NULL DEFAULT b'0',
  `input_type` enum('RADIO','TEXT','MULTI_SELECTION','DROPDOWN','LONG_TEXT') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `attribute` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NOT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_ontology_id_name`(`ontology_id` ASC, `name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '本体-分类' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for data
-- ----------------------------
DROP TABLE IF EXISTS `data`;
CREATE TABLE `data`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `dataset_id` bigint NULL DEFAULT NULL COMMENT 'Dataset id',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Data name',
  `order_name` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Sort data name',
  `content` json NULL COMMENT 'Content (folder path, version information)',
  `type` enum('SINGLE_DATA','SCENE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'SINGLE_DATA' COMMENT 'Type (indicates continuous frames, non-consecutive frames)',
  `parent_id` bigint NOT NULL DEFAULT 0 COMMENT 'Parent ID (Scene ID)',
  `status` enum('INVALID','VALID') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'VALID' COMMENT 'Data status INVALID,VALID',
  `annotation_status` enum('ANNOTATED','NOT_ANNOTATED','INVALID') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'NOT_ANNOTATED' COMMENT 'Data annotation status ANNOTATED, NOT_ANNOTATED, INVALID',
  `split_type` enum('TRAINING','VALIDATION','TEST','NOT_SPLIT') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'NOT_SPLIT' COMMENT 'Split type',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT 'Is deleted',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT 'Delete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dataset_id_type_parent_id_name`(`dataset_id` ASC, `type` ASC, `parent_id` ASC, `name` ASC, `del_unique_key` ASC) USING BTREE,
  INDEX `idx_dataset_id_created_at`(`dataset_id` ASC, `created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 31883 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Data' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for data_annotation_classification
-- ----------------------------
DROP TABLE IF EXISTS `data_annotation_classification`;
CREATE TABLE `data_annotation_classification`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dataset_id` bigint NULL DEFAULT NULL,
  `data_id` bigint NULL DEFAULT NULL,
  `classification_id` bigint NULL DEFAULT NULL,
  `classification_attributes` json NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for data_annotation_object
-- ----------------------------
DROP TABLE IF EXISTS `data_annotation_object`;
CREATE TABLE `data_annotation_object`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dataset_id` bigint NULL DEFAULT NULL COMMENT 'Dataset ID',
  `data_id` bigint NULL DEFAULT NULL COMMENT 'Data ID',
  `class_id` bigint NULL DEFAULT NULL COMMENT 'Class ID',
  `class_attributes` json NULL COMMENT 'Class Attributes',
  `source_type` enum('DATA_FLOW','IMPORTED','MODEL') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'DATA_FLOW' COMMENT 'Source type',
  `source_id` bigint NULL DEFAULT -1 COMMENT 'Source ID 模型运行记录ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 309321 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for data_annotation_record
-- ----------------------------
DROP TABLE IF EXISTS `data_annotation_record`;
CREATE TABLE `data_annotation_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `dataset_id` bigint NOT NULL COMMENT 'Dataset id',
  `item_type` enum('SINGLE_DATA','SCENE') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'SINGLE_DATA' COMMENT 'Type (indicates continuous frames, non-consecutive frames)',
  `serial_no` bigint NULL DEFAULT NULL COMMENT 'Serial number',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dataset_id_created_by`(`dataset_id` ASC, `created_by` ASC) USING BTREE COMMENT 'dataset_id,created_by unique index'
) ENGINE = InnoDB AUTO_INCREMENT = 2731 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Data annotation record' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for data_classification_option
-- ----------------------------
DROP TABLE IF EXISTS `data_classification_option`;
CREATE TABLE `data_classification_option`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `dataset_id` bigint NOT NULL COMMENT 'Dataset id',
  `data_id` bigint NOT NULL COMMENT 'Data id',
  `classification_id` bigint NOT NULL COMMENT 'Classification_id',
  `attribute_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'The attribute id of classification',
  `option_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'The option name of classification',
  `option_path` json NOT NULL COMMENT 'The path of selected options of classification',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NOT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_attribute_id`(`attribute_id` ASC) USING BTREE,
  INDEX `idx_dataset_id`(`dataset_id` ASC) USING BTREE,
  INDEX `idx_data_id`(`data_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for data_edit
-- ----------------------------
DROP TABLE IF EXISTS `data_edit`;
CREATE TABLE `data_edit`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `annotation_record_id` bigint NULL DEFAULT NULL COMMENT 'Data annotation record id',
  `dataset_id` bigint NOT NULL COMMENT 'Dataset id',
  `scene_id` bigint NULL DEFAULT NULL COMMENT 'Scene id',
  `data_id` bigint NOT NULL COMMENT 'Data id',
  `model_id` bigint NULL DEFAULT NULL COMMENT 'Model id',
  `model_version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT 'Model version',
  `created_by` bigint NOT NULL COMMENT 'Creator id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_data_id`(`data_id` ASC) USING BTREE COMMENT 'data_id unique index'
) ENGINE = InnoDB AUTO_INCREMENT = 381064 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Data edit' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for dataset
-- ----------------------------
DROP TABLE IF EXISTS `dataset`;
CREATE TABLE `dataset`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Dataset name',
  `type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE','TEXT') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'LIDAR_FUSION' COMMENT 'Dataset type LIDAR_FUSION,LIDAR_BASIC,IMAGE,TEXT',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Dataset description',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT 'Is deleted',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT 'Delete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 75 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '数据集' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for dataset_class
-- ----------------------------
DROP TABLE IF EXISTS `dataset_class`;
CREATE TABLE `dataset_class`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dataset_id` bigint NOT NULL,
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `tool_type` enum('POLYGON','BOUNDING_BOX','POLYLINE','KEY_POINT','SEGMENTATION','CUBOID') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tool_type_options` json NULL,
  `attributes` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dataset_id_name`(`dataset_id` ASC, `name` ASC, `tool_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 336 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for dataset_class_ontology
-- ----------------------------
DROP TABLE IF EXISTS `dataset_class_ontology`;
CREATE TABLE `dataset_class_ontology`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dataset_class_id` bigint NOT NULL COMMENT 'id of class in dataset',
  `ontology_id` bigint NOT NULL COMMENT 'id of related ontology ',
  `class_id` bigint NOT NULL COMMENT 'id of related class in ontology',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NOT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dataset_class_id`(`dataset_class_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 347 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Class association table in dataset class and ontology' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for dataset_classification
-- ----------------------------
DROP TABLE IF EXISTS `dataset_classification`;
CREATE TABLE `dataset_classification`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dataset_id` bigint NOT NULL,
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_required` bit(1) NOT NULL DEFAULT b'0',
  `input_type` enum('RADIO','TEXT','MULTI_SELECTION','DROPDOWN','LONG_TEXT') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `target` enum('DATA','CONSECUTIVE_FRAMES') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类目标(DATA:数据，CONSECUTIVE_FRAMES:连续帧)',
  `attribute` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dataset_id_name`(`dataset_id` ASC, `name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for dataset_similarity_job
-- ----------------------------
DROP TABLE IF EXISTS `dataset_similarity_job`;
CREATE TABLE `dataset_similarity_job`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dataset_id` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NOT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dataset_id`(`dataset_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 517 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for dataset_similarity_record
-- ----------------------------
DROP TABLE IF EXISTS `dataset_similarity_record`;
CREATE TABLE `dataset_similarity_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dataset_id` bigint NOT NULL,
  `serial_number` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('COMPLETED','ERROR','SUBMITTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` enum('FULL','INCREMENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `data_info` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NOT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_dataset_id`(`dataset_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1762 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for export_record
-- ----------------------------
DROP TABLE IF EXISTS `export_record`;
CREATE TABLE `export_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `serial_number` bigint NOT NULL COMMENT 'Serial number',
  `file_id` bigint NULL DEFAULT NULL COMMENT 'File id',
  `file_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'File name',
  `generated_num` int NULL DEFAULT 0 COMMENT 'Generated number',
  `total_num` int NULL DEFAULT NULL COMMENT 'Export total number',
  `status` enum('UNSTARTED','GENERATING','COMPLETED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'UNSTARTED' COMMENT 'Export status(UNSTARTED,GENERATING,COMPLETED,FAILED)',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unx_serial_number`(`serial_number` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 140 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for file
-- ----------------------------
DROP TABLE IF EXISTS `file`;
CREATE TABLE `file`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'File name',
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'File original name',
  `path` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'File upload path',
  `path_hash` bigint NULL DEFAULT NULL COMMENT 'Hash value after path MD5',
  `zip_path` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'The path in the compressed package',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'File type',
  `size` bigint NULL DEFAULT NULL COMMENT 'File size',
  `bucket_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Bucket name',
  `relation_id` bigint NULL DEFAULT NULL COMMENT 'Relation file id',
  `relation` enum('LARGE_THUMBTHUMBNAIL','MEDIUM_THUMBTHUMBNAIL','SMALL_THUMBTHUMBNAIL','BINARY','BINARY_COMPRESSED','POINT_CLOUD_RENDER_IMAGE') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT 'Relation(LARGE_THUMBTHUMBNAIL, MEDIUM_THUMBTHUMBNAIL,SMALL_THUMBTHUMBNAIL,BINARY,BINARY_COMPRESSED)',
  `extra_info` json NULL COMMENT 'File extension information',
  `created_at` datetime NULL DEFAULT NULL COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_path_hash`(`path_hash` ASC) USING BTREE,
  INDEX `idx_relation_id`(`relation_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 187881 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'File table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for model
-- ----------------------------
DROP TABLE IF EXISTS `model`;
CREATE TABLE `model`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `scenario` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Scenes',
  `dataset_type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE','LIDAR') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Dataset types supported by this model',
  `model_type` enum('DETECTION') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'DETECTION' COMMENT 'Model type',
  `model_code` enum('PRE_LABEL','COCO_80','LIDAR_DETECTION','IMAGE_DETECTION') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Model\'s unique identifier',
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Model run url',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NOT NULL,
  `created_by` bigint NOT NULL,
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name_dataset_type`(`name` ASC, `dataset_type` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '模型' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for model_class
-- ----------------------------
DROP TABLE IF EXISTS `model_class`;
CREATE TABLE `model_class`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `model_id` bigint NOT NULL COMMENT 'Model ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Name',
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Model code',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NOT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_model_id_code`(`model_id` ASC, `code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 237 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '模型-标签' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for model_data_result
-- ----------------------------
DROP TABLE IF EXISTS `model_data_result`;
CREATE TABLE `model_data_result`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `model_id` bigint NOT NULL COMMENT 'Model id',
  `model_version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT 'Model version',
  `dataset_id` bigint NOT NULL COMMENT 'Dataset id',
  `data_id` bigint NOT NULL COMMENT 'Data id',
  `model_serial_no` bigint NULL DEFAULT NULL COMMENT 'Serial number',
  `result_filter_param` json NULL COMMENT 'Model results filtering parameters',
  `model_result` json NULL COMMENT 'The result returned by running the model',
  `created_at` datetime NOT NULL COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_model_serial_no_data_id`(`model_serial_no` ASC, `data_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 42645 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Data model result' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for model_dataset_result
-- ----------------------------
DROP TABLE IF EXISTS `model_dataset_result`;
CREATE TABLE `model_dataset_result`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `model_id` bigint NOT NULL COMMENT 'Model id',
  `model_version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Model version',
  `run_record_id` bigint NOT NULL COMMENT 'Model run record id',
  `run_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Serial number(For interface display)',
  `dataset_id` bigint NOT NULL COMMENT 'Dataset ID',
  `data_id` bigint NOT NULL COMMENT 'Data ID',
  `model_serial_no` bigint NULL DEFAULT NULL COMMENT 'Serial number',
  `result_filter_param` json NULL COMMENT 'Model results filtering parameters',
  `model_result` json NULL COMMENT 'Model result',
  `data_confidence` decimal(4, 2) NULL DEFAULT NULL COMMENT 'Data confdence',
  `is_success` bit(1) NOT NULL DEFAULT b'1' COMMENT 'Whether succeed',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Error message',
  `created_at` datetime NOT NULL COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_model_serial_no_data_id`(`model_serial_no` ASC, `data_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3070 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'dataset model results table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for model_run_record
-- ----------------------------
DROP TABLE IF EXISTS `model_run_record`;
CREATE TABLE `model_run_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `model_id` bigint NOT NULL COMMENT 'Model id',
  `model_version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Model version',
  `run_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Serial number(For interface display)',
  `dataset_id` bigint NOT NULL COMMENT 'Dataset id',
  `status` enum('STARTED','RUNNING','SUCCESS','FAILURE','SUCCESS_WITH_ERROR') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Model running status',
  `error_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Model run error reason',
  `result_filter_param` json NULL COMMENT 'Model results filtering parameters',
  `data_filter_param` json NULL COMMENT 'Data filtering parameters',
  `run_record_type` enum('IMPORTED','RUNS') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'RUNS' COMMENT 'Model run record type',
  `model_serial_no` bigint NULL DEFAULT NULL COMMENT 'Serial number',
  `data_count` bigint NULL DEFAULT NULL COMMENT 'Data count',
  `metrics` json NULL COMMENT 'Model metrics',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT 'Is deleted',
  `created_at` datetime NOT NULL COMMENT 'Create time',
  `created_by` bigint NOT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_model_serial_no`(`model_serial_no` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 107 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '模型-数据集运行记录' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for ontology
-- ----------------------------
DROP TABLE IF EXISTS `ontology`;
CREATE TABLE `ontology`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'dataset type',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint NOT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name_type`(`name` ASC, `type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '本体' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `code` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目编号',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目名称',
  `type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LIDAR_FUSION' COMMENT '数据类型(LIDAR_FUSION:点云融合，LIDAR_BASIC:点云基础，IMAGE:图片)',
  `description` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '描述',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `creator` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '创建者',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for project_user_task
-- ----------------------------
DROP TABLE IF EXISTS `project_user_task`;
CREATE TABLE `project_user_task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `user_id` bigint NOT NULL COMMENT '用户id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `is_creator` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否是创建人(0-否，1-是)',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目、人员、任务关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for quality_rule
-- ----------------------------
DROP TABLE IF EXISTS `quality_rule`;
CREATE TABLE `quality_rule`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '规则描述',
  `enable` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否启用(0-否，1-是)',
  `requirement` enum('MANDATORY','WARNING','INFO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO' COMMENT '要求(MANDATORY:强制，WARNING:警告，INFO:信息)',
  `dimension` enum('COMPLETENESS','UNIQUENESS','VALIDITY','CONSISTENCY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETENESS' COMMENT '维度(COMPLETENESS:完整性，UNIQUENESS:唯一性，VALIDITY:有效性，CONSISTENCY:一致性)',
  `instruction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '查看说明',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '质检规则' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for task
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务名称',
  `type` enum('LIDAR_FUSION','LIDAR_BASIC','IMAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LIDAR_FUSION' COMMENT '数据类型(LIDAR_FUSION:点云融合，LIDAR_BASIC:点云基础，IMAGE:图片)',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `scene_type` enum('SINGLE_FRAME','CONTINUOUS_FRAME') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SINGLE_FRAME' COMMENT '场景类型(SINGLE_FRAME:单帧，CONTINUOUS_FRAME:连续帧)',
  `annotation_type` enum('DETECTION','SEGMENTATION','ALL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DETECTION' COMMENT '标注类型(DETECTION:检测，SEGMENTATION:分割，ALL:全选)',
  `finish_at` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `status` enum('CONFIGURING','ONGOING','PAUSED','CLOSED','COMPLETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONFIGURING' COMMENT '任务状态(CONFIGURING:配置中，ONGOING:进行中，PAUSED:已暂停,CLOSED:已关闭,COMPLETE:已完成)',
  `dataset_id` bigint NULL DEFAULT NULL COMMENT '数据集id',
  `dataset_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '数据集名称',
  `accuracy_rate` decimal(5, 2) NULL DEFAULT NULL COMMENT '准确率',
  `frame_rate` decimal(5, 2) NULL DEFAULT NULL COMMENT '框准率',
  `data_volume` int NULL DEFAULT NULL COMMENT '数据量',
  `comment_tag` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '评论标签',
  `rule_desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '规则描述',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for task_data
-- ----------------------------
DROP TABLE IF EXISTS `task_data`;
CREATE TABLE `task_data`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `task_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务名称',
  `task_scene_type` enum('SINGLE_FRAME','CONTINUOUS_FRAME') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SINGLE_FRAME' COMMENT '任务场景类型(SINGLE_FRAME:单帧，CONTINUOUS_FRAME:连续帧)',
  `dataset_id` bigint NOT NULL COMMENT '数据集id',
  `data_id` bigint NOT NULL COMMENT '数据id',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '数据名称',
  `content` json NULL COMMENT '数据内容 (文件夹路径，版本信息)',
  `type` enum('SINGLE_DATA','SCENE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SINGLE_DATA' COMMENT 'Type (indicates continuous frames, non-consecutive frames)',
  `annotation_phase_status` enum('PENDING_CLAIM','IN_PROGRESS','ANNOTATED','REJECTED','SUSPENDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING_CLAIM' COMMENT '标注阶段状态(PENDING_CLAIM:待认领，IN_PROGRESS:标注中，ANNOTATED:已标注，REJECTED:被驳回，SUSPENDED:已挂起)',
  `current_annotation_user_id` bigint NULL DEFAULT NULL COMMENT '当前标注人员id',
  `audit_phase_status` enum('PENDING_REVIEW','PENDING_CLAIM','BEING_REVIEWED','AUDITED','SUSPENDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审核阶段状态(PENDING_REVIEW:待复审，PENDING_CLAIM:待认领，BEING_REVIEWED:审核中，AUDITED:已审核，SUSPENDED:已挂起)',
  `current_audit_user_id` bigint NULL DEFAULT NULL COMMENT '当前审核人员id',
  `current_node` int NULL DEFAULT NULL COMMENT '当前审核节点',
  `acceptance_phase_status` enum('PENDING_REVIEW','PENDING_CLAIM','UNDER_ACCEPTANCE','ACCEPTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '验收阶段状态(PENDING_REVIEW:待复审，PENDING_CLAIM:待认领，UNDER_ACCEPTANCE:验收中，ACCEPTED:已验收)',
  `current_acceptance_user_id` bigint NULL DEFAULT NULL COMMENT '当前验收人员id',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_id_dataset_id_data_id`(`task_id` ASC, `dataset_id` ASC, `data_id` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务-场景/数据' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_data_acceptance_record
-- ----------------------------
DROP TABLE IF EXISTS `task_data_acceptance_record`;
CREATE TABLE `task_data_acceptance_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `data_id` bigint NOT NULL COMMENT '数据id',
  `task_data_id` bigint NOT NULL COMMENT '任务数据id',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_data_id`(`task_data_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务数据验收领取记录' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_data_annotation_record
-- ----------------------------
DROP TABLE IF EXISTS `task_data_annotation_record`;
CREATE TABLE `task_data_annotation_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `data_id` bigint NOT NULL COMMENT '数据id',
  `task_data_id` bigint NOT NULL COMMENT '任务数据id',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_data_id`(`task_data_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务数据标注领取记录' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_data_audit_record
-- ----------------------------
DROP TABLE IF EXISTS `task_data_audit_record`;
CREATE TABLE `task_data_audit_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `data_id` bigint NOT NULL COMMENT '数据id',
  `task_data_id` bigint NOT NULL COMMENT '任务数据id',
  `node` int NOT NULL COMMENT '节点',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_data_id_node`(`task_data_id` ASC, `node` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务数据审批领取记录' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_data_flow_record
-- ----------------------------
DROP TABLE IF EXISTS `task_data_flow_record`;
CREATE TABLE `task_data_flow_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `task_data_id` bigint NOT NULL COMMENT '任务数据id',
  `data_id` bigint NOT NULL COMMENT '数据id',
  `process` enum('ANNOTATION','AUDIT','ACCEPTANCE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '工序(ANNOTATION:标注，AUDIT:审核，ACCEPTANCE:验收)',
  `operation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作',
  `status` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '状态',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `creator` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '创建者',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务数据流转记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for task_dataset_classification
-- ----------------------------
DROP TABLE IF EXISTS `task_dataset_classification`;
CREATE TABLE `task_dataset_classification`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `dataset_id` bigint NOT NULL COMMENT '数据集id',
  `dataset_classification_id` bigint NOT NULL COMMENT '分类id',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `target` enum('DATA','CONSECUTIVE_FRAMES') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类目标(DATA:数据，CONSECUTIVE_FRAMES:连续帧)',
  `input_type` enum('RADIO','TEXT','MULTI_SELECTION','DROPDOWN','LONG_TEXT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类输入类型(RADIO:单选框，TEXT:文本，MULTI_SELECTION:多选框，DROPDOWN:下拉框，LONG_TEXT:长文本)',
  `is_required` bit(1) NOT NULL DEFAULT b'0' COMMENT '分类选项是否必选(0-否，1-是)',
  `attribute` json NULL COMMENT '分类属性json',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_id_dataset_id_dataset_dataset_classification_id`(`task_id` ASC, `dataset_id` ASC, `dataset_classification_id` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务数据集分类' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_dataset_tag
-- ----------------------------
DROP TABLE IF EXISTS `task_dataset_tag`;
CREATE TABLE `task_dataset_tag`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `dataset_id` bigint NOT NULL COMMENT '数据集id',
  `dataset_class_id` bigint NOT NULL COMMENT '标签id',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签名称',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '标签颜色',
  `tool_type` enum('POLYGON','BOUNDING_BOX','POLYLINE','KEY_POINT','SEGMENTATION','CUBOID') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签工具类型(POLYGON:多边形，BOUNDING_BOX:边界框，POLYLINE:折线，KEY_POINT:关键点，SEGMENTATION:分割，CUBOID:长方体)',
  `tool_type_options` json NULL COMMENT '标签工具类型选项json',
  `attributes` json NULL COMMENT '标签属性json',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_id_dataset_id_dataset_class_id`(`task_id` ASC, `dataset_id` ASC, `dataset_class_id` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务数据集标签' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_flow_node
-- ----------------------------
DROP TABLE IF EXISTS `task_flow_node`;
CREATE TABLE `task_flow_node`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `node_type` enum('ANNOTATION','AUDIT','ACCEPTANCE','MANAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '节点类型(ANNOTATION:标注，AUDIT:审核，ACCEPTANCE:验收，MANAGE:任务管理员)',
  `node_sort` int NULL DEFAULT NULL COMMENT '节点排序',
  `user_id` bigint NOT NULL COMMENT '用户id',
  `max_receive_duration` int NULL DEFAULT NULL COMMENT '最大领取时长(单位:分钟)',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `uk_task_id_node_type_user_id`(`task_id` ASC, `node_type` ASC, `user_id` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务流节点' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for task_quality_rule
-- ----------------------------
DROP TABLE IF EXISTS `task_quality_rule`;
CREATE TABLE `task_quality_rule`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `quality_rule_id` bigint NOT NULL COMMENT '质检规则id',
  `enable` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否启用(0-否，1-是)',
  `requirement` enum('MANDATORY','WARNING','INFO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO' COMMENT '要求(MANDATORY:强制，WARNING:警告，INFO:信息)',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_id_quality_rule_id`(`task_id` ASC, `quality_rule_id` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务质检规则' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for task_scene_data
-- ----------------------------
DROP TABLE IF EXISTS `task_scene_data`;
CREATE TABLE `task_scene_data`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `dataset_id` bigint NOT NULL COMMENT '数据集id',
  `scene_id` bigint NOT NULL COMMENT '场景id(同data_id)',
  `data_id` bigint NOT NULL COMMENT '数据id',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '数据名称',
  `content` json NULL COMMENT '数据内容 (文件夹路径，版本信息)',
  `annotation_result` json NULL COMMENT '标注结果json',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务数据-场景下的数据' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_step_result
-- ----------------------------
DROP TABLE IF EXISTS `task_step_result`;
CREATE TABLE `task_step_result`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `project_id` bigint NOT NULL COMMENT '项目id',
  `task_id` bigint NOT NULL COMMENT '任务id',
  `from_task_id` bigint NULL DEFAULT NULL COMMENT '复制任务id',
  `current_step` int NOT NULL COMMENT '当前步骤',
  `step1_result` json NOT NULL COMMENT '步骤1保存结果',
  `step2_result` json NULL COMMENT '步骤2保存结果',
  `step3_result` json NULL COMMENT '步骤3保存结果',
  `step4_result` json NULL COMMENT '步骤4保存结果',
  `step5_result` json NULL COMMENT '步骤5保存结果',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `del_unique_key` bigint NOT NULL DEFAULT 0 COMMENT '\nDelete unique flag, 0 when writing, set as primary key id after tombstone',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建者id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新时间id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_id`(`task_id` ASC, `del_unique_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务步骤保存结果' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for upload_record
-- ----------------------------
DROP TABLE IF EXISTS `upload_record`;
CREATE TABLE `upload_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `serial_number` bigint NOT NULL COMMENT 'Serial number',
  `file_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'File url',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'File name',
  `error_message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Error information',
  `total_file_size` bigint NULL DEFAULT NULL COMMENT 'Total file size',
  `downloaded_file_size` bigint NULL DEFAULT NULL COMMENT 'Downloaded file size',
  `total_data_num` bigint NULL DEFAULT NULL COMMENT 'The total number of data',
  `parsed_data_num` bigint NULL DEFAULT NULL COMMENT 'Number of parsed data',
  `status` enum('UNSTARTED','DOWNLOADING','DOWNLOAD_COMPLETED','PARSING','PARSE_COMPLETED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'UNSTARTED' COMMENT 'Upload status',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unx_serial_number`(`serial_number` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 527 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'login username',
  `password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT 'encode password',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'user nickname',
  `avatar_id` bigint NULL DEFAULT NULL COMMENT 'avatar id. file table primary key',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'user created time',
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'user updated time',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT 'last login time',
  `status` enum('NORMAL','FORBIDDEN') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'NORMAL' COMMENT 'the status of user',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 25 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'User table' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for user_token
-- ----------------------------
DROP TABLE IF EXISTS `user_token`;
CREATE TABLE `user_token`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'token',
  `token_type` enum('API','GATEWAY') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'token type',
  `expire_at` datetime NULL DEFAULT NULL COMMENT 'token expire datetime',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `created_by` bigint NULL DEFAULT NULL COMMENT 'Creator id',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  `updated_by` bigint NULL DEFAULT NULL COMMENT 'Modify person id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_created_by`(`created_by` ASC) USING BTREE,
  INDEX `idx_token`(`token`(90) ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 196 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
