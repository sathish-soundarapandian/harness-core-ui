/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, TableV2, Text, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import type { CellProps, Column, ColumnInstance, Renderer } from 'react-table'
import { Color, FontVariation } from '@harness/design-system'
import ReactTimeago from 'react-timeago'
import { useStrings } from 'framework/strings'
import type { ArtifactDeploymentDetail } from 'services/cd-ng'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import type {
  ExecutionPathProps,
  ModulePathParams,
  PipelinePathProps,
  PipelineType,
  ProjectPathProps
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import css from './ServiceDetailsSummaryV2.module.scss'

type columnType = ColumnInstance<ArtifactDeploymentDetail> & { isArtifactView: boolean; artifactName?: string }

const RenderEnvName: Renderer<CellProps<ArtifactDeploymentDetail>> = ({ row }) => {
  const envName = row.original.envName
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  const handleClick = (): void => {
    const route = routes.toEnvironmentDetails({
      accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: row.original.envId as string,
      module
    })

    window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
  }
  return (
    <Text
      color={Color.PRIMARY_4}
      font={{ variation: FontVariation.TABLE_HEADERS }}
      lineClamp={1}
      tooltipProps={{ isDark: true }}
      className={css.cursor}
      onClick={e => {
        e.stopPropagation()
        handleClick()
      }}
    >
      {envName || '--'}
    </Text>
  )
}

const RenderLatestVersion: Renderer<CellProps<ArtifactDeploymentDetail>> = ({ row, column }) => {
  const artifactVersion = row.original.artifact
  const { artifactName, isArtifactView } = column as columnType
  const nameIntent = isArtifactView && artifactName && artifactName !== artifactVersion ? Color.RED_400 : Color.GREY_100
  return (
    <Text color={nameIntent} font={{ variation: FontVariation.SMALL }} lineClamp={1} tooltipProps={{ isDark: true }}>
      {artifactVersion || '--'}
    </Text>
  )
}

const RenderLastDeployedTime: Renderer<CellProps<ArtifactDeploymentDetail>> = ({ row }) => {
  const { orgIdentifier, projectIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  /* istanbul ignore next */
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'
  const { showError } = useToaster()
  const { getString } = useStrings()
  const lastDeployedAt = row.original.lastDeployedAt
  const planExecId = row.original.lastPipelineExecutionId
  const pipelineId = row.original.pipelineId

  const handleClick = (): void => {
    /* istanbul ignore else */
    if (pipelineId && planExecId) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: pipelineId,
        executionIdentifier: planExecId,
        projectIdentifier,
        accountId,
        module,
        source
      })

      window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
    } else {
      showError(getString('cd.serviceDashboard.noLastDeployment'))
    }
  }

  return (
    <Text
      color={Color.PRIMARY_4}
      font={{ variation: FontVariation.SMALL }}
      lineClamp={1}
      tooltipProps={{ isDark: true }}
      className={css.cursor}
      onClick={e => {
        e.stopPropagation()
        handleClick()
      }}
    >
      <ReactTimeago date={lastDeployedAt as number} />
    </Text>
  )
}

function ServiceDetailDriftTable({
  data,
  artifactName,
  isArtifactView
}: {
  data: ArtifactDeploymentDetail[]
  isArtifactView: boolean
  artifactName?: string
}): JSX.Element {
  const { getString } = useStrings()
  const artifactDetail = defaultTo(data, [])

  const columns: Column<ArtifactDeploymentDetail>[] = React.useMemo(
    () => [
      {
        id: 'envName',
        width: '25%',
        Header: '',
        Cell: RenderEnvName
      },
      {
        id: 'version',
        width: '45%',
        Cell: RenderLatestVersion,
        Header: getString('cd.serviceDashboard.latestVersion').toUpperCase(),
        artifactName,
        isArtifactView
      },
      {
        id: 'lastDeployed',
        width: '30%',
        Cell: RenderLastDeployedTime,
        Header: getString('cd.serviceDashboard.lastDeployment').toUpperCase()
      }
    ],
    [getString]
  )
  return (
    <Container className={css.driftTable}>
      <Text color={Color.RED_400} font={{ variation: FontVariation.BODY }}>
        {getString('cd.serviceDashboard.driftDetection')}
      </Text>
      <TableV2 data={artifactDetail} columns={columns} />
    </Container>
  )
}

export default ServiceDetailDriftTable
