/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { WaitStepData } from './WaitStepTypes'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface WaitStepVariablesViewProps {
  initialValues: WaitStepData
  stageIdentifier: string
  onUpdate?(data: WaitStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: WaitStepData
}

export function WaitStepVariablesView({
  variablesData,
  metadataMap,
  initialValues
}: WaitStepVariablesViewProps): JSX.Element {
  return (
    <VariablesListTable
      className={pipelineVariablesCss.variablePaddingL3}
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}
