/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Container, PageSpinner, TableV2 } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import {
  GitSyncEntityDTO,
  PageGitSyncEntityListDTO,
  useListGitSyncEntitiesByType,
  ListGitSyncEntitiesByTypePathParams,
  GitSyncConfig
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getTableColumns } from './EntityHelper'
import css from './GitSyncEntityTab.module.scss'

interface EntitiesListingProps {
  entityType: ListGitSyncEntitiesByTypePathParams['entityType']
  gitSyncConfigId: GitSyncConfig['identifier']
  branch: GitSyncConfig['branch']
  backToSummary: () => void
}

interface EntityListViewProps {
  data: PageGitSyncEntityListDTO | undefined
  gotoPage: (pageNumber: number) => void
  refetch: () => void
}

const EntityListView: React.FC<EntityListViewProps> = props => {
  const data = props.data?.content?.[0]

  return (
    <TableV2<GitSyncEntityDTO>
      className={css.table}
      columns={getTableColumns()}
      data={data?.gitSyncEntities || []}
      sortable={true}
      pagination={{
        itemCount: props.data?.totalItems || 0,
        pageSize: props.data?.pageSize || 10,
        pageCount: props.data?.totalPages || -1,
        pageIndex: props.data?.pageIndex || 0,
        gotoPage: props.gotoPage
      }}
    />
  )
}

const EntitiesListing: React.FC<EntitiesListingProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [page, setPage] = useState(0)

  const {
    loading: loadingEntityList,
    data: dataAllEntities,
    refetch
  } = useListGitSyncEntitiesByType({
    entityType: props.entityType,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      page: page,
      branch: props.branch,
      gitSyncConfigId: props.gitSyncConfigId,
      size: 5
    }
  })

  return loadingEntityList ? (
    <PageSpinner />
  ) : (
    <Container padding="small">
      <EntityListView
        data={dataAllEntities?.data}
        refetch={refetch}
        gotoPage={pageNumber => setPage(pageNumber)}
      ></EntityListView>
      <Text padding="large" color={Color.PRIMARY_7} onClick={() => props.backToSummary()}>
        {getString('gitsync.seeLess')}
      </Text>
    </Container>
  )
}

export default EntitiesListing
