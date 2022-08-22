/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'
import type { PMSPipelineSummaryResponse } from 'services/pipeline-ng'

import type { GitQueryParams, ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

export default function TriggerBreadcrumbs({
  pipelineInfo
}: {
  pipelineInfo?: PMSPipelineSummaryResponse
}): JSX.Element {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelinePathProps & ModulePathParams
  >()
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()

  return (
    <NGBreadcrumbs
      links={[
        {
          url: routes.toPipelines({
            orgIdentifier,
            projectIdentifier,
            accountId,
            module
          }),
          label: getString('pipelines')
        },
        {
          url: routes.toTriggersPage({
            orgIdentifier,
            projectIdentifier,
            accountId,
            pipelineIdentifier,
            module,
            repoIdentifier,
            connectorRef,
            repoName,
            branch,
            storeType
          }),
          //? This section can be eliminated  1231412
          label: pipelineInfo?.name || ''
        }
      ]}
    />
  )
}
