/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Button, Container, getErrorInfoFromErrorObject, Icon, Layout, PageError, Text } from '@harness/uicore'
import { Drawer } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import {
  GetActiveInstanceGroupedByEnvironmentQueryParams,
  InstanceGroupedByEnvironment,
  useGetActiveInstanceGroupedByEnvironment
} from 'services/cd-ng'
import { PostProdTableData, getRollbackStatusFromResponse } from './PostProdRollbackUtil'
import { PostProdRollbackListTable } from './PostProdRollbackTable'
import openTaskEmptyState from '../openTaskEmptyState.svg'
import css from './PostProdRollback.module.scss'
import style from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer.module.scss'

interface PostProdRollbackProps {
  entityId: string
  entityName?: string
  isEnvGroup: boolean
  drawerOpen: boolean
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const getEnvTableData = (
  postProdTableData: InstanceGroupedByEnvironment[],
  isEnvGroup: boolean,
  envFilter?: string
): PostProdTableData[] => {
  const tableData: PostProdTableData[] = []
  postProdTableData.forEach(env => {
    /* istanbul ignore else */
    if ((!isEnvGroup && envFilter && env.envId === envFilter) || isEnvGroup || !envFilter) {
      const envName = defaultTo(env.envName, '-')
      const envId = env.envId
      let showEnv = true
      let showInfra = true

      /* istanbul ignore else */
      if (env.envId && env.instanceGroupedByEnvironmentTypeList) {
        env.instanceGroupedByEnvironmentTypeList.forEach(envDetail => {
          envDetail.instanceGroupedByInfrastructureList.forEach(infraDetail => {
            const infraId = infraDetail.infrastructureId
            const infraName = infraDetail.infrastructureName
            const clusterId = infraDetail.clusterId
            infraDetail.instanceGroupedByArtifactList.forEach(artifactDetail => {
              const artifact = artifactDetail.artifact
              const instanceCount = defaultTo(artifactDetail.count, 0)
              tableData.push({
                artifact: artifact,
                clusterId: clusterId,
                envId,
                envName,
                lastDeployedAt: artifactDetail.lastDeployedAt,
                infrastructureId: infraId,
                infrastructureName: infraName,
                instanceCount: instanceCount,
                pipelineId: artifactDetail.pipelineIdentifier,
                pipelineName: artifactDetail.pipelineIdentifier, // this is only for phase 1
                planexecutionId: artifactDetail.lastPlanExecutionId,
                rollbackStatus: getRollbackStatusFromResponse(artifactDetail.rollbackStatus),
                stageExecutionId: artifactDetail.stageNodeExecutionId,
                infrastructureMappingId: artifactDetail.infrastructureMappingId,
                instanceKey: artifactDetail.instanceKey,
                stageId: artifactDetail.stageSetupId,
                showEnv,
                showInfra
              })
              showEnv = false
              showInfra = false
            })
            showInfra = true
          })
        })
      }
      showEnv = true
    }
  })
  return tableData
}

export default function PostProdRollbackDrawer(props: PostProdRollbackProps): JSX.Element {
  const { isEnvGroup, entityId, entityName, drawerOpen, setDrawerOpen } = props

  const [drawerVisible, setDrawerVisible] = useState<boolean>(drawerOpen)
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveInstanceGroupedByEnvironmentQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    environmentIdentifier: !isEnvGroup ? entityId : undefined,
    envGroupIdentifier: isEnvGroup ? entityId : undefined
  }

  const { data, loading, error, refetch } = useGetActiveInstanceGroupedByEnvironment({
    queryParams,
    lazy: !drawerVisible
  })

  const instanceGroupList = data?.data?.instanceGroupedByEnvironmentList

  const postProdTableData: PostProdTableData[] = useMemo(() => {
    return getEnvTableData(defaultTo(instanceGroupList, [] as InstanceGroupedByEnvironment[]), isEnvGroup, entityId)
  }, [instanceGroupList, entityId, isEnvGroup])

  return (
    <>
      <Drawer
        enforceFocus={false}
        size={isEnvGroup ? 'calc(100% - 400px)' : 'calc(100% - 500px)'}
        isOpen={drawerVisible}
        data-testid={'PostProdRollbackDrawer'}
        canOutsideClickClose={true}
        onClose={
          /* istanbul ignore next */ () => {
            setDrawerOpen(false)
          }
        }
      >
        <Button
          minimal
          className={style.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            setDrawerVisible(false)
            setDrawerOpen(false)
          }}
        />
        <Layout.Vertical className={css.postProdRollbackBgColor} height={'100vh'}>
          <Layout.Horizontal
            flex={{ justifyContent: 'space-between' }}
            className={css.headerStyle}
            padding={{ top: 'large', bottom: 'large', right: 'xxlarge' }}
          >
            <Layout.Vertical spacing="small">
              <Text font={{ variation: FontVariation.BLOCKQUOTE }}>
                {getString('cd.serviceDashboard.postProdRollback.rollbackTitle')}
              </Text>
              <Layout.Horizontal>
                <Text
                  icon="services"
                  margin={{ right: 'medium', top: 'small' }}
                  font={{ variation: FontVariation.BODY }}
                  color={Color.GREY_600}
                >{`Service: ${serviceId}`}</Text>
                <Text
                  icon="infrastructure"
                  margin={{ top: 'small' }}
                  font={{ variation: FontVariation.BODY }}
                  color={Color.GREY_600}
                >{`${
                  isEnvGroup ? getString('common.environmentGroup.label') : getString('environment')
                }: ${entityName}`}</Text>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Icon name="refresh" color={Color.PRIMARY_7} onClick={() => refetch()} className={css.cursor} />
          </Layout.Horizontal>
          {loading ? (
            <Container
              flex={{ justifyContent: 'center', alignItems: 'center' }}
              height={'calc(100vh - 120px'}
              data-test="PostProdRollbackListTableLoading"
            >
              <Icon name="spinner" color={Color.GREY_500} size={30} />
            </Container>
          ) : error ? (
            <Container
              data-test="PostProdRollbackListTableError"
              height={'calc(100vh - 120px'}
              flex={{ justifyContent: 'center' }}
            >
              <PageError onClick={() => refetch()} message={getErrorInfoFromErrorObject(error)} />
            </Container>
          ) : !postProdTableData.length ? (
            <Layout.Vertical flex={{ alignItems: 'center', justifyContent: 'center' }} height={'calc(100vh - 200px'}>
              <img
                src={openTaskEmptyState}
                alt={getString('cd.serviceDashboard.postProdRollback.emptyStateMsg')}
                className={css.emptyStateStyle}
              />
              <Text font={{ variation: FontVariation.BODY }}>
                {getString('cd.serviceDashboard.postProdRollback.emptyStateMsg')}
              </Text>
            </Layout.Vertical>
          ) : (
            <PostProdRollbackListTable data={postProdTableData} isEnvGroup={isEnvGroup} setDrawerOpen={setDrawerOpen} />
          )}
        </Layout.Vertical>
      </Drawer>
    </>
  )
}
