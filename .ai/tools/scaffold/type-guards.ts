/**
 * Scaffold CLI -- 类型守卫函数
 *
 * 替代 `as unknown as RawObj` 等粗暴断言，
 * 让 TypeScript 编译器正确收窄联合类型。
 */

import type {
  ApiSceneConfig,
  CrudSceneConfig,
  DetailSceneConfig,
  FormSceneConfig,
  ListSceneConfig,
  SceneConfig,
  TypesSceneConfig,
} from './types.js';

/** crud 场景（scene 缺省时也视为 crud） */
export function isCrudScene(config: SceneConfig): config is CrudSceneConfig {
  return !config.scene || config.scene === 'crud';
}

/** form 场景 */
export function isFormScene(config: SceneConfig): config is FormSceneConfig {
  return config.scene === 'form';
}

/** detail 场景 */
export function isDetailScene(
  config: SceneConfig,
): config is DetailSceneConfig {
  return config.scene === 'detail';
}

/** list 场景 */
export function isListScene(config: SceneConfig): config is ListSceneConfig {
  return config.scene === 'list';
}

/** types 场景 */
export function isTypesScene(config: SceneConfig): config is TypesSceneConfig {
  return config.scene === 'types';
}

/** api 场景 */
export function isApiScene(config: SceneConfig): config is ApiSceneConfig {
  return config.scene === 'api';
}

/** 判断 config 是否含有 fields 数组（用于 getIdType 等需要访问 fields 的场景） */
export function hasFields(
  config: SceneConfig,
): config is SceneConfig & { fields: Array<{ name: string; type: string }> } {
  return 'fields' in config && Array.isArray(config.fields);
}
