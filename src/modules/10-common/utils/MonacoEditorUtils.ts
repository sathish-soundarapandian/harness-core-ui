import { getLocationPathName } from 'framework/utils/WindowLocation'

const getLocationPath = (): string => {
  /* istanbul ignore next */
  if (window.browserRouterEnabled) {
    /* istanbul ignore next */
    return `${__DEV__ ? '/' : getLocationPathName()}`
  } else {
    return `${window.location.pathname}`
  }
}

const getUrlPrefix = (): string => {
  let urlPrefix = `${window.location.origin}${getLocationPath()}`
  /* istanbul ignore next */
  if (urlPrefix.charAt(urlPrefix.length - 1) !== '/') {
    urlPrefix += '/'
  }
  return urlPrefix
}

export const setupMonacoEnvironment = (): void => {
  window.MonacoEnvironment = {
    getWorker(_workerId: unknown, label: string) {
      if (label === 'yaml') {
        const YamlWorker = new Worker(new URL(`${getUrlPrefix()}static/yamlWorker2.js`))
        return YamlWorker
      }
      const EditorWorker = new Worker(new URL(`${getUrlPrefix()}static/editorWorker2.js`))
      return EditorWorker
    }
  }
}
