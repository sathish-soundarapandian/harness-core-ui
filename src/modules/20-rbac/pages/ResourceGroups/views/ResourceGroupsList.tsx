/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Layout, ExpandingSearchInput, ButtonVariation, PageHeader, PageBody } from '@wings-software/uicore'
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
import routes from '@common/RouteDefinitions'
import { setPageNumber } from '@common/utils/utils'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

const ResourceGroupsList: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const history = useHistory()
  useDocumentTitle(getString('resourceGroups'))
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)

  const { data, loading, error, refetch } = useGetResourceGroupListV2({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm: searchTerm
    },
    debounce: 300
  })

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: data?.data?.pageItemCount })
  }, [data?.data])

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
              alwaysExpanded
              placeholder={getString('common.searchPlaceholder')}
              onChange={e => {
                setSearchTerm(e.trim())
                setPage(0)
              }}
              width={250}
            />
          </Layout.Horizontal>
        }
      />
      <PageBody loading={loading} retryOnError={() => refetch()} error={(error?.data as Error)?.message}>
        <ResourceGroupListView
          data={data?.data}
          reload={refetch}
          openResourceGroupModal={openResourceGroupModal}
          goToPage={(pageNumber: number) => setPage(pageNumber)}
        />
      </PageBody>
    </>
  )
}

export default ResourceGroupsList
