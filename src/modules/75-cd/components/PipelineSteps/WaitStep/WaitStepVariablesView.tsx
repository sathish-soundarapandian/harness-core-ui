import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import type { WaitStepData } from './WaitStepTypes'

export interface WaitStepVariablesProps {
  initialValues: WaitStepData
  stageIdentifier: string
  onUpdate?(data: WaitStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: WaitStepData
}

export function JenkinsStepVariables({
  variablesData,
  metadataMap,
  initialValues
}: WaitStepVariablesProps): JSX.Element {
  return (
    <VariablesListTable<WaitStepData>
      data={flatObject(variablesData) as unknown as WaitStepData}
      originalData={initialValues}
      metadataMap={metadataMap}
    />
  )
}
