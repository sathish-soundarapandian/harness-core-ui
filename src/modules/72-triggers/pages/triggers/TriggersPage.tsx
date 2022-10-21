/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, OrgPathProps, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useQueryParams } from '@common/hooks'
import { useGetPipelineSummaryQuery } from 'services/pipeline-rq'
import TriggersList from './views/TriggersList'

const TriggersPage: React.FC = (): React.ReactElement => {
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier } = useParams<
    OrgPathProps & PipelinePathProps
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()

  const { data: pipeline } = useGetPipelineSummaryQuery(
    {
      pipelineIdentifier,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        branch,
        repoIdentifier,
        getMetadataOnly: true
      }
    },
    {
      staleTime: 5 * 60 * 1000
    }
  )

  useDocumentTitle([pipeline?.data?.name || getString('pipelines'), getString('common.triggersLabel')])

  const isPipelineInvalid = pipeline?.data?.entityValidityDetails?.valid === false

  return <TriggersList isPipelineInvalid={isPipelineInvalid} />
}

export default TriggersPage
