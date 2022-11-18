export const getLocationPathName = () =>
  window.getHarnessLocationPathname ? window.getHarnessLocationPathname() : window.location.pathname
