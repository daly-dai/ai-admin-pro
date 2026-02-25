/**
 * 应用配置
 */
export const APP_CONFIG = {
  /** 应用名称 */
  name: 'AI Frontend',
  /** 应用版本 */
  version: '1.0.0',
  /** 默认分页大小 */
  defaultPageSize: 10,
  /** 分页大小选项 */
  pageSizeOptions: [10, 20, 50, 100],
  /** 默认语言 */
  defaultLanguage: 'zh-CN' as const,
  /** 默认主题 */
  defaultTheme: 'light' as const,
  /** Token 过期时间（天） */
  tokenExpireDays: 7,
};

/**
 * 路由配置
 */
export const ROUTE_CONFIG = {
  /** 登录页路径 */
  loginPath: '/login',
  /** 首页路径 */
  homePath: '/dashboard',
  /** 白名单路由（无需登录） */
  whiteList: ['/login', '/register', '/404'],
};

/**
 * 请求配置
 */
export const REQUEST_CONFIG = {
  /** 基础URL */
  // baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  /** 超时时间（毫秒） */
  timeout: 30000,
  /** 重试次数 */
  retryCount: 3,
  /** 重试延迟（毫秒） */
  retryDelay: 1000,
};

/**
 * 正则表达式
 */
export const REGEX = {
  /** 手机号 */
  phone: /^1[3-9]\d{9}$/,
  /** 邮箱 */
  email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
  /** 密码（6-20位，包含字母和数字） */
  password: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
  /** URL */
  url: /^https?:\/\/.+/,
  /** 身份证号 */
  idCard: /^\d{17}[\dXx]|\d{15}$/,
};

/**
 * 日期格式
 */
export const DATE_FORMAT = {
  /** 完整日期时间 */
  full: 'YYYY-MM-DD HH:mm:ss',
  /** 日期 */
  date: 'YYYY-MM-DD',
  /** 时间 */
  time: 'HH:mm:ss',
  /** 年月 */
  month: 'YYYY-MM',
};
