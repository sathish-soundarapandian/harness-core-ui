export const getLocationPathName = () => {
  let pathName = window.location.pathname
  if (window.browserRouterEnabled) {
    const nameSpace = window.harnessNameSpace ? `${window.harnessNameSpace}/` : ''
    pathName = `/${nameSpace}ng/`
  }
  return pathName
}
