/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Layout } from '@harness/uicore'

import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

import type { ServiceDefinition } from 'services/cd-ng'
import AzureWebAppListView from './AzureWebAppAppServiceConfig/AzureWebAppServiceConfig'

export interface AzureWebAppSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  // isReadonlyServiceMode: boolean
  readonly: boolean
}

export default function AzureWebAppConfigSelection({
  isPropagating,
  deploymentType,
  // isReadonlyServiceMode,
  readonly
}: AzureWebAppSelectionProps): JSX.Element | null {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const AzureWebAppCommonProps = {
    isPropagating,
    stage,
    updateStage,
    // connectors: fetchedConnectorResponse,
    isReadonly: readonly,
    deploymentType,
    allowableTypes
  }
  return (
    <Layout.Vertical>
      <AzureWebAppListView {...AzureWebAppCommonProps} pipeline={pipeline} />
    </Layout.Vertical>
  )
}
