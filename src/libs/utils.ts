const SCHEME_REGEX = /[a-z]+:\/\//

export function hasScheme(path: string) {
  return SCHEME_REGEX.test(path)
}

export function isElement(node: any): node is HTMLElement {
  if (node.querySelectorAll) return true
  return false
}
