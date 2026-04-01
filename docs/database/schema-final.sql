-- ============================================================
-- 数据管理平台 - 最终版数据库表结构（完整 DDL + 种子数据）
-- 数据库：MySQL 8.0+
-- 字符集：utf8mb4
-- 合并自 schema.sql（29张基线表）+ schema-revision.sql（增量修订）
-- 共计 33 张表
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- ============================================================
-- 一、系统基础模块（8 张表）
-- ============================================================

-- 1. 用户表
CREATE TABLE `sys_user` (
  `id`              bigint       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username`        varchar(50)  NOT NULL COMMENT '用户名（登录账号）',
  `password`        varchar(255) NOT NULL COMMENT '密码（加密存储）',
  `real_name`       varchar(50)  NOT NULL COMMENT '真实姓名',
  `email`           varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone`           varchar(20)  DEFAULT NULL COMMENT '手机号',
  `department`      varchar(100) DEFAULT NULL COMMENT '所属部门',
  `status`          tinyint      NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用 2-锁定',
  `login_fail_count` int         NOT NULL DEFAULT 0 COMMENT '连续登录失败次数',
  `lock_expire_at`  datetime     DEFAULT NULL COMMENT '账号锁定过期时间',
  `last_login_at`   datetime     DEFAULT NULL COMMENT '最后登录时间',
  `created_at`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 2. 角色表
CREATE TABLE `sys_role` (
  `id`          bigint       NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_code`   varchar(50)  NOT NULL COMMENT '角色编码（admin/business/developer/team_leader）',
  `role_name`   varchar(100) NOT NULL COMMENT '角色名称',
  `description` varchar(500) DEFAULT NULL COMMENT '角色描述',
  `status`      tinyint      NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `created_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 3. 用户-角色关联表
CREATE TABLE `sys_user_role` (
  `id`         bigint   NOT NULL AUTO_INCREMENT,
  `user_id`    bigint   NOT NULL COMMENT '用户ID',
  `role_id`    bigint   NOT NULL COMMENT '角色ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关联表';

-- 4. 权限表
CREATE TABLE `sys_permission` (
  `id`              bigint       NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `permission_code` varchar(100) NOT NULL COMMENT '权限编码',
  `permission_name` varchar(100) NOT NULL COMMENT '权限名称',
  `resource_type`   varchar(50)  DEFAULT NULL COMMENT '资源类型：menu-菜单 button-按钮 api-接口',
  `parent_id`       bigint       DEFAULT NULL COMMENT '父权限ID',
  `sort_order`      int          NOT NULL DEFAULT 0 COMMENT '排序',
  `description`     varchar(500) DEFAULT NULL COMMENT '权限描述',
  `created_at`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permission_code` (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统权限表';

-- 5. 角色-权限关联表
CREATE TABLE `sys_role_permission` (
  `id`            bigint   NOT NULL AUTO_INCREMENT,
  `role_id`       bigint   NOT NULL COMMENT '角色ID',
  `permission_id` bigint   NOT NULL COMMENT '权限ID',
  `created_at`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联表';

-- 6. 数据权限配置表（按主题/部门隔离）
CREATE TABLE `sys_data_permission` (
  `id`              bigint      NOT NULL AUTO_INCREMENT,
  `role_id`         bigint      NOT NULL COMMENT '角色ID',
  `permission_type` varchar(20) NOT NULL COMMENT '权限维度：theme-主题 department-部门',
  `target_id`       bigint      NOT NULL COMMENT '目标ID（主题ID 或 部门记录ID）',
  `created_at`      datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_data_perm` (`role_id`, `permission_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限配置表';

-- 7. 开发团队表
CREATE TABLE `sys_team` (
  `id`         bigint       NOT NULL AUTO_INCREMENT COMMENT '团队ID',
  `team_name`  varchar(100) NOT NULL COMMENT '团队名称',
  `leader_id`  bigint       NOT NULL COMMENT '组长用户ID',
  `department` varchar(100) DEFAULT NULL COMMENT '所属部门',
  `status`     tinyint      NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `created_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='开发团队表';

-- 8. 团队成员表
CREATE TABLE `sys_team_member` (
  `id`         bigint      NOT NULL AUTO_INCREMENT,
  `team_id`    bigint      NOT NULL COMMENT '团队ID',
  `user_id`    bigint      NOT NULL COMMENT '用户ID',
  `team_role`  varchar(20) NOT NULL DEFAULT 'member' COMMENT '团队角色：leader-组长 member-成员',
  `created_at` datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_team_user` (`team_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团队成员表';


-- ============================================================
-- 二、数据资产模块（8 张表）
-- ============================================================

-- 9. 主题表
CREATE TABLE `dat_theme` (
  `id`          bigint       NOT NULL AUTO_INCREMENT COMMENT '主题ID',
  `theme_name`  varchar(100) NOT NULL COMMENT '主题名称',
  `department`  varchar(100) NOT NULL COMMENT '所属部门',
  `description` text         DEFAULT NULL COMMENT '主题描述（业务含义、覆盖范围）',
  `created_by`  bigint       NOT NULL COMMENT '创建人ID',
  `updated_by`  bigint       DEFAULT NULL COMMENT '更新人ID',
  `created_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_theme_name` (`theme_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='主题表（数据资产最高层级分类）';

-- 10. 口径表
CREATE TABLE `dat_caliber` (
  `id`              bigint       NOT NULL AUTO_INCREMENT COMMENT '口径ID',
  `caliber_name`    varchar(200) NOT NULL COMMENT '口径名称',
  `theme_id`        bigint       NOT NULL COMMENT '所属主题ID',
  `description`     text         DEFAULT NULL COMMENT '口径描述',
  `major_version`   int          NOT NULL DEFAULT 1 COMMENT '当前主版本号',
  `minor_version`   int          NOT NULL DEFAULT 0 COMMENT '当前次版本号',
  `caliber_status`  varchar(20)  NOT NULL DEFAULT 'draft' COMMENT '口径生命周期状态：draft-草稿 active-生效 deprecated-废弃',
  `lock_status`     varchar(20)  NOT NULL DEFAULT 'free' COMMENT '锁定状态（独立于生命周期）：free-空闲 locked-已锁定',
  `lock_project_id` bigint       DEFAULT NULL COMMENT '锁定项目ID',
  `lock_time`       datetime     DEFAULT NULL COMMENT '锁定时间',
  `owner_id`        bigint       DEFAULT NULL COMMENT '口径责任人ID',
  `created_by`      bigint       NOT NULL COMMENT '创建人ID',
  `created_at`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_theme_id` (`theme_id`),
  KEY `idx_caliber_status` (`caliber_status`),
  KEY `idx_lock_status` (`lock_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口径表（对应业务宽表/统计口径表，标签通过 dat_caliber_tag 管理）';

-- 11. 口径版本表 [修订：新增 version_status 字段]
CREATE TABLE `dat_caliber_version` (
  `id`             bigint      NOT NULL AUTO_INCREMENT COMMENT '版本ID',
  `caliber_id`     bigint      NOT NULL COMMENT '口径ID',
  `major_version`  int         NOT NULL COMMENT '主版本号',
  `minor_version`  int         NOT NULL COMMENT '次版本号',
  `version_label`  varchar(20) NOT NULL COMMENT '版本标签（如 V1.0, V2.1）',
  `project_id`     bigint      DEFAULT NULL COMMENT '产生该版本的项目ID',
  `is_current`     tinyint     NOT NULL DEFAULT 0 COMMENT '是否为当前生效版本：0-否 1-是',
  `version_status` varchar(20) NOT NULL DEFAULT 'draft' COMMENT '版本状态：draft-草稿（项目进行中） active-生效（项目上线后定格） deprecated-已废弃（项目取消/口径移除）',
  `description`    text        DEFAULT NULL COMMENT '版本变更说明',
  `created_by`     bigint      NOT NULL COMMENT '创建人ID',
  `created_at`     datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_caliber_version` (`caliber_id`, `major_version`, `minor_version`),
  KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口径版本表';

-- 12. 要素表（主表，维护要素当前状态）
CREATE TABLE `dat_element` (
  `id`                 bigint       NOT NULL AUTO_INCREMENT COMMENT '要素ID',
  `element_name`       varchar(200) NOT NULL COMMENT '要素名称',
  `caliber_id`         bigint       NOT NULL COMMENT '所属口径ID',
  `element_type`       varchar(50)  NOT NULL COMMENT '要素类型：string-字符串 number-数字 date-日期 boolean-布尔值',
  `business_meaning`   text         DEFAULT NULL COMMENT '业务含义',
  `is_required`        tinyint      NOT NULL DEFAULT 0 COMMENT '是否必填：0-否 1-是',
  `default_value`      varchar(500) DEFAULT NULL COMMENT '默认值',
  `created_version_id` bigint       NOT NULL COMMENT '首次创建时的口径版本ID',
  `status`             varchar(20)  NOT NULL DEFAULT 'active' COMMENT '状态：active-有效 deprecated-废弃',
  `created_by`         bigint       NOT NULL COMMENT '创建人ID',
  `created_at`         datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_caliber_id` (`caliber_id`),
  KEY `idx_element_type` (`element_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='要素表（口径的最小组成单元，对应字段）';

-- 13. 版本要素快照表（记录每个口径版本下的完整要素状态，支持版本对比）
CREATE TABLE `dat_version_element` (
  `id`               bigint       NOT NULL AUTO_INCREMENT,
  `version_id`       bigint       NOT NULL COMMENT '口径版本ID',
  `element_id`       bigint       NOT NULL COMMENT '要素ID',
  `element_name`     varchar(200) NOT NULL COMMENT '要素名称（快照）',
  `element_type`     varchar(50)  NOT NULL COMMENT '要素类型（快照）',
  `business_meaning` text         DEFAULT NULL COMMENT '业务含义（快照）',
  `is_required`      tinyint      NOT NULL DEFAULT 0 COMMENT '是否必填（快照）',
  `default_value`    varchar(500) DEFAULT NULL COMMENT '默认值（快照）',
  `change_type`      varchar(20)  NOT NULL DEFAULT 'none' COMMENT '相对上一版本的变更类型：none-无变化 add-新增 modify-修改 delete-删除',
  `created_at`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_version_element` (`version_id`, `element_id`),
  KEY `idx_element_id` (`element_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='版本要素快照表（每个版本的要素完整状态，用于版本对比）';

-- 14. 要素变更记录表
CREATE TABLE `dat_element_change` (
  `id`          bigint       NOT NULL AUTO_INCREMENT,
  `element_id`  bigint       NOT NULL COMMENT '要素ID',
  `version_id`  bigint       NOT NULL COMMENT '变更所属口径版本ID',
  `change_type` varchar(20)  NOT NULL COMMENT '变更类型：add-新增 modify-修改 delete-删除',
  `field_name`  varchar(100) DEFAULT NULL COMMENT '修改的属性名（modify时有值）',
  `old_value`   text         DEFAULT NULL COMMENT '修改前的值',
  `new_value`   text         DEFAULT NULL COMMENT '修改后的值',
  `changed_by`  bigint       NOT NULL COMMENT '修改人ID',
  `changed_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_element_id` (`element_id`),
  KEY `idx_version_id` (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='要素变更记录表';

-- 15. 口径标签表 [新增：多对多标签关系]
CREATE TABLE `dat_caliber_tag` (
  `id`         bigint       NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `caliber_id` bigint       NOT NULL COMMENT '口径ID',
  `tag_name`   varchar(50)  NOT NULL COMMENT '标签名称（如：核心指标、派生指标、同比环比类、高频变更）',
  `created_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_caliber_tag` (`caliber_id`, `tag_name`),
  KEY `idx_tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口径标签表（支持多标签分类和检索）';

-- 16. 数据血缘关系表 [新增：记录技术口径的上游数据来源]
CREATE TABLE `dat_caliber_lineage` (
  `id`                   bigint       NOT NULL AUTO_INCREMENT COMMENT '血缘记录ID',
  `technical_caliber_id` bigint       NOT NULL COMMENT '技术口径ID（下游消费方）',
  `source_type`          varchar(20)  NOT NULL COMMENT '来源类型：caliber-平台内口径 external-外部表',
  `source_caliber_id`    bigint       DEFAULT NULL COMMENT '来源口径ID（source_type=caliber时有值）',
  `source_table_name`    varchar(200) DEFAULT NULL COMMENT '来源外部表名（source_type=external时有值）',
  `description`          varchar(500) DEFAULT NULL COMMENT '引用说明（如引用了哪些字段）',
  `created_at`           datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_technical_caliber_id` (`technical_caliber_id`),
  KEY `idx_source_caliber_id` (`source_caliber_id`),
  KEY `idx_source_type` (`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据血缘关系表（记录口径之间的上下游引用关系）';


-- ============================================================
-- 三、项目流程模块（10 张表）
-- ============================================================

-- 17. 项目表 [修订：新增暂停/取消字段，移除 preview_ready，扩展状态枚举]
CREATE TABLE `prj_project` (
  `id`                   bigint       NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `project_name`         varchar(200) NOT NULL COMMENT '项目名称',
  `department`           varchar(100) NOT NULL COMMENT '所属部门',
  `description`          text         DEFAULT NULL COMMENT '项目描述（本次迭代核心目标）',
  `expected_launch_date` date         DEFAULT NULL COMMENT '期望上线时间',
  `owner_id`             bigint       NOT NULL COMMENT '负责人ID（业务人员）',
  `status`               varchar(30)  NOT NULL DEFAULT 'pending_clarification' COMMENT '项目状态：pending_clarification-待澄清 developing-开发中 pending_acceptance-待验收 pending_launch-待上线 launched-已上线 archived-已归档 paused-已暂停 cancelled-已取消',
  `launched_at`          datetime     DEFAULT NULL COMMENT '实际上线时间',
  `archived_at`          datetime     DEFAULT NULL COMMENT '归档时间',
  `pause_reason`         varchar(500) DEFAULT NULL COMMENT '暂停原因',
  `paused_at`            datetime     DEFAULT NULL COMMENT '暂停时间',
  `paused_by`            bigint       DEFAULT NULL COMMENT '暂停操作人ID',
  `resumed_at`           datetime     DEFAULT NULL COMMENT '恢复时间',
  `status_before_pause`  varchar(30)  DEFAULT NULL COMMENT '暂停前状态（恢复时回退至此状态）',
  `cancel_reason`        varchar(500) DEFAULT NULL COMMENT '取消原因',
  `cancelled_at`         datetime     DEFAULT NULL COMMENT '取消时间',
  `cancelled_by`         bigint       DEFAULT NULL COMMENT '取消操作人ID（发起人）',
  `cancel_approved_by`   bigint       DEFAULT NULL COMMENT '取消审批人ID（管理员）',
  `created_by`           bigint       NOT NULL COMMENT '创建人ID',
  `created_at`           datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`),
  KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 18. 项目成员表 [新增：支持多项目负责人和多开发负责人]
CREATE TABLE `prj_project_member` (
  `id`           bigint      NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `project_id`   bigint      NOT NULL COMMENT '项目ID',
  `user_id`      bigint      NOT NULL COMMENT '用户ID',
  `project_role` varchar(30) NOT NULL COMMENT '项目角色：owner-项目负责人 dev_leader-项目开发负责人',
  `created_at`   datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_member_role` (`project_id`, `user_id`, `project_role`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_role` (`project_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表（项目负责人、项目开发负责人，均支持多人）';

-- 19. 项目-口径关联表 [修订：新增 dev_type 字段]
CREATE TABLE `prj_project_caliber` (
  `id`                 bigint      NOT NULL AUTO_INCREMENT,
  `project_id`         bigint      NOT NULL COMMENT '项目ID',
  `caliber_id`         bigint      NOT NULL COMMENT '口径ID',
  `initial_version_id` bigint      DEFAULT NULL COMMENT '进入项目时的起始版本ID',
  `current_version_id` bigint      DEFAULT NULL COMMENT '项目内当前最新版本ID',
  `dev_type`           varchar(20) NOT NULL DEFAULT 'needs_tech_dev' COMMENT '开发类型：needs_tech_dev-需技术开发 biz_only-仅业务口径调整',
  `created_at`         datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_caliber` (`project_id`, `caliber_id`),
  KEY `idx_caliber_id` (`caliber_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目-口径关联表';

-- 20. 业务口径表 [修订：状态枚举调整为 draft/submitted/clarified/deprecated]
CREATE TABLE `prj_business_caliber` (
  `id`                   bigint      NOT NULL AUTO_INCREMENT COMMENT '业务口径ID',
  `caliber_id`           bigint      NOT NULL COMMENT '关联口径ID',
  `caliber_version_id`   bigint      NOT NULL COMMENT '关联口径版本ID',
  `project_id`           bigint      NOT NULL COMMENT '关联项目ID',
  `business_rules`       text        DEFAULT NULL COMMENT '业务规则（统计逻辑、计算范围、业务场景）',
  `element_requirements` text        DEFAULT NULL COMMENT '要素要求（JSON：新增/修改/删除的要素及规则）',
  `status`               varchar(30) NOT NULL DEFAULT 'draft' COMMENT '状态：draft-草稿 submitted-已提交 clarified-已澄清 deprecated-已废弃',
  `submitted_by`         bigint      NOT NULL COMMENT '提交人ID（业务人员）',
  `submitted_at`         datetime    DEFAULT NULL COMMENT '提交时间',
  `created_at`           datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_caliber_id` (`caliber_id`),
  KEY `idx_caliber_version_id` (`caliber_version_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务口径表';

-- 21. 技术口径表 [修订：新增 pending_reassessment 状态、预览数据字段、数据来源字段]
CREATE TABLE `prj_technical_caliber` (
  `id`                    bigint      NOT NULL AUTO_INCREMENT COMMENT '技术口径ID',
  `business_caliber_id`   bigint      DEFAULT NULL COMMENT '关联业务口径ID（可为空，表示暂无对应）',
  `caliber_id`            bigint      NOT NULL COMMENT '关联口径ID',
  `caliber_version_id`    bigint      NOT NULL COMMENT '关联口径版本ID',
  `project_id`            bigint      NOT NULL COMMENT '关联项目ID',
  `data_source`           text        DEFAULT NULL COMMENT '数据来源（关联的原始表、字段）',
  `etl_logic`             text        DEFAULT NULL COMMENT 'ETL逻辑',
  `sql_code`              text        DEFAULT NULL COMMENT 'SQL代码片段',
  `processing_rules`      text        DEFAULT NULL COMMENT '加工规则',
  `source_caliber_ids`    text        DEFAULT NULL COMMENT '数据来源口径ID列表（JSON数组，如 [1,5,12]，用于血缘关系）',
  `source_tables`         text        DEFAULT NULL COMMENT '数据来源外部表名列表（JSON数组，如 ["ods_order","ods_user"]，非平台内口径的上游表）',
  `developer_id`          bigint      NOT NULL COMMENT '开发人ID',
  `status`                varchar(20) NOT NULL DEFAULT 'not_started' COMMENT '状态：not_started-未开发 developing-开发中 reviewing-审核中 pending_approval-待审批 approved-审批通过 rejected-审批驳回 pending_reassessment-待重新评估 deprecated-已废弃',
  `preview_status`        varchar(20) NOT NULL DEFAULT 'not_ready' COMMENT '预览数据状态：not_ready-未就绪 ready-已就绪',
  `preview_description`   varchar(500) DEFAULT NULL COMMENT '预览数据说明（数据行数、数据存放位置等）',
  `preview_marked_by`     bigint      DEFAULT NULL COMMENT '预览数据标记人ID',
  `preview_marked_at`     datetime    DEFAULT NULL COMMENT '预览数据标记时间',
  `created_at`            datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_caliber_id` (`business_caliber_id`),
  KEY `idx_caliber_id` (`caliber_id`),
  KEY `idx_caliber_version_id` (`caliber_version_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_developer_id` (`developer_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术口径表';

-- 22. 技术口径审核记录表
CREATE TABLE `prj_review_record` (
  `id`                   bigint   NOT NULL AUTO_INCREMENT COMMENT '审核记录ID',
  `technical_caliber_id` bigint   NOT NULL COMMENT '技术口径ID',
  `reviewer_id`          bigint   NOT NULL COMMENT '审核人ID',
  `review_comment`       text     DEFAULT NULL COMMENT '审核意见',
  `created_at`           datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审核时间',
  PRIMARY KEY (`id`),
  KEY `idx_technical_caliber_id` (`technical_caliber_id`),
  KEY `idx_reviewer_id` (`reviewer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术口径审核记录表';

-- 23. 技术口径问题表
CREATE TABLE `prj_caliber_issue` (
  `id`                   bigint       NOT NULL AUTO_INCREMENT COMMENT '问题ID',
  `technical_caliber_id` bigint       NOT NULL COMMENT '技术口径ID',
  `description`          text         NOT NULL COMMENT '问题描述',
  `raised_by`            bigint       NOT NULL COMMENT '提出人ID',
  `raised_at`            datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提出时间',
  `status`               varchar(20)  NOT NULL DEFAULT 'open' COMMENT '状态：open-待处理 fixing-待修复 fixed-已修复 rejected-已驳回',
  `reject_reason`        text         DEFAULT NULL COMMENT '驳回原因（驳回时填写）',
  `fixed_by`             bigint       DEFAULT NULL COMMENT '修复人ID',
  `fixed_at`             datetime     DEFAULT NULL COMMENT '修复时间',
  `fix_description`      text         DEFAULT NULL COMMENT '修复说明',
  `created_at`           datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_technical_caliber_id` (`technical_caliber_id`),
  KEY `idx_status` (`status`),
  KEY `idx_raised_by` (`raised_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术口径问题表';

-- 24. 技术口径审批记录表
CREATE TABLE `prj_approval_record` (
  `id`                   bigint      NOT NULL AUTO_INCREMENT COMMENT '审批记录ID',
  `technical_caliber_id` bigint      NOT NULL COMMENT '技术口径ID',
  `approver_id`          bigint      NOT NULL COMMENT '审批人ID',
  `approval_result`      varchar(20) NOT NULL COMMENT '审批结果：approved-通过 rejected-驳回',
  `approval_comment`     text        DEFAULT NULL COMMENT '审批意见',
  `is_delegated`         tinyint     NOT NULL DEFAULT 0 COMMENT '是否委托审批：0-否 1-是',
  `delegated_by`         bigint      DEFAULT NULL COMMENT '委托人ID（原审批人/组长）',
  `created_at`           datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审批时间',
  PRIMARY KEY (`id`),
  KEY `idx_technical_caliber_id` (`technical_caliber_id`),
  KEY `idx_approver_id` (`approver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术口径审批记录表';

-- 25. 审批委托表
CREATE TABLE `prj_approval_delegation` (
  `id`           bigint       NOT NULL AUTO_INCREMENT COMMENT '委托ID',
  `delegator_id` bigint       NOT NULL COMMENT '委托人ID（组长）',
  `delegate_id`  bigint       NOT NULL COMMENT '被委托人ID',
  `start_time`   datetime     NOT NULL COMMENT '委托开始时间',
  `end_time`     datetime     NOT NULL COMMENT '委托结束时间',
  `reason`       varchar(500) DEFAULT NULL COMMENT '委托原因',
  `status`       varchar(20)  NOT NULL DEFAULT 'active' COMMENT '状态：active-生效中 expired-已过期 cancelled-已取消',
  `created_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_delegator_id` (`delegator_id`),
  KEY `idx_delegate_id` (`delegate_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批委托表';

-- 26. 验收记录表 [修订：新增 reject_type 字段]
CREATE TABLE `prj_acceptance_record` (
  `id`                   bigint      NOT NULL AUTO_INCREMENT COMMENT '验收记录ID',
  `project_id`           bigint      NOT NULL COMMENT '项目ID',
  `caliber_id`           bigint      DEFAULT NULL COMMENT '关联口径ID',
  `business_caliber_id`  bigint      DEFAULT NULL COMMENT '关联业务口径ID',
  `technical_caliber_id` bigint      DEFAULT NULL COMMENT '关联技术口径ID',
  `acceptor_id`          bigint      NOT NULL COMMENT '验收人ID（业务人员）',
  `result`               varchar(20) NOT NULL COMMENT '验收结果：passed-通过 failed-不通过',
  `reject_type`          varchar(30) DEFAULT NULL COMMENT '驳回类型（result=failed时必填）：biz_issue-业务口径问题 tech_issue-技术实现问题',
  `comment`              text        DEFAULT NULL COMMENT '验收意见',
  `reject_reason`        text        DEFAULT NULL COMMENT '驳回原因（不通过时填写）',
  `created_at`           datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '验收时间',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_acceptor_id` (`acceptor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验收记录表';


-- ============================================================
-- 四、协作模块（3 张表）
-- ============================================================

-- 27. 评论表
CREATE TABLE `collab_comment` (
  `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `target_type`   varchar(50)  NOT NULL COMMENT '评论目标类型：project-项目 business_caliber-业务口径',
  `target_id`     bigint       NOT NULL COMMENT '评论目标ID',
  `parent_id`     bigint       DEFAULT NULL COMMENT '父评论ID（支持回复嵌套）',
  `content`       text         NOT NULL COMMENT '评论内容',
  `author_id`     bigint       NOT NULL COMMENT '作者ID',
  `is_hidden`     tinyint      NOT NULL DEFAULT 0 COMMENT '是否隐藏：0-否 1-是',
  `hidden_by`     bigint       DEFAULT NULL COMMENT '隐藏操作人ID',
  `hidden_at`     datetime     DEFAULT NULL COMMENT '隐藏时间',
  `hidden_reason` varchar(500) DEFAULT NULL COMMENT '隐藏原因',
  `created_at`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 28. 评论@成员表
CREATE TABLE `collab_comment_mention` (
  `id`                bigint   NOT NULL AUTO_INCREMENT,
  `comment_id`        bigint   NOT NULL COMMENT '评论ID',
  `mentioned_user_id` bigint   NOT NULL COMMENT '被@的用户ID',
  `created_at`        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_id` (`comment_id`),
  KEY `idx_mentioned_user_id` (`mentioned_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论@成员关联表';

-- 29. 评论附件表
CREATE TABLE `collab_comment_attachment` (
  `id`         bigint        NOT NULL AUTO_INCREMENT,
  `comment_id` bigint        NOT NULL COMMENT '评论ID',
  `file_name`  varchar(500)  NOT NULL COMMENT '文件名',
  `file_path`  varchar(1000) NOT NULL COMMENT '文件存储路径',
  `file_size`  bigint        DEFAULT NULL COMMENT '文件大小（字节）',
  `file_type`  varchar(50)   DEFAULT NULL COMMENT '文件MIME类型',
  `created_at` datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_id` (`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论附件表';


-- ============================================================
-- 五、通知与日志模块（3 张表）
-- ============================================================

-- 30. 通知消息表
CREATE TABLE `sys_notification` (
  `id`                bigint       NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id`           bigint       NOT NULL COMMENT '接收用户ID',
  `title`             varchar(200) NOT NULL COMMENT '通知标题',
  `content`           text         DEFAULT NULL COMMENT '通知内容',
  `notification_type` varchar(50)  NOT NULL COMMENT '通知类型：project_status/clarification/biz_caliber_change/review/review_issue/approval/approval_timeout/acceptance/launch/lock/reassessment/overdue/pause_timeout/comment_mention',
  `target_type`       varchar(50)  DEFAULT NULL COMMENT '关联目标类型：project/business_caliber/technical_caliber',
  `target_id`         bigint       DEFAULT NULL COMMENT '关联目标ID',
  `is_read`           tinyint      NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读 1-已读',
  `read_at`           datetime     DEFAULT NULL COMMENT '阅读时间',
  `created_at`        datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`, `is_read`),
  KEY `idx_notification_type` (`notification_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知消息表';

-- 31. 通知偏好配置表 [新增：用户自定义各类通知的邮件开关]
CREATE TABLE `sys_notification_preference` (
  `id`                bigint      NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id`           bigint      NOT NULL COMMENT '用户ID',
  `notification_type` varchar(50) NOT NULL COMMENT '通知类型（与 sys_notification.notification_type 对应）',
  `email_enabled`     tinyint     NOT NULL DEFAULT 1 COMMENT '是否启用邮件通知：0-关闭 1-开启',
  `created_at`        datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_notif_type` (`user_id`, `notification_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知偏好配置表（站内消息默认开启不可关闭，邮件通知可按类型开关）';

-- 32. 操作日志表
CREATE TABLE `sys_operation_log` (
  `id`             bigint      NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `operator_id`    bigint      NOT NULL COMMENT '操作人ID',
  `operation_type` varchar(50) NOT NULL COMMENT '操作类型：create/update/delete/submit/review/approve/reject/accept/lock/unlock/hide/import/launch/archive/pause/cancel/resume',
  `target_type`    varchar(50) NOT NULL COMMENT '目标类型：project/theme/caliber/element/business_caliber/technical_caliber/user/role/team',
  `target_id`      bigint      NOT NULL COMMENT '目标ID',
  `project_id`     bigint      DEFAULT NULL COMMENT '关联项目ID',
  `caliber_id`     bigint      DEFAULT NULL COMMENT '关联口径ID',
  `detail`         text        DEFAULT NULL COMMENT '操作详情（JSON格式，记录变更前后值）',
  `ip_address`     varchar(50) DEFAULT NULL COMMENT '操作IP地址',
  `created_at`     datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_caliber_id` (`caliber_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';


-- ============================================================
-- 六、数据导入模块（1 张表）
-- ============================================================

-- 33. 导入记录表
CREATE TABLE `sys_import_record` (
  `id`            bigint        NOT NULL AUTO_INCREMENT COMMENT '导入记录ID',
  `import_type`   varchar(50)   NOT NULL COMMENT '导入类型：caliber-口径 element-要素',
  `file_name`     varchar(500)  NOT NULL COMMENT '导入文件名',
  `file_path`     varchar(1000) NOT NULL COMMENT '导入文件路径',
  `total_count`   int           NOT NULL DEFAULT 0 COMMENT '总条数',
  `success_count` int           NOT NULL DEFAULT 0 COMMENT '成功条数',
  `fail_count`    int           NOT NULL DEFAULT 0 COMMENT '失败条数',
  `status`        varchar(20)   NOT NULL DEFAULT 'processing' COMMENT '状态：processing-处理中 completed-已完成 failed-失败',
  `error_detail`  text          DEFAULT NULL COMMENT '错误详情（JSON格式）',
  `imported_by`   bigint        NOT NULL COMMENT '导入人ID',
  `completed_at`  datetime      DEFAULT NULL COMMENT '完成时间',
  `created_at`    datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_imported_by` (`imported_by`),
  KEY `idx_import_type` (`import_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据导入记录表';


-- ============================================================
-- 七、外键约束（统一添加，便于维护和按需开关）
-- ============================================================

-- 用户角色
ALTER TABLE `sys_user_role`
  ADD CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`),
  ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`);

-- 角色权限
ALTER TABLE `sys_role_permission`
  ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`),
  ADD CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`id`);

-- 数据权限
ALTER TABLE `sys_data_permission`
  ADD CONSTRAINT `fk_dp_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`);

-- 团队
ALTER TABLE `sys_team`
  ADD CONSTRAINT `fk_team_leader` FOREIGN KEY (`leader_id`) REFERENCES `sys_user` (`id`);

ALTER TABLE `sys_team_member`
  ADD CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `sys_team` (`id`),
  ADD CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`);

-- 主题
ALTER TABLE `dat_theme`
  ADD CONSTRAINT `fk_theme_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`id`);

-- 口径
ALTER TABLE `dat_caliber`
  ADD CONSTRAINT `fk_caliber_theme` FOREIGN KEY (`theme_id`) REFERENCES `dat_theme` (`id`),
  ADD CONSTRAINT `fk_caliber_owner` FOREIGN KEY (`owner_id`) REFERENCES `sys_user` (`id`),
  ADD CONSTRAINT `fk_caliber_lock_project` FOREIGN KEY (`lock_project_id`) REFERENCES `prj_project` (`id`);

-- 口径标签
ALTER TABLE `dat_caliber_tag`
  ADD CONSTRAINT `fk_ct_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`);

-- 口径版本
ALTER TABLE `dat_caliber_version`
  ADD CONSTRAINT `fk_cv_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`),
  ADD CONSTRAINT `fk_cv_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`);

-- 要素
ALTER TABLE `dat_element`
  ADD CONSTRAINT `fk_element_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`),
  ADD CONSTRAINT `fk_element_version` FOREIGN KEY (`created_version_id`) REFERENCES `dat_caliber_version` (`id`);

-- 版本要素快照
ALTER TABLE `dat_version_element`
  ADD CONSTRAINT `fk_ve_version` FOREIGN KEY (`version_id`) REFERENCES `dat_caliber_version` (`id`),
  ADD CONSTRAINT `fk_ve_element` FOREIGN KEY (`element_id`) REFERENCES `dat_element` (`id`);

-- 要素变更
ALTER TABLE `dat_element_change`
  ADD CONSTRAINT `fk_ec_element` FOREIGN KEY (`element_id`) REFERENCES `dat_element` (`id`),
  ADD CONSTRAINT `fk_ec_version` FOREIGN KEY (`version_id`) REFERENCES `dat_caliber_version` (`id`);

-- 项目
ALTER TABLE `prj_project`
  ADD CONSTRAINT `fk_project_owner` FOREIGN KEY (`owner_id`) REFERENCES `sys_user` (`id`);

-- 项目成员
ALTER TABLE `prj_project_member`
  ADD CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`),
  ADD CONSTRAINT `fk_pm_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`);

-- 项目口径关联
ALTER TABLE `prj_project_caliber`
  ADD CONSTRAINT `fk_pc_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`),
  ADD CONSTRAINT `fk_pc_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`),
  ADD CONSTRAINT `fk_pc_initial_version` FOREIGN KEY (`initial_version_id`) REFERENCES `dat_caliber_version` (`id`),
  ADD CONSTRAINT `fk_pc_current_version` FOREIGN KEY (`current_version_id`) REFERENCES `dat_caliber_version` (`id`);

-- 业务口径
ALTER TABLE `prj_business_caliber`
  ADD CONSTRAINT `fk_bc_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`),
  ADD CONSTRAINT `fk_bc_version` FOREIGN KEY (`caliber_version_id`) REFERENCES `dat_caliber_version` (`id`),
  ADD CONSTRAINT `fk_bc_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`),
  ADD CONSTRAINT `fk_bc_submitter` FOREIGN KEY (`submitted_by`) REFERENCES `sys_user` (`id`);

-- 技术口径
ALTER TABLE `prj_technical_caliber`
  ADD CONSTRAINT `fk_tc_business_caliber` FOREIGN KEY (`business_caliber_id`) REFERENCES `prj_business_caliber` (`id`),
  ADD CONSTRAINT `fk_tc_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`),
  ADD CONSTRAINT `fk_tc_version` FOREIGN KEY (`caliber_version_id`) REFERENCES `dat_caliber_version` (`id`),
  ADD CONSTRAINT `fk_tc_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`),
  ADD CONSTRAINT `fk_tc_developer` FOREIGN KEY (`developer_id`) REFERENCES `sys_user` (`id`);

-- 数据血缘
ALTER TABLE `dat_caliber_lineage`
  ADD CONSTRAINT `fk_cl_tech` FOREIGN KEY (`technical_caliber_id`) REFERENCES `prj_technical_caliber` (`id`),
  ADD CONSTRAINT `fk_cl_source` FOREIGN KEY (`source_caliber_id`) REFERENCES `dat_caliber` (`id`);

-- 审核记录
ALTER TABLE `prj_review_record`
  ADD CONSTRAINT `fk_rr_technical_caliber` FOREIGN KEY (`technical_caliber_id`) REFERENCES `prj_technical_caliber` (`id`),
  ADD CONSTRAINT `fk_rr_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `sys_user` (`id`);

-- 技术口径问题
ALTER TABLE `prj_caliber_issue`
  ADD CONSTRAINT `fk_ci_technical_caliber` FOREIGN KEY (`technical_caliber_id`) REFERENCES `prj_technical_caliber` (`id`),
  ADD CONSTRAINT `fk_ci_raised_by` FOREIGN KEY (`raised_by`) REFERENCES `sys_user` (`id`);

-- 审批记录
ALTER TABLE `prj_approval_record`
  ADD CONSTRAINT `fk_ar_technical_caliber` FOREIGN KEY (`technical_caliber_id`) REFERENCES `prj_technical_caliber` (`id`),
  ADD CONSTRAINT `fk_ar_approver` FOREIGN KEY (`approver_id`) REFERENCES `sys_user` (`id`);

-- 审批委托
ALTER TABLE `prj_approval_delegation`
  ADD CONSTRAINT `fk_ad_delegator` FOREIGN KEY (`delegator_id`) REFERENCES `sys_user` (`id`),
  ADD CONSTRAINT `fk_ad_delegate` FOREIGN KEY (`delegate_id`) REFERENCES `sys_user` (`id`);

-- 验收记录
ALTER TABLE `prj_acceptance_record`
  ADD CONSTRAINT `fk_acr_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`),
  ADD CONSTRAINT `fk_acr_acceptor` FOREIGN KEY (`acceptor_id`) REFERENCES `sys_user` (`id`);

-- 评论
ALTER TABLE `collab_comment`
  ADD CONSTRAINT `fk_comment_author` FOREIGN KEY (`author_id`) REFERENCES `sys_user` (`id`),
  ADD CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `collab_comment` (`id`);

ALTER TABLE `collab_comment_mention`
  ADD CONSTRAINT `fk_cm_comment` FOREIGN KEY (`comment_id`) REFERENCES `collab_comment` (`id`),
  ADD CONSTRAINT `fk_cm_user` FOREIGN KEY (`mentioned_user_id`) REFERENCES `sys_user` (`id`);

ALTER TABLE `collab_comment_attachment`
  ADD CONSTRAINT `fk_ca_comment` FOREIGN KEY (`comment_id`) REFERENCES `collab_comment` (`id`);

-- 通知
ALTER TABLE `sys_notification`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`);

-- 通知偏好
ALTER TABLE `sys_notification_preference`
  ADD CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`);

-- 操作日志
ALTER TABLE `sys_operation_log`
  ADD CONSTRAINT `fk_log_operator` FOREIGN KEY (`operator_id`) REFERENCES `sys_user` (`id`);

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
-- 八、种子数据（初始化）
-- ============================================================

-- -----------------------------------------------------------
-- 8.1 默认角色
-- -----------------------------------------------------------
INSERT INTO `sys_role` (`id`, `role_code`, `role_name`, `description`, `status`) VALUES
(1, 'admin',       '系统管理员', '系统最高权限角色，负责用户管理、角色配置、系统参数维护等', 1),
(2, 'business',    '业务人员',   '负责提交业务需求、澄清口径、验收数据结果', 1),
(3, 'developer',   '数据开发',   '负责技术口径开发、SQL编写、审核同行代码', 1),
(4, 'team_leader', '开发组长',   '负责技术口径审批、委托管理、团队协调', 1);

-- -----------------------------------------------------------
-- 8.2 默认管理员账号（密码: admin123，BCrypt 加密）
-- -----------------------------------------------------------
INSERT INTO `sys_user` (`id`, `username`, `password`, `real_name`, `email`, `department`, `status`) VALUES
(1, 'admin', '$2a$10$N.ZOn9G6V/YbWKzlGHN6z.vFbOGD7fR4ghT3GrCOq9LjV1Cj6UKPC', '系统管理员', 'admin@example.com', '技术部', 1);

-- 管理员绑定角色
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (1, 1);

-- -----------------------------------------------------------
-- 8.3 默认权限菜单树
-- -----------------------------------------------------------
INSERT INTO `sys_permission` (`id`, `permission_code`, `permission_name`, `resource_type`, `parent_id`, `sort_order`, `description`) VALUES
-- 一级菜单
(100, 'dashboard',        '个人工作台',    'menu', NULL, 1,  '个人待办和概览'),
(200, 'project',          '项目管理',      'menu', NULL, 2,  '项目全生命周期管理'),
(300, 'asset',            '数据资产',      'menu', NULL, 3,  '主题、口径、要素管理'),
(400, 'dashboard_board',  '数据看板',      'menu', NULL, 4,  '可视化报表看板'),
(500, 'system',           '系统管理',      'menu', NULL, 5,  '系统配置和维护'),
(600, 'notification',     '通知中心',      'menu', NULL, 6,  '站内消息和通知'),

-- 项目管理子菜单
(201, 'project:list',     '项目列表',      'menu', 200, 1,  '查看项目列表'),
(202, 'project:create',   '创建项目',      'button', 200, 2,  '创建新项目'),
(203, 'project:detail',   '项目详情',      'menu', 200, 3,  '查看项目详情'),
(204, 'project:edit',     '编辑项目',      'button', 200, 4,  '编辑项目信息'),
(205, 'project:pause',    '暂停项目',      'button', 200, 5,  '暂停项目'),
(206, 'project:cancel',   '取消项目',      'button', 200, 6,  '取消项目（需审批）'),
(207, 'project:launch',   '项目上线',      'button', 200, 7,  '确认项目上线'),

-- 数据资产子菜单
(301, 'asset:theme',      '主题管理',      'menu', 300, 1,  '数据主题CRUD'),
(302, 'asset:caliber',    '口径管理',      'menu', 300, 2,  '口径CRUD和版本管理'),
(303, 'asset:element',    '要素管理',      'menu', 300, 3,  '要素CRUD'),
(304, 'asset:ledger',     '口径台账',      'menu', 300, 4,  '口径全景检索'),
(305, 'asset:lineage',    '数据血缘',      'menu', 300, 5,  '血缘关系图谱'),
(306, 'asset:caliber:create',  '新建口径',  'button', 302, 1, '新建口径'),
(307, 'asset:caliber:edit',    '编辑口径',  'button', 302, 2, '编辑口径信息'),
(308, 'asset:caliber:version', '版本管理',  'button', 302, 3, '口径版本对比和管理'),

-- 数据看板子菜单
(401, 'dashboard_board:project', '项目进度看板', 'menu', 400, 1, '项目进度可视化'),
(402, 'dashboard_board:asset',   '口径资产概览', 'menu', 400, 2, '资产统计概览'),
(403, 'dashboard_board:quality', '口径质量报告', 'menu', 400, 3, '质量评估报告'),

-- 系统管理子菜单
(501, 'system:user',       '用户管理',      'menu', 500, 1,  '用户CRUD'),
(502, 'system:role',       '角色管理',      'menu', 500, 2,  '角色和权限配置'),
(503, 'system:team',       '开发组管理',    'menu', 500, 3,  '开发团队管理'),
(504, 'system:permission', '数据权限',      'menu', 500, 4,  '数据权限配置'),
(505, 'system:log',        '操作日志',      'menu', 500, 5,  '系统操作审计'),
(506, 'system:import',     '数据导入',      'menu', 500, 6,  '批量数据导入'),

-- 用户管理按钮权限
(511, 'system:user:create',  '新建用户',    'button', 501, 1, '创建用户'),
(512, 'system:user:edit',    '编辑用户',    'button', 501, 2, '编辑用户信息'),
(513, 'system:user:delete',  '删除用户',    'button', 501, 3, '禁用/删除用户'),
(514, 'system:user:reset',   '重置密码',    'button', 501, 4, '重置用户密码'),

-- 角色管理按钮权限
(521, 'system:role:create',  '新建角色',    'button', 502, 1, '创建角色'),
(522, 'system:role:edit',    '编辑角色',    'button', 502, 2, '编辑角色权限'),
(523, 'system:role:delete',  '删除角色',    'button', 502, 3, '删除角色'),

-- 开发组管理按钮权限
(531, 'system:team:create',  '新建团队',    'button', 503, 1, '创建开发团队'),
(532, 'system:team:edit',    '编辑团队',    'button', 503, 2, '编辑团队信息'),
(533, 'system:team:member',  '成员管理',    'button', 503, 3, '管理团队成员'),

-- 项目流程操作权限
(210, 'project:biz_caliber:submit',   '提交业务口径',   'button', 203, 10, '提交业务口径需求'),
(211, 'project:biz_caliber:clarify',  '澄清业务口径',   'button', 203, 11, '完成业务口径澄清'),
(212, 'project:tech_caliber:develop', '开发技术口径',   'button', 203, 12, '技术口径开发'),
(213, 'project:tech_caliber:review',  '审核技术口径',   'button', 203, 13, '团队内审核'),
(214, 'project:tech_caliber:approve', '审批技术口径',   'button', 203, 14, '组长审批'),
(215, 'project:acceptance',           '验收',           'button', 203, 15, '业务验收'),
(216, 'project:comment',              '评论',           'button', 203, 16, '项目评论和沟通');

-- -----------------------------------------------------------
-- 8.4 管理员角色分配全部权限
-- -----------------------------------------------------------
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permission`;

-- -----------------------------------------------------------
-- 8.5 业务人员角色权限
-- -----------------------------------------------------------
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(2, 100),   -- 个人工作台
(2, 200),   -- 项目管理
(2, 201),   -- 项目列表
(2, 202),   -- 创建项目
(2, 203),   -- 项目详情
(2, 204),   -- 编辑项目
(2, 300),   -- 数据资产
(2, 301),   -- 主题管理（只读）
(2, 302),   -- 口径管理（只读）
(2, 303),   -- 要素管理（只读）
(2, 304),   -- 口径台账
(2, 400),   -- 数据看板
(2, 401),   -- 项目进度看板
(2, 402),   -- 口径资产概览
(2, 600),   -- 通知中心
(2, 210),   -- 提交业务口径
(2, 211),   -- 澄清业务口径
(2, 215),   -- 验收
(2, 216);   -- 评论

-- -----------------------------------------------------------
-- 8.6 数据开发角色权限
-- -----------------------------------------------------------
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(3, 100),   -- 个人工作台
(3, 200),   -- 项目管理
(3, 201),   -- 项目列表
(3, 203),   -- 项目详情
(3, 300),   -- 数据资产
(3, 301),   -- 主题管理（只读）
(3, 302),   -- 口径管理
(3, 303),   -- 要素管理
(3, 306),   -- 新建口径
(3, 307),   -- 编辑口径
(3, 308),   -- 版本管理
(3, 304),   -- 口径台账
(3, 305),   -- 数据血缘
(3, 400),   -- 数据看板
(3, 401),   -- 项目进度看板
(3, 402),   -- 口径资产概览
(3, 403),   -- 口径质量报告
(3, 600),   -- 通知中心
(3, 212),   -- 开发技术口径
(3, 213),   -- 审核技术口径
(3, 216);   -- 评论

-- -----------------------------------------------------------
-- 8.7 开发组长角色权限（继承开发 + 审批权限）
-- -----------------------------------------------------------
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(4, 100),   -- 个人工作台
(4, 200),   -- 项目管理
(4, 201),   -- 项目列表
(4, 203),   -- 项目详情
(4, 300),   -- 数据资产
(4, 301),   -- 主题管理（只读）
(4, 302),   -- 口径管理
(4, 303),   -- 要素管理
(4, 306),   -- 新建口径
(4, 307),   -- 编辑口径
(4, 308),   -- 版本管理
(4, 304),   -- 口径台账
(4, 305),   -- 数据血缘
(4, 400),   -- 数据看板
(4, 401),   -- 项目进度看板
(4, 402),   -- 口径资产概览
(4, 403),   -- 口径质量报告
(4, 500),   -- 系统管理（仅团队）
(4, 503),   -- 开发组管理
(4, 531),   -- 新建团队
(4, 532),   -- 编辑团队
(4, 533),   -- 成员管理
(4, 600),   -- 通知中心
(4, 212),   -- 开发技术口径
(4, 213),   -- 审核技术口径
(4, 214),   -- 审批技术口径
(4, 216);   -- 评论

-- -----------------------------------------------------------
-- 8.8 通知类型枚举参考
-- -----------------------------------------------------------
-- 以下为 notification_type 字段的全部合法值：
-- project_status    : 项目状态变更
-- clarification     : 需求澄清评论
-- biz_caliber_change: 业务口径变更
-- review            : 技术口径审核通知
-- review_issue      : 技术口径问题提醒
-- approval          : 技术口径审批通知
-- approval_timeout  : 审批超时提醒
-- acceptance        : 验收通知
-- launch            : 上线提醒
-- lock              : 口径锁定通知
-- reassessment      : 技术口径待重新评估
-- overdue           : 项目逾期预警
-- pause_timeout     : 暂停超时提醒
-- comment_mention   : 评论@提醒


-- ============================================================
-- 完成：33 张表 + 种子数据
-- 执行顺序：直接全量执行本文件即可
-- ============================================================
