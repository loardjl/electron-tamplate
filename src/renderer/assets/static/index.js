/**@description 智适应控制 */
export const INTELLIGENT_ADAPTIVE_CONTROL = 6
/**@description 断刀监测 */
export const BROKEN_TOOL_MONITORING = 2

/**@description 自动边界 */
export const AUTO_BOUNDARY = 1
/**@description 过载监测 */
export const OVERLOAD_MONITORING = 7
/**@description 无意义的数据或不存在的数据 */
export const NO_REALE_DATA = -200000
/**@description 业务大类--过程监控 */
export const PROCESS_BUSINESS = 1
/**@description 业务大类--ips */
export const IPS_BUSINESS = 2

/**
 * @description 业务权限枚举
 * @example
 * 1 << INTELLIGENT_ADAPTIVE_CONTROL
 * 1 << BROKEN_TOOL_MONITORING
 * 1 << AUTO_BOUNDARY
 * 1 << OVERLOAD_MONITORING
 */

export const BUSINESS_ENUM = {
  INTELLIGENT_ADAPTIVE_CONTROL,
  BROKEN_TOOL_MONITORING,
  AUTO_BOUNDARY,
  OVERLOAD_MONITORING
}

export const MCM = 'mcm'
