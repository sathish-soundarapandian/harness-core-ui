/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonSize, ButtonVariation, ExpandingSearchInput, Layout } from '@harness/uicore'
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
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { usePreviousPageWhenEmpty } from '@common/hooks/usePreviousPageWhenEmpty'
import { rbacQueryParamOptions } from '@rbac/utils/utils'
import ListHeader from '@common/components/ListHeader/ListHeader'
import { sortByCreated, sortByEmail, sortByName, SortMethod } from '@common/utils/sortUtils'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'

import ServiceAccountsEmptyState from './service-accounts-empty-state.png'
import css from './ServiceAccounts.module.scss'

const ServiceAccountsPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  useDocumentTitle(getString('rbac.serviceAccounts.label'))
  const { preference: sortPreference = SortMethod.Newest, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.ServiceAccountsPage}`)

  const {
    search: searchTerm,
    page: pageIndex,
    size: pageSize
  } = useQueryParams<CommonPaginationQueryParams & { search?: string }>(rbacQueryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<CommonPaginationQueryParams & { search?: string }>()

  const { data, loading, error, refetch } = useListAggregatedServiceAccounts({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      searchTerm,
      pageIndex,
      pageSize,
      sortOrders: [sortPreference]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })

  usePreviousPageWhenEmpty({ page: data?.data?.pageIndex, pageItemCount: data?.data?.pageItemCount })

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
                defaultValue={searchTerm}
                alwaysExpanded
                placeholder={getString('common.searchPlaceholder')}
                onChange={text => {
                  updateQueryParams({ page: 0, search: text.trim() })
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
        <ListHeader
          selectedSortMethod={sortPreference}
          sortOptions={[...sortByCreated, ...sortByName, ...sortByEmail]}
          onSortMethodChange={option => {
            setSortPreference(option.value as SortMethod)
          }}
          totalCount={data?.data?.totalItems}
        />
        <ServiceAccountsListView
          data={data?.data}
          reload={refetch}
          openRoleAssignmentModal={openRoleAssignmentModal}
          openServiceAccountModal={openServiceAccountModal}
        />
      </Page.Body>
    </>
  )
}

export default ServiceAccountsPage
