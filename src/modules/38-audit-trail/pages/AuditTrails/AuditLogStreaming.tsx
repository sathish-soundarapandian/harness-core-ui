/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { FlexExpander, ButtonVariation } from '@harness/uicore'
import {
  useGetStreamingDestinationsAggregateQuery,
  useGetStreamingDestinationsCardsQuery
} from '@harnessio/react-audit-service-client'

import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useCreateStreamingDestinationModal from '@audit-trail/modals/StreamingDestinationModal/useCreateStreamingDestinationModal'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import AuditLogStreamingListView from './views/AuditLogStreamingListView'
import AuditTrailsEmptyState from './audit_trails_empty_state.png'
import css from './AuditTrailsPage.module.scss'

export const POLL_INTERVAL = 10 * 60 * 1000 // 10 minutes

const AuditLogStreaming: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { openStreamingDestinationModal } = useCreateStreamingDestinationModal({
    onClose: () => {
      refetchListingPageAPIs()
    }
  })

  const {
    data: cardsData,
    refetch: refetchCards,
    isFetching: isFetchingCards
  } = useGetStreamingDestinationsCardsQuery({}, { refetchInterval: POLL_INTERVAL })

  const {
    data: streamingDestinationsData,
    error,
    isFetching,
    refetch
  } = useGetStreamingDestinationsAggregateQuery(
    { queryParams: { sort: 'created' } },
    { refetchInterval: POLL_INTERVAL }
  )

  const refetchListingPageAPIs = (): void => {
    refetch()
    refetchCards()
  }

  const createPermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.STREAMING_DESTINATION
    },
    permission: PermissionIdentifier.CREATE_OR_EDIT_STREAMING_DESTINATION
  }

  return (
    <>
      <Page.SubHeader>
        <RbacButton
          intent="primary"
          onClick={() => {
            openStreamingDestinationModal(false)
          }}
          variation={ButtonVariation.PRIMARY}
          text={getString('auditTrail.logStreaming.newStreamingDestination')}
          icon="plus"
          permission={createPermission}
        />
        <FlexExpander />
      </Page.SubHeader>
      <Page.Body
        noData={{
          when: () => !streamingDestinationsData?.length,
          image: AuditTrailsEmptyState,
          imageClassName: css.emptyStateImage,
          messageTitle: getString('auditTrail.emptyStateMessageTitle'),
          message: getString('auditTrail.emptyStateMessage')
        }}
        error={(error as any)?.data?.message || (error as any)?.message}
        retryOnError={() => refetchListingPageAPIs()}
        loading={isFetching || isFetchingCards}
      >
        <AuditLogStreamingListView
          data={streamingDestinationsData}
          cardsData={cardsData}
          refetchListingPageAPIs={refetchListingPageAPIs}
          openStreamingDestinationModal={openStreamingDestinationModal}
        />
      </Page.Body>
    </>
  )
}

export default AuditLogStreaming
