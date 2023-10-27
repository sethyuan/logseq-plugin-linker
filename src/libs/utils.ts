export function isElement(node: any): node is HTMLElement {
  if (node.querySelectorAll) return true
  return false
}
