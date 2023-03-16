import React from 'react'
import type { AllowedTypes } from '@harness/uicore'
import { Layout } from '@harness/uicore'
import { connect } from 'formik'
import type { DeploymentStageConfig, StepGroupElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { StageType } from '@pipeline/utils/stageHelpers'
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
    stageType?: StageType
  }
}): JSX.Element {
  const { template, allValues, values, path, formik, readonly, viewType, allowableTypes, customStepProps } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      {template?.delegateSelectors && (
        <MultiTypeDelegateSelector
          inputProps={{ readonly }}
          allowableTypes={allowableTypes}
          label={getString('delegate.DelegateSelector')}
          name={`${path}.delegateSelectors`}
          disabled={readonly}
        />
      )}
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
