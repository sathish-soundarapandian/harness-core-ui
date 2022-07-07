/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { ButtonSize, ButtonVariation, ExpandingSearchInput, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useServiceAccountModal } from '@rbac/modals/ServiceAccountModal/useServiceAccountModal'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useListAggregatedServiceAccounts } from 'services/cd-ng'
import ServiceAccountsListView from '@rbac/pages/ServiceAccounts/views/ServiceAccountsListView'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import ServiceAccountsEmptyState from './service-accounts-empty-state.png'
import css from './ServiceAccounts.module.scss'

const ServiceAccountsPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  useDocumentTitle(getString('rbac.serviceAccounts.label'))
  const [searchTerm, setsearchTerm] = useState<string>('')
  const [page, setPage] = useState(0)

  const { data, loading, error, refetch } = useListAggregatedServiceAccounts({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      searchTerm: searchTerm,
      pageIndex: page,
      pageSize: 10
    },
    debounce: 300
  })

  const { openServiceAccountModal } = useServiceAccountModal({ onSuccess: () => refetch() })
  const { openRoleAssignmentModal } = useRoleAssignmentModal({ onSuccess: refetch })
  const { getRBACErrorMessage } = useRBACError()

  return (
    <>
      {data?.data?.content?.length || searchTerm || loading || error ? (
        <Page.Header
          title={
            <Layout.Horizontal spacing="small">
              <RbacButton
                text={getString('rbac.serviceAccounts.newServiceAccount')}
                variation={ButtonVariation.PRIMARY}
                icon="plus"
                onClick={() => openServiceAccountModal()}
                permission={{
                  permission: PermissionIdentifier.EDIT_SERVICEACCOUNT,
                  resource: {
                    resourceType: ResourceType.SERVICEACCOUNT
                  }
                }}
              />
            </Layout.Horizontal>
          }
          toolbar={
            <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
              <ExpandingSearchInput
                alwaysExpanded
                placeholder={getString('common.searchPlaceholder')}
                onChange={text => {
                  setsearchTerm(text.trim())
                }}
                width={250}
              />
            </Layout.Horizontal>
          }
        />
      ) : null}

      <Page.Body
        loading={loading}
        error={error ? getRBACErrorMessage(error) : ''}
        retryOnError={() => refetch()}
        noData={{
          when: () => !data?.data?.content?.length,
          image: ServiceAccountsEmptyState,
          imageClassName: css.serviceAccountsEmptyStateImg,
          message: searchTerm
            ? getString('rbac.serviceAccounts.noServiceAccounts')
            : getString('rbac.serviceAccounts.emptyStateDescription'),
          button: !searchTerm ? (
            <RbacButton
              text={getString('rbac.serviceAccounts.newServiceAccount')}
              variation={ButtonVariation.PRIMARY}
              size={ButtonSize.LARGE}
              icon="plus"
              onClick={() => openServiceAccountModal()}
              permission={{
                permission: PermissionIdentifier.EDIT_SERVICEACCOUNT,
                resource: {
                  resourceType: ResourceType.SERVICEACCOUNT
                }
              }}
            />
          ) : undefined
        }}
      >
        <ServiceAccountsListView
          data={data?.data}
          reload={refetch}
          openRoleAssignmentModal={openRoleAssignmentModal}
          openServiceAccountModal={openServiceAccountModal}
          gotoPage={(pageNumber: number) => setPage(pageNumber)}
        />
      </Page.Body>
    </>
  )
}

export default ServiceAccountsPage
