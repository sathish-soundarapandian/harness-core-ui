/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import { Text, Select, Container } from '@harness/uicore'
import qs from 'qs'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { ExecutionNode, PipelineExecutionSummary, ExecutionGraph } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { String } from 'framework/strings'
import ArtifactsComponent from './ArtifactsComponent/ArtifactsComponent'
import type { ArtifactGroup } from './ArtifactsComponent/ArtifactsComponent'
import artifactsEmptyState from './images/artifacts_empty_state.svg'
import css from './ExecutionArtifactsView.module.scss'

export const getStageSetupIds: (data: PipelineExecutionSummary) => string[] = data => {
  return Object.keys(data?.layoutNodeMap ?? {})
}

export const getStageNodesWithArtifacts: (data: ExecutionGraph, stageIds: string[]) => ExecutionNode[] = (
  data,
  stageIds
) => {
  return Object.values(data?.nodeMap ?? {}).filter(entry => {
    const { setupId = '', outcomes = [] } = entry
    const outcomeWithArtifacts = Array.isArray(outcomes)
      ? outcomes?.some((outcome: any) => outcome.fileArtifacts?.length || outcome.imageArtifacts?.length)
      : outcomes?.integrationStageOutcome?.fileArtifacts?.length ||
        outcomes?.integrationStageOutcome?.imageArtifacts?.length
    return stageIds.includes(setupId) && outcomeWithArtifacts
  })
}

export const getArtifactGroups: (stages: ExecutionNode[]) => ArtifactGroup[] = stages => {
  return stages.map(node => {
    const outcomeWithImageArtifacts = Array.isArray(node.outcomes)
      ? node.outcomes?.find(outcome => outcome.imageArtifacts)
      : node.outcomes?.integrationStageOutcome
    const imageArtifacts =
      outcomeWithImageArtifacts?.imageArtifacts?.map((artifact: any) => ({
        image: artifact.imageName,
        tag: artifact.tag,
        type: 'Image',
        url: artifact.url
      })) ?? []
    const outcomeWithFileArtifacts = Array.isArray(node.outcomes)
      ? node.outcomes?.find(outcome => outcome.fileArtifacts)
      : node.outcomes?.integrationStageOutcome
    const fileArtifacts = outcomeWithFileArtifacts?.fileArtifacts // TODO: fix typing once BE type is available
      ?.map((artifact: any) => ({
        type: 'File',
        url: artifact.url
      }))
    return {
      name: node.name!,
      icon: 'pipeline-deploy',
      artifacts: imageArtifacts.concat(fileArtifacts)
    }
  })
}

export function StageSelector(props: { layoutNodeMap?: PipelineExecutionSummary['layoutNodeMap'] }) {
  const history = useHistory()
  const params = useParams<any>()
  const query = useQueryParams<any>()
  const setupIds = Object.keys(props?.layoutNodeMap ?? {})
  const options = setupIds.map(value => ({
    value,
    label: props.layoutNodeMap![value].name!
  }))
  const selectedOption = options.find(option => option.value === query.stage)

  // Need to have a selected change by default when we are opening a page
  if (!selectedOption && options.length > 0) {
    history.push(routes.toExecutionArtifactsView(params) + '?' + qs.stringify({ ...query, stage: options[0].value }))
  }

  return (
    <Select
      className={css.stageSelector}
      value={selectedOption}
      items={options}
      onChange={val => {
        history.push(routes.toExecutionArtifactsView(params) + '?' + qs.stringify({ ...query, stage: val.value }))
      }}
    />
  )
}

export default function ExecutionArtifactsView(): React.ReactElement {
  const context = useExecutionContext()
  const executionSummary = get(context, 'pipelineExecutionDetail.pipelineExecutionSummary')
  const executionGraph = get(context, 'pipelineExecutionDetail.executionGraph')
  const stageSetupIds = getStageSetupIds(executionSummary as PipelineExecutionSummary)
  const stageNodes = getStageNodesWithArtifacts(executionGraph as any, stageSetupIds)
  const artifactGroups = getArtifactGroups(stageNodes)
  return (
    <div className={css.wrapper}>
      <StageSelector layoutNodeMap={executionSummary?.layoutNodeMap} />
      {artifactGroups.length ? (
        <ArtifactsComponent artifactGroups={artifactGroups} />
      ) : (
        <Container className={css.emptyArtifacts}>
          <img src={artifactsEmptyState} />
          <Text>
            <String stringID="pipeline.artifactTriggerConfigPanel.noArtifacts" />
          </Text>
        </Container>
      )}
    </div>
  )
}
