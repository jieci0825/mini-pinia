export function isString(value) {
  return typeof value === 'string'
}

export function isFunction(value) {
  return typeof value === 'function'
}

export function isObject(value) {
  return typeof value === 'object' && value !== null
}

export const extend = Object.assign

export const isArray = Array.isArray

const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (value, key) => {
  return hasOwnProperty.call(value, key)
}

export const hasChanged = (a, b) => {
  return !Object.is(a, b)
}

export const isPromise = val => {
  return isObject(val) && isFunction(val.then)
}
