/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Text, Card, TableV2 } from '@harness/uicore'
import { pick } from 'lodash-es'
import { Color } from '@harness/design-system'

import {
  GitSyncEntityListDTO,
  GitSyncEntityDTO,
  useListGitSyncEntitiesSummaryForRepoAndBranch,
  GitSyncConfig,
  GitEntityFilterProperties,
  ListGitSyncEntitiesByTypePathParams
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Entities } from '@common/interfaces/GitSyncInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import { getEntityHeaderText, getTableColumns } from './EntityHelper'
import EntitiesListing from './EntitiesListing'
import css from './GitSyncEntityTab.module.scss'

interface EntityListViewProps {
  data: GitSyncEntityListDTO
  hideHeaders?: boolean
}

interface EntitiesPreviewProps {
  branch: string
  repo: GitSyncConfig
}

type EntitiesTypeContainerProps = EntitiesPreviewProps & {
  entityList: GitSyncEntityListDTO
  key: string
}

const previewListSize = 2

export const EntityListView: React.FC<EntityListViewProps> = props => {
  const { data } = props

  return (
    <>
      {props.hideHeaders ? getEntityHeaderText(data) : null}
      <TableV2<GitSyncEntityDTO> className={css.table} columns={getTableColumns()} data={data.gitSyncEntities || []} />
    </>
  )
}

const EntitiesTypeContainer: React.FC<EntitiesTypeContainerProps> = props => {
  const [selectedEntity, setSelectedEntity] = useState('')
  const { entityList, repo, branch } = props
  const { getString } = useStrings()

  return React.useMemo(
    () => (
      <Card>
        {getEntityHeaderText(entityList)}
        {selectedEntity ? (
          <EntitiesListing
            entityType={selectedEntity as ListGitSyncEntitiesByTypePathParams['entityType']}
            gitSyncConfigId={repo.identifier}
            branch={branch || repo.branch}
            backToSummary={() => {
              setSelectedEntity('')
            }}
          ></EntitiesListing>
        ) : (
          <EntityListView data={entityList}></EntityListView>
        )}

        {!selectedEntity && entityList?.count && entityList.count > previewListSize ? (
          <Text
            color={Color.PRIMARY_7}
            padding={{ left: 'huge', bottom: 'large' }}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedEntity(entityList?.entityType || '')
            }}
          >
            {getString('gitsync.seeMore')}
          </Text>
        ) : null}
      </Card>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entityList, selectedEntity]
  )
}

const EntitiesPreview: React.FC<EntitiesPreviewProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [repoFileList, setRepoFileList] = useState<GitSyncEntityListDTO[]>([])
  const { getString } = useStrings()

  const defaultFilterProps = {
    searchTerm: '',
    entityTypes: Object.values(Entities) as GitEntityFilterProperties['entityTypes']
  }

  const { mutate: fetchEntities, loading: loadingEntityList } = useListGitSyncEntitiesSummaryForRepoAndBranch({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      gitSyncConfigId: props.repo.identifier,
      size: previewListSize
    },
    branch: props.branch
  })

  useEffect(() => {
    fetchEntities(defaultFilterProps).then(response => {
      setRepoFileList(response?.data || [])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.branch])

  return React.useMemo(
    () =>
      loadingEntityList ? (
        <PageSpinner />
      ) : (
        <Container padding="small">
          <Layout.Vertical spacing="small">
            {repoFileList?.length > 0
              ? repoFileList?.map?.((entityList: GitSyncEntityListDTO) => {
                  return (
                    <EntitiesTypeContainer
                      key={entityList.entityType || ''}
                      entityList={entityList}
                      {...pick(props, ['repo', 'branch'])}
                    ></EntitiesTypeContainer>
                  )
                })
              : getString('noData')}
          </Layout.Vertical>
        </Container>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repoFileList, loadingEntityList]
  )
}

export default EntitiesPreview
