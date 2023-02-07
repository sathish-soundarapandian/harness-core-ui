/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, ExpandingSearchInput, ButtonVariation, PageHeader, PageBody } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useResourceGroupModal } from '@rbac/modals/ResourceGroupModal/useResourceGroupModal'
import { useGetResourceGroupListV2 } from 'services/resourcegroups'
import ResourceGroupListView from '@rbac/components/ResourceGroupList/ResourceGroupListView'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import routes from '@common/RouteDefinitions'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { rbacQueryParamOptions } from '@rbac/utils/utils'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { usePreviousPageWhenEmpty } from '@common/hooks/usePreviousPageWhenEmpty'
import ListHeader from '@common/components/ListHeader/ListHeader'
import { sortByCreated, sortByEmail, sortByLastModified, sortByName } from '@common/utils/sortUtils'
import css from '@rbac/components/ResourceGroupList/ResourceGroupList.module.scss'

const ResourceGroupsList: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const history = useHistory()
  const [sort, setSort] = useState<string>(sortByLastModified[0].value as string)
  useDocumentTitle(getString('resourceGroups'))

  const {
    search: searchTerm,
    page: pageIndex,
    size: pageSize
  } = useQueryParams<CommonPaginationQueryParams & { search?: string }>(rbacQueryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<CommonPaginationQueryParams & { search?: string }>()

  const { data, loading, error, refetch } = useGetResourceGroupListV2({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex,
      pageSize,
      searchTerm,
      sortOrders: [sort]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300
  })

  usePreviousPageWhenEmpty({ page: data?.data?.pageIndex, pageItemCount: data?.data?.pageItemCount })

  const { openResourceGroupModal } = useResourceGroupModal({
    onSuccess: resourceGroup => {
      history.push(
        routes.toResourceGroupDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module,
          resourceGroupIdentifier: resourceGroup.identifier
        })
      )
    }
  })

  const { getRBACErrorMessage } = useRBACError()

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal>
            <RbacButton
              text={getString('rbac.resourceGroup.newResourceGroup')}
              variation={ButtonVariation.PRIMARY}
              icon="plus"
              onClick={() => openResourceGroupModal()}
              data-testid="addNewResourceGroup"
              permission={{
                permission: PermissionIdentifier.UPDATE_RESOURCEGROUP,
                resource: {
                  resourceType: ResourceType.RESOURCEGROUP
                },
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                }
              }}
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.CUSTOM_RESOURCE_GROUPS]
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
      <PageBody loading={loading} retryOnError={() => refetch()} error={error ? getRBACErrorMessage(error) : ''}>
        <ListHeader
          value={sort}
          sortOptions={[...sortByName, ...sortByEmail, ...sortByCreated, ...sortByLastModified]}
          onChange={option => setSort(option.value as string)}
          totalCount={data?.data?.totalItems}
          className={css.listHeader}
        />
        <ResourceGroupListView data={data?.data} reload={refetch} openResourceGroupModal={openResourceGroupModal} />
      </PageBody>
    </>
  )
}

export default ResourceGroupsList
