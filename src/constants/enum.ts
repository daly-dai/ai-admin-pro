/**
 * 用户状态枚举
 */
export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Disabled = 'disabled',
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

/**
 * 性别枚举
 */
export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

/**
 * 主题模式枚举
 */
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  Auto = 'auto',
}

/**
 * 语言枚举
 */
export enum Language {
  ZhCN = 'zh-CN',
  EnUS = 'en-US',
}

/**
 * HTTP 状态码
 */
export enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

/**
 * 存储键名枚举
 */
export enum StorageKey {
  Token = 'token',
  UserInfo = 'user_info',
  Theme = 'theme',
  Language = 'language',
  SidebarCollapsed = 'sidebar_collapsed',
}
