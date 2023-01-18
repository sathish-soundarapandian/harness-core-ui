/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getLocationPathName = (): string => {
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
