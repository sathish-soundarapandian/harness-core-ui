/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { ButtonVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { DefaultFreezeId } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowReducer'

interface NewFreezeWindowButtonProps {
  text?: string
}

export const NewFreezeWindowButton: FC<NewFreezeWindowButtonProps> = ({ text }) => {
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
        windowIdentifier: DefaultFreezeId
      })
    )
  }, [projectIdentifier, orgIdentifier, accountId, module])

  return (
    <RbacButton
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      text={text || getString('freezeWindows.freezeWindowsPage.newFreezeWindow')}
      onClick={goToFreezeWindowStudio}
      permission={{
        permission: PermissionIdentifier.MANAGE_DEPLOYMENT_FREEZE,
        resource: {
          resourceType: ResourceType.DEPLOYMENTFREEZE
        },
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      }}
      tooltipProps={{
        dataTooltipId: 'createFreezeWindow'
      }}
    />
  )
}
