/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { Card, Container, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { PipelineConfig, PipelineInfoConfig, useGetPipeline } from 'services/pipeline-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { VariableOutputPanel } from './VariableOutputPanel'
import type { PipelineStageOutputSectionProps } from './utils'
import css from '../PipelineStageOverview.module.scss'

export function PipelineStageOutputSection(props: PipelineStageOutputSectionProps): React.ReactElement {
  const { getString } = useStrings()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { accountId } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()
  const { connectorRef, repoIdentifier: _repoId, repoName, branch } = useQueryParams<GitQueryParams>()
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()

  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const repoIdentifier = isGitSyncEnabled ? _repoId : repoName
  const selectedStage = getStageFromPipeline<PipelineStageElementConfig>(selectedStageId).stage
  const pipelineIdentifier = get(selectedStage?.stage as PipelineStageElementConfig, 'spec.pipeline', '')
  const projectIdentifier = get(selectedStage?.stage as PipelineStageElementConfig, 'spec.project', '')
  const orgIdentifier = get(selectedStage?.stage as PipelineStageElementConfig, 'spec.org', '')

  const { data: pipelineResponse } = useGetPipeline({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      getTemplatesResolvedPipeline: true,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })

  // It's required to support child pipeline expression suggestion in Output's Tab
  const resolvedChildPipeline: PipelineInfoConfig | undefined = React.useMemo(
    () => yamlParse<PipelineConfig>(defaultTo(pipelineResponse?.data?.resolvedTemplatesPipelineYaml, ''))?.pipeline,
    [pipelineResponse?.data?.resolvedTemplatesPipelineYaml]
  )

  return (
    <div className={css.pipelineStageOverviewWrapper}>
      <ErrorsStripBinded domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <Container className={css.content}>
        <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.pipelineChaining.pipelineOutputs')}
        </Text>
        <Text font={{ variation: FontVariation.H6, weight: 'light' }} margin={{ bottom: 'small' }}>
          {getString('pipeline.pipelineChaining.outputTabSummaryDetail')}
        </Text>
        <Card className={css.outputPanel} id="outputs">
          <PipelineVariablesContextProvider pipeline={resolvedChildPipeline}>
            <VariableOutputPanel />
          </PipelineVariablesContextProvider>
        </Card>
        <Container margin={{ top: 'xxlarge' }} className={css.actionButtons}>
          {props.children}
        </Container>
      </Container>
    </div>
  )
}
