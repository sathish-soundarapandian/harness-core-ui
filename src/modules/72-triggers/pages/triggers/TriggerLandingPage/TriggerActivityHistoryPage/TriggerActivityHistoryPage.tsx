/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Page } from '@common/exports'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { TriggerEventHistoryNewQueryParams, useTriggerEventHistoryNew } from 'services/pipeline-ng'
import type { PipelineType, TriggerPathProps } from '@common/interfaces/RouteInterfaces'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { useQueryParams } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import TriggerActivityList from './TriggerActivityList'
import TriggerActivityEmptyState from '../images/trigger_activity_emptystate.svg'
import css from './TriggerActivityHistoryPage.module.scss'

function TriggerActivityHistoryPage(): React.ReactElement {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, triggerIdentifier } = useParams<
    PipelineType<
      TriggerPathProps & {
        triggerIdentifier: string
      }
    >
  >()

  const { page = DEFAULT_PAGE_INDEX, size = COMMON_DEFAULT_PAGE_SIZE } =
    useQueryParams<Pick<TriggerEventHistoryNewQueryParams, 'page' | 'size'>>()

  const {
    data: triggersListResponse,
    loading: triggersListLoading,
    error,
    refetch
  } = useTriggerEventHistoryNew({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      targetIdentifier: pipelineIdentifier,
      page,
      size
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    debounce: 300
  })

  useDocumentTitle([getString('activityHistoryLabel')])

  const { data } = defaultTo(triggersListResponse, {})
  return (
    <>
      <Page.Body
        className={css.body}
        loading={triggersListLoading}
        error={defaultTo((error?.data as Error)?.message, error?.message)}
        retryOnError={() => refetch()}
        noData={{
          when: () => !data?.content?.length,
          image: TriggerActivityEmptyState,
          messageTitle: getString('triggers.activityHistory.emptyStateMessage')
        }}
      >
        {!data?.empty && <TriggerActivityList triggersListResponse={data} />}
      </Page.Body>
    </>
  )
}

export default TriggerActivityHistoryPage
