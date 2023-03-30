/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import React from 'react'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { String } from 'framework/strings'
import type {
  ExecutionGraph,
  ExecutionNode,
  PipelineExecutionDetail,
  PipelineExecutionSummary
} from 'services/pipeline-ng'
import type { ArtifactGroup } from './ArtifactsComponent/ArtifactsComponent'
import ArtifactsComponent from './ArtifactsComponent/ArtifactsComponent'
import type { Artifact } from './ArtifactsTable/ArtifactsTable'
import { ExecutionArtifactListView } from './ExecutionArtifactListView'
import { StageSelector } from './StageSelector'
import artifactsEmptyState from './images/artifacts_empty_state.svg'
import css from './ExecutionArtifactsView.module.scss'

export const getStageSetupIds: (data?: PipelineExecutionSummary) => string[] = data => {
  return Object.keys(data?.layoutNodeMap ?? {})
}

export const getStageNodesWithArtifacts: (data: ExecutionGraph | undefined, stageIds: string[]) => ExecutionNode[] = (
  data,
  stageIds
) => {
  return Object.values(data?.nodeMap ?? {}).filter(entry => {
    const { setupId = '', outcomes = [] } = entry
    const outcomeWithArtifacts = Array.isArray(outcomes)
      ? outcomes?.some(
          (outcome: any) =>
            outcome.fileArtifacts?.length || outcome.imageArtifacts?.length || outcome.sbomArtifacts?.length
        )
      : outcomes?.integrationStageOutcome?.fileArtifacts?.length ||
        outcomes?.integrationStageOutcome?.imageArtifacts?.length ||
        outcomes?.integrationStageOutcome?.sbomArtifacts?.length
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

export const getArtifacts: (stages: ExecutionNode[]) => Artifact[] = stages => {
  return stages.reduce<Artifact[]>((artifacts, node) => {
    const outcomeWithImageArtifacts = Array.isArray(node.outcomes)
      ? node.outcomes?.find(outcome => outcome.imageArtifacts)
      : node.outcomes?.integrationStageOutcome
    const imageArtifacts: Artifact[] =
      outcomeWithImageArtifacts?.imageArtifacts?.map((artifact: any) => ({
        ...artifact,
        type: 'Image',
        node
      })) ?? []

    const outcomeWithFileArtifacts = Array.isArray(node.outcomes)
      ? node.outcomes?.find(outcome => outcome.fileArtifacts)
      : node.outcomes?.integrationStageOutcome
    const fileArtifacts: Artifact[] =
      outcomeWithFileArtifacts?.fileArtifacts?.map((artifact: any) => ({
        ...artifact,
        type: 'File',
        node
      })) ?? []

    const outcomeWithSbomArtifacts = Array.isArray(node.outcomes)
      ? node.outcomes?.find(outcome => outcome.sbomArtifacts)
      : node.outcomes?.integrationStageOutcome
    const sbomArtifacts: Artifact[] =
      outcomeWithSbomArtifacts?.sbomArtifacts?.map((artifact: any) => ({
        ...artifact,
        type: 'Sbom',
        node
      })) || []

    artifacts.push(...imageArtifacts, ...fileArtifacts, ...sbomArtifacts)
    return artifacts
  }, [])
}

export default function ExecutionArtifactsView(): React.ReactElement {
  const context = useExecutionContext()
  const SSCA_ENABLED = useFeatureFlag(FeatureFlag.SSCA_ENABLED)
  const { pipelineExecutionSummary, executionGraph } = defaultTo(
    context?.pipelineExecutionDetail,
    {} as PipelineExecutionDetail
  )
  const stageSetupIds = getStageSetupIds(pipelineExecutionSummary)
  const stageNodes = getStageNodesWithArtifacts(executionGraph, stageSetupIds)
  const artifactGroups = getArtifactGroups(stageNodes)

  return SSCA_ENABLED ? (
    <ExecutionArtifactListView
      artifacts={getArtifacts(stageNodes)}
      pipelineExecutionSummary={pipelineExecutionSummary}
    />
  ) : (
    <div className={css.wrapper}>
      <StageSelector layoutNodeMap={pipelineExecutionSummary?.layoutNodeMap} />
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
