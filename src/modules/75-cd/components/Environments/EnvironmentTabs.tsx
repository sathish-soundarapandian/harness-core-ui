/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import { TabNavigation } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export default function EnvironmentTabs() {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  return (
    <TabNavigation
      size={'small'}
      links={[
        {
          label: getString('environment'),
          to: routes.toEnvironment({
            accountId,
            orgIdentifier,
            projectIdentifier,
            module
          })
        }
      ]}
    />
  )
}
