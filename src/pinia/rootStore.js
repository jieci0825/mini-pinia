export const PiniaSymbol = Symbol('pinia')

// 保存激活的 pinia
let activePinia = null
export function setActivePinia(pinia) {
  activePinia = pinia
}
export function getActivePinia() {
  return activePinia
}
