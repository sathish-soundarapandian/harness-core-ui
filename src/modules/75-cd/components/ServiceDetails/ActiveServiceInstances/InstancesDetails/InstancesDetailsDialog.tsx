/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import cx from 'classnames'
import { Collapse, Container, Dialog, ExpandingSearchInput, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { InstanceGroupedByArtifactV2 } from 'services/cd-ng'
import { DeploymentsV2 } from '../../DeploymentView/DeploymentViewV2'
import { ActiveServiceInstancesContentV2, isClusterData, TableType } from '../ActiveServiceInstancesContentV2'
import css from './InstancesDetailsDialog.module.scss'

export interface InstancesDetailsDialogProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  data?: InstanceGroupedByArtifactV2[]
  isActiveInstance?: boolean
}

export default function InstancesDetailsDialog(props: InstancesDetailsDialogProps): React.ReactElement {
  const { isOpen, setIsOpen, data, isActiveInstance } = props
  const isCluster = isClusterData(defaultTo(data, []))
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')

  const deployments = defaultTo(data, [])

  //filter by artifactVersion envName and infraName
  const filteredDeployments = useMemo(() => {
    if (!searchTerm) {
      return deployments
    }
    const searchValue = searchTerm.toLocaleLowerCase()
    return deployments.filter(
      deployment =>
        (deployment.artifactVersion || '').toLocaleLowerCase().includes(searchValue) ||
        deployment.instanceGroupedByEnvironmentList?.some(
          i =>
            i.envName?.toLocaleLowerCase().includes(searchValue) ||
            i.instanceGroupedByInfraList?.some(
              infra =>
                infra.infraName?.toLocaleLowerCase().includes(searchValue) ||
                (infra.instanceGroupedByPipelineExecutionList?.length &&
                  infra.instanceGroupedByPipelineExecutionList.some(item =>
                    item.lastPipelineExecutionName?.toLocaleLowerCase().includes(searchValue)
                  ))
            ) ||
            i.instanceGroupedByClusterList?.some(
              cluster =>
                cluster.clusterIdentifier?.toLocaleLowerCase().includes(searchValue) ||
                (cluster.instanceGroupedByPipelineExecutionList?.length &&
                  cluster.instanceGroupedByPipelineExecutionList.some(item =>
                    item.lastPipelineExecutionName?.toLocaleLowerCase().includes(searchValue)
                  ))
            )
        )
    )
  }, [searchTerm, deployments])

  const onSearch = useCallback((val: string) => {
    setSearchTerm(val.trim())
  }, [])

  const headers = React.useMemo(() => {
    const headersArray = [
      {
        label: ' ',
        flexGrow: 4
      },
      {
        label: getString('cd.serviceDashboard.headers.artifactVersion'),
        flexGrow: 18
      },
      {
        label: getString('cd.serviceDashboard.headers.environment'),
        flexGrow: 16
      },
      {
        label: isCluster ? getString('common.cluster') : getString('cd.serviceDashboard.headers.infrastructures'),
        flexGrow: 16
      },
      {
        label: getString('cd.serviceDashboard.headers.instances'),
        flexGrow: 32
      },
      {
        label: getString('cd.serviceDashboard.headers.pipelineExecution'),
        flexGrow: 24
      }
    ]

    return (
      <Layout.Horizontal flex padding={{ top: 'medium', bottom: 'medium' }}>
        {headersArray.map((header, index) => {
          if (!isActiveInstance && header.label === getString('common.instanceLabel')) return <></>
          return (
            <Text
              key={index}
              font={{ variation: FontVariation.TABLE_HEADERS }}
              style={{ flex: header.flexGrow, textTransform: 'uppercase' }}
            >
              {header.label}
            </Text>
          )
        })}
      </Layout.Horizontal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCluster])

  const list = React.useMemo(() => {
    return (
      <Container style={{ overflowY: 'auto' }}>
        {filteredDeployments?.map((dataItem, index) => {
          if (
            dataItem.artifactVersion &&
            dataItem.instanceGroupedByEnvironmentList?.length === 1 &&
            defaultTo(dataItem.instanceGroupedByEnvironmentList[0].instanceGroupedByClusterList?.length, 0) <= 1 &&
            defaultTo(dataItem.instanceGroupedByEnvironmentList[0].instanceGroupedByInfraList?.length, 0) <= 1 &&
            defaultTo(
              dataItem.instanceGroupedByEnvironmentList[0].instanceGroupedByInfraList?.[0]
                ?.instanceGroupedByPipelineExecutionList?.length,
              0
            ) <= 5 &&
            defaultTo(
              dataItem.instanceGroupedByEnvironmentList[0].instanceGroupedByClusterList?.[0]
                ?.instanceGroupedByPipelineExecutionList?.length,
              0
            ) <= 5
          ) {
            return (
              <Container className={css.nonCollapseRow} key={index}>
                {isActiveInstance ? (
                  <ActiveServiceInstancesContentV2 tableType={TableType.FULL} data={[dataItem]} />
                ) : (
                  <DeploymentsV2 tableType={TableType.FULL} data={[dataItem]} />
                )}
              </Container>
            )
          }
          return (
            dataItem.artifactVersion &&
            dataItem.instanceGroupedByEnvironmentList && (
              <Collapse
                key={index}
                collapseClassName={css.collapse}
                collapseHeaderClassName={css.collapseHeader}
                heading={
                  isActiveInstance ? (
                    <ActiveServiceInstancesContentV2 tableType={TableType.SUMMARY} data={[dataItem]} />
                  ) : (
                    <DeploymentsV2 tableType={TableType.SUMMARY} data={[dataItem]} />
                  )
                }
                expandedHeading={<>{/* empty element on purpose */}</>}
                collapsedIcon={'main-chevron-right'}
                expandedIcon={'main-chevron-down'}
                transitionDuration={0}
                //this is for the case when search is applied, then we will show atleast one row opened
                isOpen={!isEmpty(searchTerm) && !index}
              >
                {isActiveInstance ? (
                  <ActiveServiceInstancesContentV2 tableType={TableType.FULL} data={[dataItem]} />
                ) : (
                  <DeploymentsV2 tableType={TableType.FULL} data={[dataItem]} />
                )}
              </Collapse>
            )
          )
        })}
      </Container>
    )
  }, [filteredDeployments])

  return (
    <Dialog
      className={cx('padded-dialog', css.dialogBase)}
      title={
        <Layout.Horizontal
          padding={{ bottom: 'large' }}
          flex={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text color={Color.GREY_900} font={{ variation: FontVariation.H4, weight: 'semi-bold' }}>
            {isActiveInstance
              ? getString('cd.serviceDashboard.instancesDetails')
              : getString('cd.serviceDashboard.deploymentDetails')}
          </Text>
          <ExpandingSearchInput
            placeholder={getString('search')}
            throttle={200}
            onChange={onSearch}
            className={css.searchIconStyle}
            alwaysExpanded
          />
        </Layout.Horizontal>
      }
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      enforceFocus={false}
    >
      <div className="separator" style={{ marginTop: '14px', borderTop: '1px solid var(--grey-100)' }} />
      {headers}
      {list}
    </Dialog>
  )
}
