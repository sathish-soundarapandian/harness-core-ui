/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const NewFreezeWindowButton = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { module, ...params } = useParams<ProjectPathProps & ModulePathParams>()
  const { projectIdentifier, orgIdentifier, accountId } = params

  const goToFreezeWindowStudio = React.useCallback(() => {
    history.push(
      routes.toFreezeWindowStudio({
        projectIdentifier,
        orgIdentifier,
        accountId,
        module,
        windowIdentifier: '-1'
      })
    )
  }, [projectIdentifier, orgIdentifier, accountId, module])

  return (
    <Button
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      text={getString('freezeWindows.freezeWindowsPage.newFreezeWindow')}
      onClick={goToFreezeWindowStudio}
      // disabled={!canEdit || !templatesEnabled}
      // tooltip={tooltipBtn()}
    />
  )
}
