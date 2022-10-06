/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useGetPipelineSummary } from 'services/pipeline-ng'

import { Page } from '@common/exports'
import { useQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { GitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import TriggerBreadcrumbs from './TriggerBreadcrumbs/TriggerBreadcrumbs'
import TriggerToolbar from './TriggerToolbar/TriggerToolbar'

import css from './TriggerDetails.module.scss'

//? This file can be named better
export default function TriggerDetails({ children }: { children: React.ReactElement }): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId } = useParams<PipelinePathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()

  const { data } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  const pipelineInfo = data?.data

  useDocumentTitle([
    pipelineInfo?.name || getString('pipelines'),
    getString('triggers.newTriggerWithoutPlus') || getString('common.triggersLabel')
  ])

  return (
    <GitSyncStoreProvider>
      {/* //? GitSyncStoreProvider really required here */}
      <Page.Header
        // ? Can we put a context for title here and move breadcrumbs to it's own prop
        title={<TriggerBreadcrumbs pipelineInfo={pipelineInfo} />}
        toolbar={<TriggerToolbar />}
        className={css.triggerDetails}
      />
      <Page.Body>{children}</Page.Body>
    </GitSyncStoreProvider>
  )
}
