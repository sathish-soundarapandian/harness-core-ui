/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { TabNavigation } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { PermissionsRequest, usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

export default function EnvironmentTabs() {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const isEnvGroupEnabled = useFeatureFlag(FeatureFlag.ENV_GROUP)
  const [canViewEnvGroup] = usePermission(
    {
      permissions: [PermissionIdentifier.VIEW_ENVIRONMENT_GROUP],
      resource: {
        resourceType: ResourceType.ENVIRONMENT_GROUP
      }
    } as PermissionsRequest,
    []
  )
  const [navLinks, setNavLinks] = useState([])

  useEffect(() => {
    const links: any = [
      {
        label: getString('environment'),
        to: routes.toEnvironment({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module
        })
      }
    ]

    if (isEnvGroupEnabled && canViewEnvGroup) {
      links.push({
        label: getString('common.environmentGroups.label'),
        to: routes.toEnvironmentGroups({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module
        })
      })
    }

    setNavLinks(links)
  }, [isEnvGroupEnabled])

  return <TabNavigation size={'small'} links={navLinks} />
}
