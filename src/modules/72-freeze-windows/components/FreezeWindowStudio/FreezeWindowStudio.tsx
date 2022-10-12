/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { matchPath, useHistory } from 'react-router-dom'
import { Page, useToaster, VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import { NavigationCheck } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useStrings, StringKeys } from 'framework/strings'
import type { Error } from 'services/cd-ng'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import {
  isValidYaml,
  getContentAndTitleStringKeys,
  PATH_PARAMS
} from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowStudioUtil'
import { useFreezeStudioData } from '@freeze-windows/components/FreezeWindowStudio/useFreezeStudioData'
import { RightBar } from '@freeze-windows/components/RightBar/RightBar'
import { FreezeWindowStudioHeader } from './FreezeWindowStudioHeader'
import { FreezeWindowStudioSubHeader } from './FreezeWindowStudioSubHeader'
import { FreezeWindowStudioBody } from './FreezeWindowStudioBody'
import css from './FreezeWindowStudio.module.scss'

export const FreezeWindowStudio = () => {
  const {
    view,
    setView,
    updateYamlView,
    updateFreeze,
    loadingFreezeObj,
    isUpdatingFreeze,
    freezeObjError,
    refetchFreezeObj,
    freezeWindowLevel,
    state: { isYamlEditable, yamlHandler, freezeObj, isUpdated }
  } = React.useContext(FreezeWindowContext)
  const history = useHistory()

  const resources = useFreezeStudioData()

  const { navigationContentText, navigationTitleText } = getContentAndTitleStringKeys(false)

  // isYamlError
  const [, setYamlError] = React.useState(false)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const showInvalidYamlError = React.useCallback(
    (error: string) => {
      setYamlError(true)
      showError(error)
    },
    [setYamlError, showError]
  )

  const onViewChange = (newView: SelectedView): boolean => {
    if (newView === view) {
      return false
    }

    if (
      newView === SelectedView.VISUAL &&
      isYamlEditable &&
      !isValidYaml(yamlHandler, showInvalidYamlError, getString, updateFreeze)
    ) {
      return false
    }
    setView(newView)
    updateYamlView(false)
    return true
  }

  // console.log(loadingFreezeObj, isUpdatingFreeze, freezeObj?.entityConfigs?.[0]?.name)

  return (
    <>
      <NavigationCheck
        when={freezeObj.identifier !== ''}
        shouldBlockNavigation={nextLocation => {
          const matchDefault = matchPath(nextLocation.pathname, {
            path: routes.toFreezeWindowStudio(PATH_PARAMS[freezeWindowLevel]),
            exact: true
          })

          return (!matchDefault?.isExact && isUpdated) || false
        }}
        textProps={{
          contentText: getString(navigationContentText as StringKeys),
          titleText: getString(navigationTitleText as StringKeys)
        }}
        navigate={newPath => {
          history.push(newPath)
        }}
      />
      <Page.Body
        loading={loadingFreezeObj || isUpdatingFreeze}
        error={(freezeObjError?.data as Error)?.message || freezeObjError?.message}
        retryOnError={refetchFreezeObj}
      >
        <div className={css.marginRight}>
          <FreezeWindowStudioHeader />
          <FreezeWindowStudioSubHeader onViewChange={onViewChange} />
          {loadingFreezeObj || isUpdatingFreeze ? null : <FreezeWindowStudioBody resources={resources} />}
        </div>
        <RightBar />
      </Page.Body>
    </>
  )
}
