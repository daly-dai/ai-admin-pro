-- ============================================================
-- 数据管理平台 - 数据库表结构修订增量
-- 基于原 schema.sql（29张表）的增量变更
-- 适配修订版需求规格书
-- ============================================================

-- ============================================================
-- 一、现有表字段修改（ALTER TABLE）
-- ============================================================

-- 1. prj_project：新增暂停/取消相关字段，扩展状态枚举
ALTER TABLE `prj_project`
  ADD COLUMN `pause_reason`        varchar(500) DEFAULT NULL COMMENT '暂停原因' AFTER `archived_at`,
  ADD COLUMN `paused_at`           datetime     DEFAULT NULL COMMENT '暂停时间' AFTER `pause_reason`,
  ADD COLUMN `paused_by`           bigint       DEFAULT NULL COMMENT '暂停操作人ID' AFTER `paused_at`,
  ADD COLUMN `resumed_at`          datetime     DEFAULT NULL COMMENT '恢复时间' AFTER `paused_by`,
  ADD COLUMN `status_before_pause` varchar(30)  DEFAULT NULL COMMENT '暂停前状态（恢复时回退至此状态）' AFTER `resumed_at`,
  ADD COLUMN `cancel_reason`       varchar(500) DEFAULT NULL COMMENT '取消原因' AFTER `status_before_pause`,
  ADD COLUMN `cancelled_at`        datetime     DEFAULT NULL COMMENT '取消时间' AFTER `cancel_reason`,
  ADD COLUMN `cancelled_by`        bigint       DEFAULT NULL COMMENT '取消操作人ID（发起人）' AFTER `cancelled_at`,
  ADD COLUMN `cancel_approved_by`  bigint       DEFAULT NULL COMMENT '取消审批人ID（管理员）' AFTER `cancelled_by`,
  MODIFY COLUMN `status` varchar(30) NOT NULL DEFAULT 'pending_clarification'
    COMMENT '项目状态：pending_clarification-待澄清 developing-开发中 pending_acceptance-待验收 pending_launch-待上线 launched-已上线 archived-已归档 paused-已暂停 cancelled-已取消';

-- 移除项目表上的预览数据字段（迁移至技术口径表，因预览数据是按口径维度管理）
ALTER TABLE `prj_project`
  DROP COLUMN `preview_ready`,
  DROP COLUMN `preview_ready_at`;


-- 2. prj_project_caliber：新增开发类型标记
ALTER TABLE `prj_project_caliber`
  ADD COLUMN `dev_type` varchar(20) NOT NULL DEFAULT 'needs_tech_dev'
    COMMENT '开发类型：needs_tech_dev-需技术开发 biz_only-仅业务口径调整'
    AFTER `current_version_id`;


-- 3. prj_business_caliber：状态值调整（移除 pending_clarification，使用 submitted 替代）
ALTER TABLE `prj_business_caliber`
  MODIFY COLUMN `status` varchar(30) NOT NULL DEFAULT 'draft'
    COMMENT '状态：draft-草稿 submitted-已提交 clarified-已澄清 deprecated-已废弃';


-- 4. prj_technical_caliber：新增待重新评估状态、预览数据字段、数据来源字段
ALTER TABLE `prj_technical_caliber`
  ADD COLUMN `source_caliber_ids`  text         DEFAULT NULL
    COMMENT '数据来源口径ID列表（JSON数组，如 [1,5,12]，用于血缘关系）' AFTER `processing_rules`,
  ADD COLUMN `source_tables`       text         DEFAULT NULL
    COMMENT '数据来源外部表名列表（JSON数组，如 ["ods_order","ods_user"]，非平台内口径的上游表）' AFTER `source_caliber_ids`,
  ADD COLUMN `preview_status`      varchar(20)  NOT NULL DEFAULT 'not_ready'
    COMMENT '预览数据状态：not_ready-未就绪 ready-已就绪' AFTER `status`,
  ADD COLUMN `preview_description` varchar(500) DEFAULT NULL
    COMMENT '预览数据说明（数据行数、数据存放位置等）' AFTER `preview_status`,
  ADD COLUMN `preview_marked_by`   bigint       DEFAULT NULL
    COMMENT '预览数据标记人ID' AFTER `preview_description`,
  ADD COLUMN `preview_marked_at`   datetime     DEFAULT NULL
    COMMENT '预览数据标记时间' AFTER `preview_marked_by`,
  MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'not_started'
    COMMENT '状态：not_started-未开发 developing-开发中 reviewing-审核中 pending_approval-待审批 approved-审批通过 rejected-审批驳回 pending_reassessment-待重新评估 deprecated-已废弃';


