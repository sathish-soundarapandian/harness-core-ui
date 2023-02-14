/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { BambooStepData, BambooStepSpec } from './types'
import { flatObject } from '../Common/ApprovalCommons'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface BambooStepVariablesProps {
  initialValues: BambooStepData
  stageIdentifier: string
  onUpdate?(data: BambooStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: BambooStepData
}

export function BambooStepVariables({
  variablesData,
  metadataMap,
  initialValues
}: BambooStepVariablesProps): JSX.Element {
  return (
    <VariablesListTable<BambooStepSpec>
      className={pipelineVariableCss.variablePaddingL3}
      data={flatObject(variablesData.spec) as unknown as BambooStepSpec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}
