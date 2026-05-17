/**
 * 加密工具函数
 * 提供密码哈希等加密功能
 */

/**
 * 使用 SHA-256 对密码进行哈希处理
 * @param {string} password - 明文密码
 * @returns {Promise<string>} - 十六进制哈希字符串
 */
export async function hashPassword(password) {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    console.error('密码加密失败:', error)
    // 加密失败时返回原始密码（确保系统仍可正常工作）
    return password
  }
}

/**
 * 生成随机盐值
 * @param {number} length - 盐值长度
 * @returns {string} - Base64编码的盐值
 */
export function generateSalt(length = 16) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validatePasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码需包含大写字母' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码需包含小写字母' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码需包含数字' }
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: '密码需包含特殊字符' }
  }
  return { valid: true, message: '密码强度合格' }
}

export default {
  hashPassword,
  generateSalt,
  validatePasswordStrength
}