-- 5. prj_acceptance_record：新增驳回类型（区分业务口径问题和技术实现问题）
ALTER TABLE `prj_acceptance_record`
  ADD COLUMN `reject_type` varchar(30) DEFAULT NULL
    COMMENT '驳回类型（result=failed时必填）：biz_issue-业务口径问题 tech_issue-技术实现问题'
    AFTER `result`;


-- 6. dat_caliber_version：新增版本状态（区分草稿/生效/废弃）
ALTER TABLE `dat_caliber_version`
  ADD COLUMN `version_status` varchar(20) NOT NULL DEFAULT 'draft'
    COMMENT '版本状态：draft-草稿（项目进行中） active-生效（项目上线后定格） deprecated-已废弃（项目取消/口径移除）'
    AFTER `is_current`;


-- ============================================================
-- 二、新增表（4张）
-- ============================================================

-- 1. 口径标签表（口径与标签多对多关系）
CREATE TABLE `dat_caliber_tag` (
  `id`         bigint       NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `caliber_id` bigint       NOT NULL COMMENT '口径ID',
  `tag_name`   varchar(50)  NOT NULL COMMENT '标签名称（如：核心指标、派生指标、同比环比类、高频变更）',
  `created_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_caliber_tag` (`caliber_id`, `tag_name`),
  KEY `idx_tag_name` (`tag_name`),
  CONSTRAINT `fk_ct_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口径标签表（支持多标签分类和检索）';


-- 2. 项目成员表（支持多个项目负责人和多个开发负责人）
CREATE TABLE `prj_project_member` (
  `id`           bigint      NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `project_id`   bigint      NOT NULL COMMENT '项目ID',
  `user_id`      bigint      NOT NULL COMMENT '用户ID',
  `project_role` varchar(30) NOT NULL COMMENT '项目角色：owner-项目负责人 dev_leader-项目开发负责人',
  `created_at`   datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_member_role` (`project_id`, `user_id`, `project_role`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_role` (`project_role`),
  CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`),
  CONSTRAINT `fk_pm_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表（项目负责人、项目开发负责人，均支持多人）';


-- 3. 数据血缘关系表（记录技术口径的上游数据来源）
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
  KEY `idx_source_type` (`source_type`),
  CONSTRAINT `fk_cl_tech` FOREIGN KEY (`technical_caliber_id`) REFERENCES `prj_technical_caliber` (`id`),
  CONSTRAINT `fk_cl_source` FOREIGN KEY (`source_caliber_id`) REFERENCES `dat_caliber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据血缘关系表（记录口径之间的上下游引用关系）';


-- 4. 通知偏好配置表（用户自定义各类通知的邮件开关）
CREATE TABLE `sys_notification_preference` (
  `id`                bigint      NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id`           bigint      NOT NULL COMMENT '用户ID',
  `notification_type` varchar(50) NOT NULL COMMENT '通知类型（与 sys_notification.notification_type 对应）',
  `email_enabled`     tinyint     NOT NULL DEFAULT 1 COMMENT '是否启用邮件通知：0-关闭 1-开启',
  `created_at`        datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_notif_type` (`user_id`, `notification_type`),
  CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知偏好配置表（站内消息默认开启不可关闭，邮件通知可按类型开关）';


-- ============================================================
-- 三、通知类型枚举参考（用于 notification_type 字段）
-- ============================================================
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
