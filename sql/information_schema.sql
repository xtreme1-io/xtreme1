/*
 Navicat Premium Dump SQL

 Source Server         : xtreme1
 Source Server Type    : MySQL
 Source Server Version : 80035 (8.0.35)
 Source Host           : 192.168.200.157:3306
 Source Schema         : information_schema

 Target Server Type    : MySQL
 Target Server Version : 80035 (8.0.35)
 File Encoding         : 65001

 Date: 07/03/2025 18:50:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ADMINISTRABLE_ROLE_AUTHORIZATIONS
-- ----------------------------
DROP TABLE IF EXISTS `ADMINISTRABLE_ROLE_AUTHORIZATIONS`;
CREATE TABLE `ADMINISTRABLE_ROLE_AUTHORIZATIONS`  (
  `USER` varchar(97) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `HOST` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTEE` varchar(97) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `GRANTEE_HOST` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ROLE_NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ROLE_HOST` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_DEFAULT` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `IS_MANDATORY` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for APPLICABLE_ROLES
-- ----------------------------
DROP TABLE IF EXISTS `APPLICABLE_ROLES`;
CREATE TABLE `APPLICABLE_ROLES`  (
  `USER` varchar(97) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `HOST` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTEE` varchar(97) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `GRANTEE_HOST` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ROLE_NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ROLE_HOST` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_DEFAULT` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `IS_MANDATORY` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for CHARACTER_SETS
-- ----------------------------
DROP TABLE IF EXISTS `CHARACTER_SETS`;
CREATE TABLE `CHARACTER_SETS`  (
  `CHARACTER_SET_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DEFAULT_COLLATE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DESCRIPTION` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `MAXLEN` int UNSIGNED NOT NULL
);

-- ----------------------------
-- Table structure for CHECK_CONSTRAINTS
-- ----------------------------
DROP TABLE IF EXISTS `CHECK_CONSTRAINTS`;
CREATE TABLE `CHECK_CONSTRAINTS`  (
  `CONSTRAINT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `CONSTRAINT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `CONSTRAINT_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `CHECK_CLAUSE` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL
);

-- ----------------------------
-- Table structure for COLLATION_CHARACTER_SET_APPLICABILITY
-- ----------------------------
DROP TABLE IF EXISTS `COLLATION_CHARACTER_SET_APPLICABILITY`;
CREATE TABLE `COLLATION_CHARACTER_SET_APPLICABILITY`  (
  `COLLATION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `CHARACTER_SET_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL
);

-- ----------------------------
-- Table structure for COLLATIONS
-- ----------------------------
DROP TABLE IF EXISTS `COLLATIONS`;
CREATE TABLE `COLLATIONS`  (
  `COLLATION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `CHARACTER_SET_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ID` bigint UNSIGNED NOT NULL DEFAULT 0,
  `IS_DEFAULT` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_COMPILED` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `SORTLEN` int UNSIGNED NOT NULL,
  `PAD_ATTRIBUTE` enum('PAD SPACE','NO PAD') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL
);

-- ----------------------------
-- Table structure for COLUMN_PRIVILEGES
-- ----------------------------
DROP TABLE IF EXISTS `COLUMN_PRIVILEGES`;
CREATE TABLE `COLUMN_PRIVILEGES`  (
  `GRANTEE` varchar(292) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_CATALOG` varchar(512) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PRIVILEGE_TYPE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for COLUMN_STATISTICS
-- ----------------------------
DROP TABLE IF EXISTS `COLUMN_STATISTICS`;
CREATE TABLE `COLUMN_STATISTICS`  (
  `SCHEMA_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `HISTOGRAM` json NOT NULL
);

-- ----------------------------
-- Table structure for COLUMNS
-- ----------------------------
DROP TABLE IF EXISTS `COLUMNS`;
CREATE TABLE `COLUMNS`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `ORDINAL_POSITION` int UNSIGNED NOT NULL,
  `COLUMN_DEFAULT` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `IS_NULLABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `DATA_TYPE` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `CHARACTER_MAXIMUM_LENGTH` bigint NULL DEFAULT NULL,
  `CHARACTER_OCTET_LENGTH` bigint NULL DEFAULT NULL,
  `NUMERIC_PRECISION` bigint UNSIGNED NULL DEFAULT NULL,
  `NUMERIC_SCALE` bigint UNSIGNED NULL DEFAULT NULL,
  `DATETIME_PRECISION` int UNSIGNED NULL DEFAULT NULL,
  `CHARACTER_SET_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `COLLATION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `COLUMN_TYPE` mediumtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `COLUMN_KEY` enum('','PRI','UNI','MUL') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `EXTRA` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `PRIVILEGES` varchar(154) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `COLUMN_COMMENT` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `GENERATION_EXPRESSION` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `SRS_ID` int UNSIGNED NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for COLUMNS_EXTENSIONS
-- ----------------------------
DROP TABLE IF EXISTS `COLUMNS_EXTENSIONS`;
CREATE TABLE `COLUMNS_EXTENSIONS`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `ENGINE_ATTRIBUTE` json NULL,
  `SECONDARY_ENGINE_ATTRIBUTE` json NULL
);

-- ----------------------------
-- Table structure for ENABLED_ROLES
-- ----------------------------
DROP TABLE IF EXISTS `ENABLED_ROLES`;
CREATE TABLE `ENABLED_ROLES`  (
  `ROLE_NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ROLE_HOST` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `IS_DEFAULT` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `IS_MANDATORY` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for ENGINES
-- ----------------------------
DROP TABLE IF EXISTS `ENGINES`;
CREATE TABLE `ENGINES`  (
  `ENGINE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `SUPPORT` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `COMMENT` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TRANSACTIONS` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `XA` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `SAVEPOINTS` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for EVENTS
-- ----------------------------
DROP TABLE IF EXISTS `EVENTS`;
CREATE TABLE `EVENTS`  (
  `EVENT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `EVENT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `EVENT_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DEFINER` varchar(288) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `TIME_ZONE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `EVENT_BODY` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `EVENT_DEFINITION` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `EVENT_TYPE` varchar(9) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `EXECUTE_AT` datetime NULL DEFAULT NULL,
  `INTERVAL_VALUE` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `INTERVAL_FIELD` enum('YEAR','QUARTER','MONTH','DAY','HOUR','MINUTE','WEEK','SECOND','MICROSECOND','YEAR_MONTH','DAY_HOUR','DAY_MINUTE','DAY_SECOND','HOUR_MINUTE','HOUR_SECOND','MINUTE_SECOND','DAY_MICROSECOND','HOUR_MICROSECOND','MINUTE_MICROSECOND','SECOND_MICROSECOND') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `SQL_MODE` set('REAL_AS_FLOAT','PIPES_AS_CONCAT','ANSI_QUOTES','IGNORE_SPACE','NOT_USED','ONLY_FULL_GROUP_BY','NO_UNSIGNED_SUBTRACTION','NO_DIR_IN_CREATE','NOT_USED_9','NOT_USED_10','NOT_USED_11','NOT_USED_12','NOT_USED_13','NOT_USED_14','NOT_USED_15','NOT_USED_16','NOT_USED_17','NOT_USED_18','ANSI','NO_AUTO_VALUE_ON_ZERO','NO_BACKSLASH_ESCAPES','STRICT_TRANS_TABLES','STRICT_ALL_TABLES','NO_ZERO_IN_DATE','NO_ZERO_DATE','ALLOW_INVALID_DATES','ERROR_FOR_DIVISION_BY_ZERO','TRADITIONAL','NOT_USED_29','HIGH_NOT_PRECEDENCE','NO_ENGINE_SUBSTITUTION','PAD_CHAR_TO_FULL_LENGTH','TIME_TRUNCATE_FRACTIONAL') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `STARTS` datetime NULL DEFAULT NULL,
  `ENDS` datetime NULL DEFAULT NULL,
  `STATUS` enum('ENABLED','DISABLED','SLAVESIDE_DISABLED') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ON_COMPLETION` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `CREATED` timestamp NOT NULL,
  `LAST_ALTERED` timestamp NOT NULL,
  `LAST_EXECUTED` datetime NULL DEFAULT NULL,
  `EVENT_COMMENT` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ORIGINATOR` int UNSIGNED NOT NULL,
  `CHARACTER_SET_CLIENT` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `COLLATION_CONNECTION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DATABASE_COLLATION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL
);

-- ----------------------------
-- Table structure for FILES
-- ----------------------------
DROP TABLE IF EXISTS `FILES`;
CREATE TABLE `FILES`  ();

-- ----------------------------
-- Table structure for INNODB_BUFFER_PAGE
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_BUFFER_PAGE`;
CREATE TABLE `INNODB_BUFFER_PAGE`  (
  `POOL_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `BLOCK_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `SPACE` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGE_NUMBER` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGE_TYPE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `FLUSH_TYPE` bigint UNSIGNED NOT NULL DEFAULT '',
  `FIX_COUNT` bigint UNSIGNED NOT NULL DEFAULT '',
  `IS_HASHED` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `NEWEST_MODIFICATION` bigint UNSIGNED NOT NULL DEFAULT '',
  `OLDEST_MODIFICATION` bigint UNSIGNED NOT NULL DEFAULT '',
  `ACCESS_TIME` bigint UNSIGNED NOT NULL DEFAULT '',
  `TABLE_NAME` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `INDEX_NAME` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `NUMBER_RECORDS` bigint UNSIGNED NOT NULL DEFAULT '',
  `DATA_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `COMPRESSED_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGE_STATE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `IO_FIX` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `IS_OLD` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `FREE_PAGE_CLOCK` bigint UNSIGNED NOT NULL DEFAULT '',
  `IS_STALE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_BUFFER_PAGE_LRU
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_BUFFER_PAGE_LRU`;
CREATE TABLE `INNODB_BUFFER_PAGE_LRU`  (
  `POOL_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `LRU_POSITION` bigint UNSIGNED NOT NULL DEFAULT '',
  `SPACE` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGE_NUMBER` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGE_TYPE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `FLUSH_TYPE` bigint UNSIGNED NOT NULL DEFAULT '',
  `FIX_COUNT` bigint UNSIGNED NOT NULL DEFAULT '',
  `IS_HASHED` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `NEWEST_MODIFICATION` bigint UNSIGNED NOT NULL DEFAULT '',
  `OLDEST_MODIFICATION` bigint UNSIGNED NOT NULL DEFAULT '',
  `ACCESS_TIME` bigint UNSIGNED NOT NULL DEFAULT '',
  `TABLE_NAME` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `INDEX_NAME` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `NUMBER_RECORDS` bigint UNSIGNED NOT NULL DEFAULT '',
  `DATA_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `COMPRESSED_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `COMPRESSED` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `IO_FIX` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `IS_OLD` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `FREE_PAGE_CLOCK` bigint UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_BUFFER_POOL_STATS
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_BUFFER_POOL_STATS`;
CREATE TABLE `INNODB_BUFFER_POOL_STATS`  (
  `POOL_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `POOL_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `FREE_BUFFERS` bigint UNSIGNED NOT NULL DEFAULT '',
  `DATABASE_PAGES` bigint UNSIGNED NOT NULL DEFAULT '',
  `OLD_DATABASE_PAGES` bigint UNSIGNED NOT NULL DEFAULT '',
  `MODIFIED_DATABASE_PAGES` bigint UNSIGNED NOT NULL DEFAULT '',
  `PENDING_DECOMPRESS` bigint UNSIGNED NOT NULL DEFAULT '',
  `PENDING_READS` bigint UNSIGNED NOT NULL DEFAULT '',
  `PENDING_FLUSH_LRU` bigint UNSIGNED NOT NULL DEFAULT '',
  `PENDING_FLUSH_LIST` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGES_MADE_YOUNG` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGES_NOT_MADE_YOUNG` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGES_MADE_YOUNG_RATE` float(12, 0) NOT NULL DEFAULT '',
  `PAGES_MADE_NOT_YOUNG_RATE` float(12, 0) NOT NULL DEFAULT '',
  `NUMBER_PAGES_READ` bigint UNSIGNED NOT NULL DEFAULT '',
  `NUMBER_PAGES_CREATED` bigint UNSIGNED NOT NULL DEFAULT '',
  `NUMBER_PAGES_WRITTEN` bigint UNSIGNED NOT NULL DEFAULT '',
  `PAGES_READ_RATE` float(12, 0) NOT NULL DEFAULT '',
  `PAGES_CREATE_RATE` float(12, 0) NOT NULL DEFAULT '',
  `PAGES_WRITTEN_RATE` float(12, 0) NOT NULL DEFAULT '',
  `NUMBER_PAGES_GET` bigint UNSIGNED NOT NULL DEFAULT '',
  `HIT_RATE` bigint UNSIGNED NOT NULL DEFAULT '',
  `YOUNG_MAKE_PER_THOUSAND_GETS` bigint UNSIGNED NOT NULL DEFAULT '',
  `NOT_YOUNG_MAKE_PER_THOUSAND_GETS` bigint UNSIGNED NOT NULL DEFAULT '',
  `NUMBER_PAGES_READ_AHEAD` bigint UNSIGNED NOT NULL DEFAULT '',
  `NUMBER_READ_AHEAD_EVICTED` bigint UNSIGNED NOT NULL DEFAULT '',
  `READ_AHEAD_RATE` float(12, 0) NOT NULL DEFAULT '',
  `READ_AHEAD_EVICTED_RATE` float(12, 0) NOT NULL DEFAULT '',
  `LRU_IO_TOTAL` bigint UNSIGNED NOT NULL DEFAULT '',
  `LRU_IO_CURRENT` bigint UNSIGNED NOT NULL DEFAULT '',
  `UNCOMPRESS_TOTAL` bigint UNSIGNED NOT NULL DEFAULT '',
  `UNCOMPRESS_CURRENT` bigint UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_CACHED_INDEXES
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_CACHED_INDEXES`;
CREATE TABLE `INNODB_CACHED_INDEXES`  (
  `SPACE_ID` int UNSIGNED NOT NULL DEFAULT '',
  `INDEX_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `N_CACHED_PAGES` bigint UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_CMP
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_CMP`;
CREATE TABLE `INNODB_CMP`  (
  `page_size` int NOT NULL DEFAULT '',
  `compress_ops` int NOT NULL DEFAULT '',
  `compress_ops_ok` int NOT NULL DEFAULT '',
  `compress_time` int NOT NULL DEFAULT '',
  `uncompress_ops` int NOT NULL DEFAULT '',
  `uncompress_time` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_CMP_PER_INDEX
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_CMP_PER_INDEX`;
CREATE TABLE `INNODB_CMP_PER_INDEX`  (
  `database_name` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `table_name` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `index_name` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `compress_ops` int NOT NULL DEFAULT '',
  `compress_ops_ok` int NOT NULL DEFAULT '',
  `compress_time` int NOT NULL DEFAULT '',
  `uncompress_ops` int NOT NULL DEFAULT '',
  `uncompress_time` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_CMP_PER_INDEX_RESET
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_CMP_PER_INDEX_RESET`;
CREATE TABLE `INNODB_CMP_PER_INDEX_RESET`  (
  `database_name` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `table_name` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `index_name` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `compress_ops` int NOT NULL DEFAULT '',
  `compress_ops_ok` int NOT NULL DEFAULT '',
  `compress_time` int NOT NULL DEFAULT '',
  `uncompress_ops` int NOT NULL DEFAULT '',
  `uncompress_time` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_CMP_RESET
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_CMP_RESET`;
CREATE TABLE `INNODB_CMP_RESET`  (
  `page_size` int NOT NULL DEFAULT '',
  `compress_ops` int NOT NULL DEFAULT '',
  `compress_ops_ok` int NOT NULL DEFAULT '',
  `compress_time` int NOT NULL DEFAULT '',
  `uncompress_ops` int NOT NULL DEFAULT '',
  `uncompress_time` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_CMPMEM
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_CMPMEM`;
CREATE TABLE `INNODB_CMPMEM`  (
  `page_size` int NOT NULL DEFAULT '',
  `buffer_pool_instance` int NOT NULL DEFAULT '',
  `pages_used` int NOT NULL DEFAULT '',
  `pages_free` int NOT NULL DEFAULT '',
  `relocation_ops` bigint NOT NULL DEFAULT '',
  `relocation_time` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_CMPMEM_RESET
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_CMPMEM_RESET`;
CREATE TABLE `INNODB_CMPMEM_RESET`  (
  `page_size` int NOT NULL DEFAULT '',
  `buffer_pool_instance` int NOT NULL DEFAULT '',
  `pages_used` int NOT NULL DEFAULT '',
  `pages_free` int NOT NULL DEFAULT '',
  `relocation_ops` bigint NOT NULL DEFAULT '',
  `relocation_time` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_COLUMNS
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_COLUMNS`;
CREATE TABLE `INNODB_COLUMNS`  (
  `TABLE_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `NAME` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `POS` bigint UNSIGNED NOT NULL DEFAULT '',
  `MTYPE` int NOT NULL DEFAULT '',
  `PRTYPE` int NOT NULL DEFAULT '',
  `LEN` int NOT NULL DEFAULT '',
  `HAS_DEFAULT` int NOT NULL DEFAULT '',
  `DEFAULT_VALUE` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL
);

-- ----------------------------
-- Table structure for INNODB_DATAFILES
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_DATAFILES`;
CREATE TABLE `INNODB_DATAFILES`  (
  `SPACE` varbinary(256) NULL DEFAULT NULL,
  `PATH` varchar(512) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL
);

-- ----------------------------
-- Table structure for INNODB_FIELDS
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FIELDS`;
CREATE TABLE `INNODB_FIELDS`  (
  `INDEX_ID` varbinary(256) NULL DEFAULT NULL,
  `NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `POS` bigint UNSIGNED NOT NULL DEFAULT 0
);

-- ----------------------------
-- Table structure for INNODB_FOREIGN
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FOREIGN`;
CREATE TABLE `INNODB_FOREIGN`  (
  `ID` varchar(129) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `FOR_NAME` varchar(129) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `REF_NAME` varchar(129) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `N_COLS` bigint NOT NULL DEFAULT 0,
  `TYPE` bigint UNSIGNED NOT NULL DEFAULT 0
);

-- ----------------------------
-- Table structure for INNODB_FOREIGN_COLS
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FOREIGN_COLS`;
CREATE TABLE `INNODB_FOREIGN_COLS`  (
  `ID` varchar(129) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `FOR_COL_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `REF_COL_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `POS` int UNSIGNED NOT NULL
);

-- ----------------------------
-- Table structure for INNODB_FT_BEING_DELETED
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FT_BEING_DELETED`;
CREATE TABLE `INNODB_FT_BEING_DELETED`  (
  `DOC_ID` bigint UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_FT_CONFIG
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FT_CONFIG`;
CREATE TABLE `INNODB_FT_CONFIG`  (
  `KEY` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `VALUE` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_FT_DEFAULT_STOPWORD
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FT_DEFAULT_STOPWORD`;
CREATE TABLE `INNODB_FT_DEFAULT_STOPWORD`  (
  `value` varchar(18) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_FT_DELETED
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FT_DELETED`;
CREATE TABLE `INNODB_FT_DELETED`  (
  `DOC_ID` bigint UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_FT_INDEX_CACHE
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FT_INDEX_CACHE`;
CREATE TABLE `INNODB_FT_INDEX_CACHE`  (
  `WORD` varchar(337) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `FIRST_DOC_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `LAST_DOC_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `DOC_COUNT` bigint UNSIGNED NOT NULL DEFAULT '',
  `DOC_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `POSITION` bigint UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_FT_INDEX_TABLE
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_FT_INDEX_TABLE`;
CREATE TABLE `INNODB_FT_INDEX_TABLE`  (
  `WORD` varchar(337) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `FIRST_DOC_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `LAST_DOC_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `DOC_COUNT` bigint UNSIGNED NOT NULL DEFAULT '',
  `DOC_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `POSITION` bigint UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_INDEXES
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_INDEXES`;
CREATE TABLE `INNODB_INDEXES`  (
  `INDEX_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `NAME` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `TYPE` int NOT NULL DEFAULT '',
  `N_FIELDS` int NOT NULL DEFAULT '',
  `PAGE_NO` int NOT NULL DEFAULT '',
  `SPACE` int NOT NULL DEFAULT '',
  `MERGE_THRESHOLD` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_METRICS
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_METRICS`;
CREATE TABLE `INNODB_METRICS`  (
  `NAME` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `SUBSYSTEM` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `COUNT` bigint NOT NULL DEFAULT '',
  `MAX_COUNT` bigint NULL DEFAULT '',
  `MIN_COUNT` bigint NULL DEFAULT '',
  `AVG_COUNT` float(12, 0) NULL DEFAULT '',
  `COUNT_RESET` bigint NOT NULL DEFAULT '',
  `MAX_COUNT_RESET` bigint NULL DEFAULT '',
  `MIN_COUNT_RESET` bigint NULL DEFAULT '',
  `AVG_COUNT_RESET` float(12, 0) NULL DEFAULT '',
  `TIME_ENABLED` datetime NULL DEFAULT '',
  `TIME_DISABLED` datetime NULL DEFAULT '',
  `TIME_ELAPSED` bigint NULL DEFAULT '',
  `TIME_RESET` datetime NULL DEFAULT '',
  `STATUS` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TYPE` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `COMMENT` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_SESSION_TEMP_TABLESPACES
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_SESSION_TEMP_TABLESPACES`;
CREATE TABLE `INNODB_SESSION_TEMP_TABLESPACES`  (
  `ID` int UNSIGNED NOT NULL DEFAULT '',
  `SPACE` int UNSIGNED NOT NULL DEFAULT '',
  `PATH` varchar(4001) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `STATE` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PURPOSE` varchar(192) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_TABLES
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_TABLES`;
CREATE TABLE `INNODB_TABLES`  (
  `TABLE_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `NAME` varchar(655) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `FLAG` int NOT NULL DEFAULT '',
  `N_COLS` int NOT NULL DEFAULT '',
  `SPACE` bigint NOT NULL DEFAULT '',
  `ROW_FORMAT` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `ZIP_PAGE_SIZE` int UNSIGNED NOT NULL DEFAULT '',
  `SPACE_TYPE` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `INSTANT_COLS` int NOT NULL DEFAULT '',
  `TOTAL_ROW_VERSIONS` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_TABLESPACES
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_TABLESPACES`;
CREATE TABLE `INNODB_TABLESPACES`  (
  `SPACE` int UNSIGNED NOT NULL DEFAULT '',
  `NAME` varchar(655) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `FLAG` int UNSIGNED NOT NULL DEFAULT '',
  `ROW_FORMAT` varchar(22) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `PAGE_SIZE` int UNSIGNED NOT NULL DEFAULT '',
  `ZIP_PAGE_SIZE` int UNSIGNED NOT NULL DEFAULT '',
  `SPACE_TYPE` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `FS_BLOCK_SIZE` int UNSIGNED NOT NULL DEFAULT '',
  `FILE_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `ALLOCATED_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `AUTOEXTEND_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `SERVER_VERSION` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `SPACE_VERSION` int UNSIGNED NOT NULL DEFAULT '',
  `ENCRYPTION` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `STATE` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_TABLESPACES_BRIEF
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_TABLESPACES_BRIEF`;
CREATE TABLE `INNODB_TABLESPACES_BRIEF`  (
  `SPACE` varbinary(256) NULL DEFAULT NULL,
  `NAME` varchar(268) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `PATH` varchar(512) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `FLAG` varbinary(256) NULL DEFAULT NULL,
  `SPACE_TYPE` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_TABLESTATS
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_TABLESTATS`;
CREATE TABLE `INNODB_TABLESTATS`  (
  `TABLE_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `NAME` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `STATS_INITIALIZED` varchar(193) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `NUM_ROWS` bigint UNSIGNED NOT NULL DEFAULT '',
  `CLUST_INDEX_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `OTHER_INDEX_SIZE` bigint UNSIGNED NOT NULL DEFAULT '',
  `MODIFIED_COUNTER` bigint UNSIGNED NOT NULL DEFAULT '',
  `AUTOINC` bigint UNSIGNED NOT NULL DEFAULT '',
  `REF_COUNT` int NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_TEMP_TABLE_INFO
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_TEMP_TABLE_INFO`;
CREATE TABLE `INNODB_TEMP_TABLE_INFO`  (
  `TABLE_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `N_COLS` int UNSIGNED NOT NULL DEFAULT '',
  `SPACE` int UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_TRX
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_TRX`;
CREATE TABLE `INNODB_TRX`  (
  `trx_id` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_state` varchar(13) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `trx_started` datetime NOT NULL DEFAULT '',
  `trx_requested_lock_id` varchar(105) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `trx_wait_started` datetime NULL DEFAULT '',
  `trx_weight` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_mysql_thread_id` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_query` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `trx_operation_state` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `trx_tables_in_use` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_tables_locked` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_lock_structs` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_lock_memory_bytes` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_rows_locked` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_rows_modified` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_concurrency_tickets` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_isolation_level` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `trx_unique_checks` int NOT NULL DEFAULT '',
  `trx_foreign_key_checks` int NOT NULL DEFAULT '',
  `trx_last_foreign_key_error` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `trx_adaptive_hash_latched` int NOT NULL DEFAULT '',
  `trx_adaptive_hash_timeout` bigint UNSIGNED NOT NULL DEFAULT '',
  `trx_is_read_only` int NOT NULL DEFAULT '',
  `trx_autocommit_non_locking` int NOT NULL DEFAULT '',
  `trx_schedule_weight` bigint UNSIGNED NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for INNODB_VIRTUAL
-- ----------------------------
DROP TABLE IF EXISTS `INNODB_VIRTUAL`;
CREATE TABLE `INNODB_VIRTUAL`  (
  `TABLE_ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `POS` int UNSIGNED NOT NULL DEFAULT '',
  `BASE_POS` int UNSIGNED NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for KEY_COLUMN_USAGE
-- ----------------------------
DROP TABLE IF EXISTS `KEY_COLUMN_USAGE`;
CREATE TABLE `KEY_COLUMN_USAGE`  (
  `CONSTRAINT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `CONSTRAINT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `CONSTRAINT_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `ORDINAL_POSITION` int UNSIGNED NOT NULL DEFAULT 0,
  `POSITION_IN_UNIQUE_CONSTRAINT` int UNSIGNED NULL DEFAULT NULL,
  `REFERENCED_TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `REFERENCED_TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `REFERENCED_COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for KEYWORDS
-- ----------------------------
DROP TABLE IF EXISTS `KEYWORDS`;
CREATE TABLE `KEYWORDS`  (
  `WORD` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `RESERVED` int NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for OPTIMIZER_TRACE
-- ----------------------------
DROP TABLE IF EXISTS `OPTIMIZER_TRACE`;
CREATE TABLE `OPTIMIZER_TRACE`  (
  `QUERY` varchar(65535) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TRACE` varchar(65535) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `MISSING_BYTES_BEYOND_MAX_MEM_SIZE` int NOT NULL DEFAULT '',
  `INSUFFICIENT_PRIVILEGES` tinyint(1) NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for PARAMETERS
-- ----------------------------
DROP TABLE IF EXISTS `PARAMETERS`;
CREATE TABLE `PARAMETERS`  (
  `SPECIFIC_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SPECIFIC_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SPECIFIC_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ORDINAL_POSITION` bigint UNSIGNED NOT NULL DEFAULT 0,
  `PARAMETER_MODE` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `PARAMETER_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `DATA_TYPE` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `CHARACTER_MAXIMUM_LENGTH` bigint NULL DEFAULT NULL,
  `CHARACTER_OCTET_LENGTH` bigint NULL DEFAULT NULL,
  `NUMERIC_PRECISION` int UNSIGNED NULL DEFAULT NULL,
  `NUMERIC_SCALE` bigint NULL DEFAULT NULL,
  `DATETIME_PRECISION` int UNSIGNED NULL DEFAULT NULL,
  `CHARACTER_SET_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `COLLATION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `DTD_IDENTIFIER` mediumtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ROUTINE_TYPE` enum('FUNCTION','PROCEDURE') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL
);

-- ----------------------------
-- Table structure for PARTITIONS
-- ----------------------------
DROP TABLE IF EXISTS `PARTITIONS`;
CREATE TABLE `PARTITIONS`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `PARTITION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SUBPARTITION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `PARTITION_ORDINAL_POSITION` int UNSIGNED NULL DEFAULT NULL,
  `SUBPARTITION_ORDINAL_POSITION` int UNSIGNED NULL DEFAULT NULL,
  `PARTITION_METHOD` varchar(13) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `SUBPARTITION_METHOD` varchar(13) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `PARTITION_EXPRESSION` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `SUBPARTITION_EXPRESSION` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `PARTITION_DESCRIPTION` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `TABLE_ROWS` bigint UNSIGNED NULL DEFAULT NULL,
  `AVG_ROW_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `DATA_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `MAX_DATA_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `INDEX_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `DATA_FREE` bigint UNSIGNED NULL DEFAULT NULL,
  `CREATE_TIME` timestamp NOT NULL,
  `UPDATE_TIME` datetime NULL DEFAULT NULL,
  `CHECK_TIME` datetime NULL DEFAULT NULL,
  `CHECKSUM` bigint NULL DEFAULT NULL,
  `PARTITION_COMMENT` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `NODEGROUP` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `TABLESPACE_NAME` varchar(268) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for PLUGINS
-- ----------------------------
DROP TABLE IF EXISTS `PLUGINS`;
CREATE TABLE `PLUGINS`  (
  `PLUGIN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PLUGIN_VERSION` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PLUGIN_STATUS` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PLUGIN_TYPE` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PLUGIN_TYPE_VERSION` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PLUGIN_LIBRARY` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `PLUGIN_LIBRARY_VERSION` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `PLUGIN_AUTHOR` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `PLUGIN_DESCRIPTION` varchar(65535) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `PLUGIN_LICENSE` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `LOAD_OPTION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for PROCESSLIST
-- ----------------------------
DROP TABLE IF EXISTS `PROCESSLIST`;
CREATE TABLE `PROCESSLIST`  (
  `ID` bigint UNSIGNED NOT NULL DEFAULT '',
  `USER` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `HOST` varchar(261) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `DB` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `COMMAND` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TIME` int NOT NULL DEFAULT '',
  `STATE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `INFO` varchar(65535) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for PROFILING
-- ----------------------------
DROP TABLE IF EXISTS `PROFILING`;
CREATE TABLE `PROFILING`  (
  `QUERY_ID` int NOT NULL DEFAULT '',
  `SEQ` int NOT NULL DEFAULT '',
  `STATE` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `DURATION` decimal(905, 0) NOT NULL DEFAULT '',
  `CPU_USER` decimal(905, 0) NULL DEFAULT '',
  `CPU_SYSTEM` decimal(905, 0) NULL DEFAULT '',
  `CONTEXT_VOLUNTARY` int NULL DEFAULT '',
  `CONTEXT_INVOLUNTARY` int NULL DEFAULT '',
  `BLOCK_OPS_IN` int NULL DEFAULT '',
  `BLOCK_OPS_OUT` int NULL DEFAULT '',
  `MESSAGES_SENT` int NULL DEFAULT '',
  `MESSAGES_RECEIVED` int NULL DEFAULT '',
  `PAGE_FAULTS_MAJOR` int NULL DEFAULT '',
  `PAGE_FAULTS_MINOR` int NULL DEFAULT '',
  `SWAPS` int NULL DEFAULT '',
  `SOURCE_FUNCTION` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `SOURCE_FILE` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `SOURCE_LINE` int NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for REFERENTIAL_CONSTRAINTS
-- ----------------------------
DROP TABLE IF EXISTS `REFERENTIAL_CONSTRAINTS`;
CREATE TABLE `REFERENTIAL_CONSTRAINTS`  (
  `CONSTRAINT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `CONSTRAINT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `CONSTRAINT_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `UNIQUE_CONSTRAINT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `UNIQUE_CONSTRAINT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `UNIQUE_CONSTRAINT_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `MATCH_OPTION` enum('NONE','PARTIAL','FULL') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `UPDATE_RULE` enum('NO ACTION','RESTRICT','CASCADE','SET NULL','SET DEFAULT') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `DELETE_RULE` enum('NO ACTION','RESTRICT','CASCADE','SET NULL','SET DEFAULT') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `REFERENCED_TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL
);

-- ----------------------------
-- Table structure for RESOURCE_GROUPS
-- ----------------------------
DROP TABLE IF EXISTS `RESOURCE_GROUPS`;
CREATE TABLE `RESOURCE_GROUPS`  (
  `RESOURCE_GROUP_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `RESOURCE_GROUP_TYPE` enum('SYSTEM','USER') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `RESOURCE_GROUP_ENABLED` tinyint(1) NOT NULL,
  `VCPU_IDS` blob NULL,
  `THREAD_PRIORITY` int NOT NULL
);

-- ----------------------------
-- Table structure for ROLE_COLUMN_GRANTS
-- ----------------------------
DROP TABLE IF EXISTS `ROLE_COLUMN_GRANTS`;
CREATE TABLE `ROLE_COLUMN_GRANTS`  (
  `GRANTOR` varchar(97) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTOR_HOST` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTEE` char(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `GRANTEE_HOST` char(255) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '',
  `TABLE_CATALOG` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_SCHEMA` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `TABLE_NAME` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `COLUMN_NAME` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `PRIVILEGE_TYPE` set('Select','Insert','Update','References') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for ROLE_ROUTINE_GRANTS
-- ----------------------------
DROP TABLE IF EXISTS `ROLE_ROUTINE_GRANTS`;
CREATE TABLE `ROLE_ROUTINE_GRANTS`  (
  `GRANTOR` varchar(97) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTOR_HOST` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTEE` char(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `GRANTEE_HOST` char(255) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '',
  `SPECIFIC_CATALOG` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `SPECIFIC_SCHEMA` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `SPECIFIC_NAME` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `ROUTINE_CATALOG` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `ROUTINE_SCHEMA` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `ROUTINE_NAME` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PRIVILEGE_TYPE` set('Execute','Alter Routine','Grant') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for ROLE_TABLE_GRANTS
-- ----------------------------
DROP TABLE IF EXISTS `ROLE_TABLE_GRANTS`;
CREATE TABLE `ROLE_TABLE_GRANTS`  (
  `GRANTOR` varchar(97) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTOR_HOST` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `GRANTEE` char(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `GRANTEE_HOST` char(255) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '',
  `TABLE_CATALOG` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_SCHEMA` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `TABLE_NAME` char(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `PRIVILEGE_TYPE` set('Select','Insert','Update','Delete','Create','Drop','Grant','References','Index','Alter','Create View','Show view','Trigger') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for ROUTINES
-- ----------------------------
DROP TABLE IF EXISTS `ROUTINES`;
CREATE TABLE `ROUTINES`  (
  `SPECIFIC_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ROUTINE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `ROUTINE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `ROUTINE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ROUTINE_TYPE` enum('FUNCTION','PROCEDURE') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `DATA_TYPE` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `CHARACTER_MAXIMUM_LENGTH` bigint NULL DEFAULT NULL,
  `CHARACTER_OCTET_LENGTH` bigint NULL DEFAULT NULL,
  `NUMERIC_PRECISION` int UNSIGNED NULL DEFAULT NULL,
  `NUMERIC_SCALE` int UNSIGNED NULL DEFAULT NULL,
  `DATETIME_PRECISION` int UNSIGNED NULL DEFAULT NULL,
  `CHARACTER_SET_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `COLLATION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `DTD_IDENTIFIER` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `ROUTINE_BODY` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `ROUTINE_DEFINITION` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `EXTERNAL_NAME` binary(0) NULL DEFAULT NULL,
  `EXTERNAL_LANGUAGE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT 'SQL',
  `PARAMETER_STYLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_DETERMINISTIC` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `SQL_DATA_ACCESS` enum('CONTAINS SQL','NO SQL','READS SQL DATA','MODIFIES SQL DATA') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `SQL_PATH` binary(0) NULL DEFAULT NULL,
  `SECURITY_TYPE` enum('DEFAULT','INVOKER','DEFINER') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `CREATED` timestamp NOT NULL,
  `LAST_ALTERED` timestamp NOT NULL,
  `SQL_MODE` set('REAL_AS_FLOAT','PIPES_AS_CONCAT','ANSI_QUOTES','IGNORE_SPACE','NOT_USED','ONLY_FULL_GROUP_BY','NO_UNSIGNED_SUBTRACTION','NO_DIR_IN_CREATE','NOT_USED_9','NOT_USED_10','NOT_USED_11','NOT_USED_12','NOT_USED_13','NOT_USED_14','NOT_USED_15','NOT_USED_16','NOT_USED_17','NOT_USED_18','ANSI','NO_AUTO_VALUE_ON_ZERO','NO_BACKSLASH_ESCAPES','STRICT_TRANS_TABLES','STRICT_ALL_TABLES','NO_ZERO_IN_DATE','NO_ZERO_DATE','ALLOW_INVALID_DATES','ERROR_FOR_DIVISION_BY_ZERO','TRADITIONAL','NOT_USED_29','HIGH_NOT_PRECEDENCE','NO_ENGINE_SUBSTITUTION','PAD_CHAR_TO_FULL_LENGTH','TIME_TRUNCATE_FRACTIONAL') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ROUTINE_COMMENT` text CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `DEFINER` varchar(288) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `CHARACTER_SET_CLIENT` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `COLLATION_CONNECTION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DATABASE_COLLATION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL
);

-- ----------------------------
-- Table structure for SCHEMA_PRIVILEGES
-- ----------------------------
DROP TABLE IF EXISTS `SCHEMA_PRIVILEGES`;
CREATE TABLE `SCHEMA_PRIVILEGES`  (
  `GRANTEE` varchar(292) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_CATALOG` varchar(512) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PRIVILEGE_TYPE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for SCHEMATA
-- ----------------------------
DROP TABLE IF EXISTS `SCHEMATA`;
CREATE TABLE `SCHEMATA`  (
  `CATALOG_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SCHEMA_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `DEFAULT_CHARACTER_SET_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DEFAULT_COLLATION_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `SQL_PATH` binary(0) NULL DEFAULT NULL,
  `DEFAULT_ENCRYPTION` enum('NO','YES') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL
);

-- ----------------------------
-- Table structure for SCHEMATA_EXTENSIONS
-- ----------------------------
DROP TABLE IF EXISTS `SCHEMATA_EXTENSIONS`;
CREATE TABLE `SCHEMATA_EXTENSIONS`  (
  `CATALOG_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SCHEMA_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `OPTIONS` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for ST_GEOMETRY_COLUMNS
-- ----------------------------
DROP TABLE IF EXISTS `ST_GEOMETRY_COLUMNS`;
CREATE TABLE `ST_GEOMETRY_COLUMNS`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SRS_NAME` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `SRS_ID` int UNSIGNED NULL DEFAULT NULL,
  `GEOMETRY_TYPE_NAME` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL
);

-- ----------------------------
-- Table structure for ST_SPATIAL_REFERENCE_SYSTEMS
-- ----------------------------
DROP TABLE IF EXISTS `ST_SPATIAL_REFERENCE_SYSTEMS`;
CREATE TABLE `ST_SPATIAL_REFERENCE_SYSTEMS`  (
  `SRS_NAME` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `SRS_ID` int UNSIGNED NOT NULL,
  `ORGANIZATION` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `ORGANIZATION_COORDSYS_ID` int UNSIGNED NULL DEFAULT NULL,
  `DEFINITION` varchar(4096) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `DESCRIPTION` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for ST_UNITS_OF_MEASURE
-- ----------------------------
DROP TABLE IF EXISTS `ST_UNITS_OF_MEASURE`;
CREATE TABLE `ST_UNITS_OF_MEASURE`  (
  `UNIT_NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `UNIT_TYPE` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `CONVERSION_FACTOR` double NULL DEFAULT NULL,
  `DESCRIPTION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for STATISTICS
-- ----------------------------
DROP TABLE IF EXISTS `STATISTICS`;
CREATE TABLE `STATISTICS`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `NON_UNIQUE` int NOT NULL DEFAULT 0,
  `INDEX_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `INDEX_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SEQ_IN_INDEX` int UNSIGNED NOT NULL,
  `COLUMN_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `COLLATION` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `CARDINALITY` bigint NULL DEFAULT NULL,
  `SUB_PART` bigint NULL DEFAULT NULL,
  `PACKED` binary(0) NULL DEFAULT NULL,
  `NULLABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `INDEX_TYPE` varchar(11) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `COMMENT` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `INDEX_COMMENT` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `IS_VISIBLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `EXPRESSION` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL
);

-- ----------------------------
-- Table structure for TABLE_CONSTRAINTS
-- ----------------------------
DROP TABLE IF EXISTS `TABLE_CONSTRAINTS`;
CREATE TABLE `TABLE_CONSTRAINTS`  (
  `CONSTRAINT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `CONSTRAINT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `CONSTRAINT_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `CONSTRAINT_TYPE` varchar(11) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `ENFORCED` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for TABLE_CONSTRAINTS_EXTENSIONS
-- ----------------------------
DROP TABLE IF EXISTS `TABLE_CONSTRAINTS_EXTENSIONS`;
CREATE TABLE `TABLE_CONSTRAINTS_EXTENSIONS`  (
  `CONSTRAINT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `CONSTRAINT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `CONSTRAINT_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `ENGINE_ATTRIBUTE` json NULL,
  `SECONDARY_ENGINE_ATTRIBUTE` json NULL
);

-- ----------------------------
-- Table structure for TABLE_PRIVILEGES
-- ----------------------------
DROP TABLE IF EXISTS `TABLE_PRIVILEGES`;
CREATE TABLE `TABLE_PRIVILEGES`  (
  `GRANTEE` varchar(292) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_CATALOG` varchar(512) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PRIVILEGE_TYPE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for TABLES
-- ----------------------------
DROP TABLE IF EXISTS `TABLES`;
CREATE TABLE `TABLES`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_TYPE` enum('BASE TABLE','VIEW','SYSTEM VIEW') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ENGINE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `VERSION` int NULL DEFAULT NULL,
  `ROW_FORMAT` enum('Fixed','Dynamic','Compressed','Redundant','Compact','Paged') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `TABLE_ROWS` bigint UNSIGNED NULL DEFAULT NULL,
  `AVG_ROW_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `DATA_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `MAX_DATA_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `INDEX_LENGTH` bigint UNSIGNED NULL DEFAULT NULL,
  `DATA_FREE` bigint UNSIGNED NULL DEFAULT NULL,
  `AUTO_INCREMENT` bigint UNSIGNED NULL DEFAULT NULL,
  `CREATE_TIME` timestamp NOT NULL,
  `UPDATE_TIME` datetime NULL DEFAULT NULL,
  `CHECK_TIME` datetime NULL DEFAULT NULL,
  `TABLE_COLLATION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `CHECKSUM` bigint NULL DEFAULT NULL,
  `CREATE_OPTIONS` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `TABLE_COMMENT` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL
);

-- ----------------------------
-- Table structure for TABLES_EXTENSIONS
-- ----------------------------
DROP TABLE IF EXISTS `TABLES_EXTENSIONS`;
CREATE TABLE `TABLES_EXTENSIONS`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NOT NULL,
  `ENGINE_ATTRIBUTE` json NULL,
  `SECONDARY_ENGINE_ATTRIBUTE` json NULL
);

-- ----------------------------
-- Table structure for TABLESPACES
-- ----------------------------
DROP TABLE IF EXISTS `TABLESPACES`;
CREATE TABLE `TABLESPACES`  (
  `TABLESPACE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `ENGINE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLESPACE_TYPE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `LOGFILE_GROUP_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `EXTENT_SIZE` bigint UNSIGNED NULL DEFAULT '',
  `AUTOEXTEND_SIZE` bigint UNSIGNED NULL DEFAULT '',
  `MAXIMUM_SIZE` bigint UNSIGNED NULL DEFAULT '',
  `NODEGROUP_ID` bigint UNSIGNED NULL DEFAULT '',
  `TABLESPACE_COMMENT` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for TABLESPACES_EXTENSIONS
-- ----------------------------
DROP TABLE IF EXISTS `TABLESPACES_EXTENSIONS`;
CREATE TABLE `TABLESPACES_EXTENSIONS`  (
  `TABLESPACE_NAME` varchar(268) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ENGINE_ATTRIBUTE` json NULL
);

-- ----------------------------
-- Table structure for TRIGGERS
-- ----------------------------
DROP TABLE IF EXISTS `TRIGGERS`;
CREATE TABLE `TRIGGERS`  (
  `TRIGGER_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TRIGGER_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TRIGGER_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `EVENT_MANIPULATION` enum('INSERT','UPDATE','DELETE') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `EVENT_OBJECT_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `EVENT_OBJECT_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `EVENT_OBJECT_TABLE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `ACTION_ORDER` int UNSIGNED NOT NULL,
  `ACTION_CONDITION` binary(0) NULL DEFAULT NULL,
  `ACTION_STATEMENT` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ACTION_ORIENTATION` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `ACTION_TIMING` enum('BEFORE','AFTER') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ACTION_REFERENCE_OLD_TABLE` binary(0) NULL DEFAULT NULL,
  `ACTION_REFERENCE_NEW_TABLE` binary(0) NULL DEFAULT NULL,
  `ACTION_REFERENCE_OLD_ROW` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `ACTION_REFERENCE_NEW_ROW` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `CREATED` timestamp(2) NOT NULL,
  `SQL_MODE` set('REAL_AS_FLOAT','PIPES_AS_CONCAT','ANSI_QUOTES','IGNORE_SPACE','NOT_USED','ONLY_FULL_GROUP_BY','NO_UNSIGNED_SUBTRACTION','NO_DIR_IN_CREATE','NOT_USED_9','NOT_USED_10','NOT_USED_11','NOT_USED_12','NOT_USED_13','NOT_USED_14','NOT_USED_15','NOT_USED_16','NOT_USED_17','NOT_USED_18','ANSI','NO_AUTO_VALUE_ON_ZERO','NO_BACKSLASH_ESCAPES','STRICT_TRANS_TABLES','STRICT_ALL_TABLES','NO_ZERO_IN_DATE','NO_ZERO_DATE','ALLOW_INVALID_DATES','ERROR_FOR_DIVISION_BY_ZERO','TRADITIONAL','NOT_USED_29','HIGH_NOT_PRECEDENCE','NO_ENGINE_SUBSTITUTION','PAD_CHAR_TO_FULL_LENGTH','TIME_TRUNCATE_FRACTIONAL') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `DEFINER` varchar(288) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `CHARACTER_SET_CLIENT` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `COLLATION_CONNECTION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DATABASE_COLLATION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL
);

-- ----------------------------
-- Table structure for USER_ATTRIBUTES
-- ----------------------------
DROP TABLE IF EXISTS `USER_ATTRIBUTES`;
CREATE TABLE `USER_ATTRIBUTES`  (
  `USER` char(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '',
  `HOST` char(255) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '',
  `ATTRIBUTE` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL
);

-- ----------------------------
-- Table structure for USER_PRIVILEGES
-- ----------------------------
DROP TABLE IF EXISTS `USER_PRIVILEGES`;
CREATE TABLE `USER_PRIVILEGES`  (
  `GRANTEE` varchar(292) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `TABLE_CATALOG` varchar(512) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `PRIVILEGE_TYPE` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `IS_GRANTABLE` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ''
);

-- ----------------------------
-- Table structure for VIEW_ROUTINE_USAGE
-- ----------------------------
DROP TABLE IF EXISTS `VIEW_ROUTINE_USAGE`;
CREATE TABLE `VIEW_ROUTINE_USAGE`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SPECIFIC_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SPECIFIC_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `SPECIFIC_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL
);

-- ----------------------------
-- Table structure for VIEW_TABLE_USAGE
-- ----------------------------
DROP TABLE IF EXISTS `VIEW_TABLE_USAGE`;
CREATE TABLE `VIEW_TABLE_USAGE`  (
  `VIEW_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `VIEW_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `VIEW_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL
);

-- ----------------------------
-- Table structure for VIEWS
-- ----------------------------
DROP TABLE IF EXISTS `VIEWS`;
CREATE TABLE `VIEWS`  (
  `TABLE_CATALOG` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_SCHEMA` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `TABLE_NAME` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_tolower_ci NULL DEFAULT NULL,
  `VIEW_DEFINITION` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL,
  `CHECK_OPTION` enum('NONE','LOCAL','CASCADED') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `IS_UPDATABLE` enum('NO','YES') CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `DEFINER` varchar(288) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `SECURITY_TYPE` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NULL DEFAULT NULL,
  `CHARACTER_SET_CLIENT` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `COLLATION_CONNECTION` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL
);

SET FOREIGN_KEY_CHECKS = 1;
