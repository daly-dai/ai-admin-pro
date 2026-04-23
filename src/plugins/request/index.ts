import { message } from 'antd';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

/** 请求实例配置 */
export interface RequestConfig {
  /** URL 前缀，如 /user-api */
  prefix?: string;
  /** 状态码字段名，如 code、returnCode、status */
  codeKey?: string;
  /** 成功状态码值，如 200、0、true */
  successCode?: number | string | boolean;
  /** 数据字段名，解包数据用，如 data、result */
  dataKey?: string;
  /** 消息字段名，错误信息用，如 message、msg */
  msgKey?: string;
  /** 超时时间（毫秒），默认 30000 */
  timeout?: number;
}

/** 默认配置 */
const defaultConfig: Required<RequestConfig> = {
  prefix: '',
  codeKey: 'code',
  successCode: 200,
  dataKey: '',
  msgKey: 'message',
  timeout: 30000,
};

/** 合并配置 */
function mergeConfig(config?: RequestConfig): Required<RequestConfig> {
  return {
    ...defaultConfig,
    ...config,
  };
}

/** 创建 axios 实例 */
function createAxiosInstance(config: Required<RequestConfig>): AxiosInstance {
  const instance = axios.create({
    baseURL: config.prefix || undefined,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - 添加 token
  instance.interceptors.request.use(
    (cfg: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
      return cfg;
    },
    (error) => Promise.reject(error),
  );

  // 响应拦截器 - 解包数据 + 错误处理
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const { data } = response;
      const cfg = config;

      // 获取实际状态码
      const actualCode = data[cfg.codeKey];
      const isSuccess = actualCode === cfg.successCode;

      // 错误处理
      if (!isSuccess) {
        const msg = data[cfg.msgKey] || '请求失败';
        message.error(msg);
        return Promise.reject(new Error(msg));
      }

      // 解包数据
      if (cfg.dataKey) {
        return data[cfg.dataKey] as unknown as AxiosResponse;
      }
      return data as unknown as AxiosResponse;
    },
    (error) => {
      const { response } = error;

      if (response) {
        switch (response.status) {
          case 401:
            message.error('登录已过期，请重新登录');
            localStorage.removeItem('token');
            window.location.href = '/login';
            break;
          case 403:
            message.error('没有权限访问');
            break;
          case 404:
            message.error('请求的资源不存在');
            break;
          case 500:
            message.error('服务器内部错误');
            break;
          default:
            message.error(response.data?.message || '网络错误');
        }
      } else {
        message.error('网络连接失败');
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

/** 存储已创建的实例 */
const instanceCache = new Map<string, AxiosInstance>();

/** 获取实例 key */
function getInstanceKey(config: RequestConfig): string {
  return JSON.stringify(config);
}

/**
 * 创建请求实例
 * @param config 实例配置
 * @returns 封装好的请求方法对象
 */
export function createRequest(config?: RequestConfig) {
  const cfg = mergeConfig(config);
  const key = getInstanceKey(cfg);

  // 复用已有实例
  if (instanceCache.has(key)) {
    const cached = instanceCache.get(key)!;
    return createRequestMethods(cached);
  }

  // 创建新实例
  const instance = createAxiosInstance(cfg);
  instanceCache.set(key, instance);

  return createRequestMethods(instance);
}

/** 创建请求方法封装 */
function createRequestMethods(instance: AxiosInstance) {
  return {
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return instance.get(url, config);
    },

    post<T = unknown>(
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> {
      return instance.post(url, data, config);
    },

    put<T = unknown>(
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> {
      return instance.put(url, data, config);
    },

    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return instance.delete(url, config);
    },

    patch<T = unknown>(
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> {
      return instance.patch(url, data, config);
    },
  };
}

// ==================== 默认实例（向后兼容） ====================

const axiosInstance = createAxiosInstance(defaultConfig);

export const request = createRequestMethods(axiosInstance);

export default axiosInstance;
