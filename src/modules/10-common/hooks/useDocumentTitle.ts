/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useDeepCompareEffect } from '@common/hooks/useDeepCompareEffect'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export type Title = string | string[]

export interface UseDocumentTitleReturn {
  updateTitle: (newTitle: Title) => void
}

export function useDocumentTitle(title: Title): UseDocumentTitleReturn {
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const getStringFromTitle = (str: Title): string => (Array.isArray(str) ? str.filter(s => s).join(' | ') : str)

  const updateTitle = (newTitle: Title): void => {
    const titleArray = [getStringFromTitle(newTitle), getString('harness')]

    if (orgIdentifier && projectIdentifier) {
      // only if you're in project scope, add project name to title from appStore
      let projectTitle = ''
      if (projectIdentifier === selectedProject?.identifier) {
        projectTitle = selectedProject?.name || projectIdentifier
      } else {
        projectTitle = projectIdentifier
      }

      titleArray.splice(1, 0, projectTitle)
    }

    document.title = titleArray.filter(s => s).join(' | ')
  }

  useDeepCompareEffect(() => {
    updateTitle(title)

    return () => {
      // reset title on unmount
      document.title = getString('harness')
    }
  }, [title, selectedProject])

  return {
    updateTitle
  }
}
