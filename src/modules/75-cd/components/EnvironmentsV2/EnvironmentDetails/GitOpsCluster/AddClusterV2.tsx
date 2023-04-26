/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop, isEmpty, get } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import { Container, Text, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { EntityReference } from '@common/exports'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import { useStrings } from 'framework/strings'

import {
  ResponsePageClusterResponse,
  getClusterListFromSourcePromise,
  ResponsePageClusterFromGitops,
  ClusterFromGitops,
  useLinkClusters,
  ClusterBasicDTO,
  ClusterResponse
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { Scope } from '@common/interfaces/SecretsInterface'
import environmentEmptyStateSvg from '@pipeline/icons/emptyServiceDetail.svg'
import { getErrorMessage } from '@triggers/components/Triggers/ManifestTrigger/ManifestWizardPageUtils'
import css from './AddCluster.module.scss'

interface AddClusterProps {
  linkedClusterResponse: ResponsePageClusterResponse | null
  onHide: () => void
  refetch: () => void
  envRef: string
}

const DELIMITER = '__'

const SCOPE_TO_ENUM = {
  [Scope.PROJECT]: 'PROJECT',
  [Scope.ORG]: 'ORGANIZATION',
  [Scope.ACCOUNT]: 'ACCOUNT'
}

const AddCluster = (props: AddClusterProps): React.ReactElement => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [pagedData, setPagedData] = React.useState<ResponsePageClusterFromGitops>({})
  const [pageNo, setPageNo] = React.useState(0)

  const linkedClustersMap = get(props.linkedClusterResponse, 'data.content', []).reduce(
    (map: Record<string, boolean>, cluster: ClusterResponse) => {
      const key = `${cluster.clusterRef}${DELIMITER}${cluster.agentIdentifier}${DELIMITER}${cluster.scope}`
      map[key] = true
      return map
    },
    {}
  )

  const fetchRecords = ({
    done,
    search,
    pageIndex,
    scope
  }: {
    pageIndex: number
    search: string
    done: (records: any[]) => void
    scope?: Scope
  }) => {
    const orgAndProj: { orgIdentifier?: string; projectIdentifier?: string } = {}
    if (scope === Scope.ORG) {
      orgAndProj.orgIdentifier = orgIdentifier
    }
    if (scope === Scope.PROJECT) {
      orgAndProj.orgIdentifier = orgIdentifier
      orgAndProj.projectIdentifier = projectIdentifier
    }
    return getClusterListFromSourcePromise({
      queryParams: {
        accountIdentifier: accountId,
        ...orgAndProj,
        scoped: true,
        searchTerm: search?.trim(),
        page: pageIndex,
        size: 10
      }
    }).then(responseData => {
      if (responseData?.data?.content) {
        const content = responseData.data.content.map(item => ({
          ...item,
          identifier: `${item.identifier}${DELIMITER}${item.agentIdentifier}`,
          record: {
            ...item,
            ...orgAndProj
          }
        }))
        setPagedData(responseData)
        done(content)
      } else {
        done([])
      }
    })
  }

  const { mutate: createCluster } = useLinkClusters({
    queryParams: { accountIdentifier: accountId }
  })

  const onSubmit = (selectedEntities: ScopeAndIdentifier[]) => {
    const clusters = selectedEntities
      ?.map(entity => {
        const { identifier, scope } = entity || {}
        if (!identifier) return {}
        const [clusterId, agentIdentifier] = identifier.split(DELIMITER)
        return {
          identifier: clusterId,
          agentIdentifier,
          scope: SCOPE_TO_ENUM[scope]
        } as ClusterBasicDTO
      })
      .filter(i => !isEmpty(i))
    const payload = {
      envRef: props.envRef,
      clusters,
      orgIdentifier,
      projectIdentifier,
      accountId,
      linkAllClusters: false
    }
    createCluster(payload, { queryParams: { accountIdentifier: accountId } })
      .then(() => {
        showSuccess(getString('cd.successfullyLinkedClusters'))
        props.onHide()
        props.refetch()
      })
      .catch(err => {
        showError(getErrorMessage(err))
      })
  }

  return (
    <Dialog
      isOpen
      style={{
        width: 'auto',
        padding: 'var(--spacing-xlarge)'
      }}
      enforceFocus={false}
      usePortal
      canOutsideClickClose={false}
      onClose={props.onHide}
      title={getString('cd.selectGitopsCluster')}
      isCloseButtonShown={true}
    >
      <Container>
        <EntityReference
          onCancel={props.onHide}
          onSelect={noop}
          onMultiSelect={onSubmit}
          fetchRecords={(done, search, pageIndex, scope) => {
            fetchRecords({
              done,
              search,
              pageIndex,
              scope
            })
          }}
          recordRender={({ item }) => {
            const _item = item as ClusterFromGitops
            const key = `${_item.identifier}${DELIMITER}${_item.scopeLevel}`
            const isLinked = linkedClustersMap[key]
            return (
              <div
                key={`${_item.identifier}-${_item.agentIdentifier}`}
                onClick={e => (isLinked ? e.stopPropagation() : null)}
                className={isLinked ? css.linkedCluster : ''}
              >
                <Text flex>
                  <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.BLACK}>
                    {_item.name}
                  </Text>
                  {isLinked ? (
                    <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                      {getString('cd.linked')}
                    </Text>
                  ) : null}
                </Text>

                <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                  {getString('cd.agentID')}: {_item.agentIdentifier}
                </Text>
              </div>
            )
          }}
          noDataCard={{
            image: environmentEmptyStateSvg,
            message: getString('cd.noCluster.title'),
            containerClassName: css.noDataCardContainerConnector,
            className: css.noDataCardContainerContent
          }}
          noRecordsText={getString('cd.noCluster.title')}
          disableCollapse
          isMultiSelect
          showAllTab={false}
          pagination={{
            itemCount: pagedData?.data?.totalItems || 0,
            pageSize: pagedData?.data?.pageSize || 0,
            pageCount: pagedData?.data?.totalPages || 0,
            pageIndex: pageNo || 0,
            gotoPage: pageIndex => {
              setPageNo(pageIndex)
            }
          }}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
        />
      </Container>
    </Dialog>
  )
}

export default AddCluster
