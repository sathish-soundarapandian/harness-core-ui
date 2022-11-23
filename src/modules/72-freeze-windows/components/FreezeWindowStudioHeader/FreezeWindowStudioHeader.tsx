/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Page } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const FreezeWindowStudioHeader = () => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  return (
    <Page.Header
      size={'small'}
      title={null}
      breadcrumbs={
        <NGBreadcrumbs
          links={[
            {
              url: routes.toFreezeWindows({ orgIdentifier, projectIdentifier, accountId, module }),
              label: getString('common.freezeWindows')
            }
          ]}
        />
      }
    />
  )
}
