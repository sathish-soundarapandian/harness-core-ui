import React from 'react'
import type { AllowedTypes } from '@harness/uicore'
import { Layout } from '@harness/uicore'
import { connect } from 'formik'
import type { DeploymentStageConfig, StepGroupElementConfig } from 'services/cd-ng'
import type { StepViewType } from '../AbstractSteps/Step'
import { ExecutionWrapperInputSetForm } from './ExecutionWrapperInputSetForm'
import type { StageInputSetFormProps } from './StageInputSetForm'

export function StepGroupFormSetInternal(props: {
  template: StepGroupElementConfig
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: any
  values?: any
  readonly?: boolean
  viewType: StepViewType
  allowableTypes: AllowedTypes
  executionIdentifier?: string
  customStepProps?: {
    stageIdentifier: string
    selectedStage?: DeploymentStageConfig
  }
}): JSX.Element {
  const { template, allValues, values, path, formik, readonly, viewType, allowableTypes, customStepProps } = props

  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      <ExecutionWrapperInputSetForm
        stepsTemplate={template?.steps}
        formik={formik}
        readonly={readonly}
        path={`${path}.steps`}
        allValues={allValues?.steps}
        values={values?.steps}
        viewType={viewType}
        allowableTypes={allowableTypes}
        customStepProps={customStepProps}
      />
    </Layout.Vertical>
  )
}

export const StepGroupForm = connect(StepGroupFormSetInternal)
