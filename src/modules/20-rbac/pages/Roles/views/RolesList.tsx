/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
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
import { isAccountBasicRole } from '@rbac/utils/utils'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { CommonPaginationQueryParams, useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import { usePreviousPageWhenEmpty } from '@common/hooks/usePreviousPageWhenEmpty'
import css from '../Roles.module.scss'

const DEFAULT_ROLES_PAGE_SIZE = 12
const ROLES_PAGE_SIZE_OPTIONS = [12, 24, 48, 96]
const rolesQueryParamOptions = {
  decoder: queryParamDecodeAll(),
  processQueryParams<Rest>(
    params: CommonPaginationQueryParams & Rest
  ): RequiredPick<CommonPaginationQueryParams, 'page' | 'size'> & Rest {
    return {
      ...params,
      page: params.page ?? 0,
      size: params.size ?? DEFAULT_ROLES_PAGE_SIZE
    }
  }
}

const RolesList: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const history = useHistory()
  useDocumentTitle(getString('roles'))

  const {
    search: searchTerm,
    size: pageSize,
    page: pageIndex
  } = useQueryParams<CommonPaginationQueryParams & { search?: string }>(rolesQueryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<CommonPaginationQueryParams & { search?: string }>()

  const { data, loading, error, refetch } = useGetRoleList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pageIndex,
      pageSize,
      searchTerm
    },
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
    pageSize: data?.data?.pageSize || DEFAULT_ROLES_PAGE_SIZE,
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
        className={css.pageContainer}
      >
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
