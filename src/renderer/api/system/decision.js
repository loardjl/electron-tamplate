/*
 * @Author: 何志祥
 * @Date: 2023-09-20 09:47:17
 * @LastEditors: 何志祥
 * @LastEditTime: 2023-11-06 09:38:24
 * @Description: 反控决策接口api
 */
import request from '../requestDecision'

// 反控决策基础接口定义
export function basicDecision(data) {
  return request({
    // url: '/decision',
    method: 'post',
    data: data
  })
}
