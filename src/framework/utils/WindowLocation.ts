export const getLocationPathName = () => {
  let pathName = window.location.pathname
  if (window.browserRouterEnabled) {
    const nameSpace = window.harnessNameSpace ? `${window.harnessNameSpace}/` : ''
    pathName = `/${nameSpace}ng/`
  }
  return pathName
}
/** function returning equivalent path when browserRouter is enabled for window.location.href.split('#')[0] */
export const windowLocationUrlPartBeforeHash = () => {
  let path = window.location.href.split('#')[0]
  if (window.browserRouterEnabled) {
    path = `${window.location.origin}${getLocationPathName()}`
  }

  return path
}
