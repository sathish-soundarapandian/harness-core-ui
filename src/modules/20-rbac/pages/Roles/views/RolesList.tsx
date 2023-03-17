/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  Layout,
  Pagination,
  PageHeader,
  PageBody
} from '@harness/uicore'

import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Role, RoleResponse, useGetRoleList } from 'services/rbac'
import RoleCard from '@rbac/components/RoleCard/RoleCard'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useRoleModal } from '@rbac/modals/RoleModal/useRoleModal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import routes from '@common/RouteDefinitions'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { isAccountBasicRole, ProcessedRbacQueryParams } from '@rbac/utils/utils'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { CommonPaginationQueryParams, useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { queryParamDecodeAll, UseQueryParamsOptions } from '@common/hooks/useQueryParams'
import { usePreviousPageWhenEmpty } from '@common/hooks/usePreviousPageWhenEmpty'
import ListHeader from '@common/components/ListHeader/ListHeader'
import { sortByCreated, sortByName, SortMethod } from '@common/utils/sortUtils'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import css from '../Roles.module.scss'

const ROLES_PAGE_SIZE_OPTIONS = [12, 24, 48, 96]
const DEFAULT_ROLES_PAGE_SIZE = ROLES_PAGE_SIZE_OPTIONS.at(0) as number
const NEW_DEFAULT_ROLES_PAGE_SIZE = ROLES_PAGE_SIZE_OPTIONS.at(-1) as number

export const useRolesQueryParamOptions = <Rest,>(): UseQueryParamsOptions<ProcessedRbacQueryParams<Rest>> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const options = useMemo(
    () => ({
      decoder: queryParamDecodeAll(),
      processQueryParams(params: CommonPaginationQueryParams & Rest): ProcessedRbacQueryParams<Rest> {
        return {
          ...params,
          page: params.page ?? 0,
          size: params.size ?? (PL_NEW_PAGE_SIZE ? NEW_DEFAULT_ROLES_PAGE_SIZE : DEFAULT_ROLES_PAGE_SIZE)
        }
      }
    }),
    [PL_NEW_PAGE_SIZE]
  )

  return options
}

const RolesList: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const history = useHistory()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const { preference: sortPreference = SortMethod.Newest, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.Roles}`)
  useDocumentTitle(getString('roles'))
  const queryParamOptions = useRolesQueryParamOptions()
  const {
    search: searchTerm,
    size: pageSize,
    page: pageIndex
  } = useQueryParams<CommonPaginationQueryParams & { search?: string }>(queryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<CommonPaginationQueryParams & { search?: string }>()

  const { data, loading, error, refetch } = useGetRoleList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pageIndex,
      pageSize,
      searchTerm,
      sortOrders: [sortPreference]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })

  usePreviousPageWhenEmpty({ pageItemCount: data?.data?.pageItemCount, page: data?.data?.pageIndex })

  const { openRoleModal } = useRoleModal({
    onSuccess: role => {
      history.push(
        routes.toRoleDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module,
          roleIdentifier: role.identifier
        })
      )
    }
  })

  const editRoleModal = (role: Role): void => {
    openRoleModal(role)
  }

  const newRoleButton = (): JSX.Element => (
    <RbacButton
      text={getString('newRole')}
      data-testid="createRole"
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      onClick={() => openRoleModal()}
      permission={{
        permission: PermissionIdentifier.UPDATE_ROLE,
        resource: {
          resourceType: ResourceType.ROLE
        },
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      }}
      featuresProps={{
        featuresRequest: {
          featureNames: [FeatureIdentifier.CUSTOM_ROLES]
        }
      }}
    />
  )

  const { getRBACErrorMessage } = useRBACError()

  const paginationProps = useDefaultPaginationProps({
    itemCount: data?.data?.totalItems || 0,
    pageSize: data?.data?.pageSize || (PL_NEW_PAGE_SIZE ? NEW_DEFAULT_ROLES_PAGE_SIZE : DEFAULT_ROLES_PAGE_SIZE),
    pageCount: data?.data?.totalPages || 0,
    pageIndex: data?.data?.pageIndex || 0,
    pageSizeOptions: ROLES_PAGE_SIZE_OPTIONS
  })
  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newRoleButton()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              defaultValue={searchTerm}
              alwaysExpanded
              placeholder={getString('common.searchPlaceholder')}
              onChange={text => {
                updateQueryParams({ search: text.trim(), page: 0 })
              }}
              width={250}
            />
          </Layout.Horizontal>
        }
      />
      <PageBody
        loading={loading}
        error={error ? getRBACErrorMessage(error) : ''}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.roleDetails.noDataText'),
                button: newRoleButton()
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('noRoles')
              }
        }
      >
        <ListHeader
          selectedSortMethod={sortPreference}
          sortOptions={[...sortByCreated, ...sortByName]}
          onSortMethodChange={option => {
            setSortPreference(option.value as SortMethod)
          }}
          totalCount={data?.data?.totalItems}
        />
        <div className={css.masonry}>
          {data?.data?.content?.map((roleResponse: RoleResponse) =>
            isAccountBasicRole(roleResponse.role.identifier) ? null : (
              <RoleCard
                key={roleResponse.role.identifier}
                data={roleResponse}
                reloadRoles={refetch}
                editRoleModal={editRoleModal}
              />
            )
          )}
        </div>
        <Container className={css.pagination}>
          <Pagination {...paginationProps} />
        </Container>
      </PageBody>
    </>
  )
}

export default RolesList
