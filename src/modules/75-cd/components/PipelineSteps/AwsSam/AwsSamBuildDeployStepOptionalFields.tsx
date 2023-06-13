/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { AllowedTypes, Container } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { AwsSamDeployStepFormikValues } from './AwsSamDeployStep/AwsSamDeployStepEdit'
import type { AwsSamBuildStepFormikValues } from './AwsSamBuildStep/AwsSamBuildStepEdit'
import { AwsSamServerlessStepCommonOptionalFieldsEdit } from '../Common/AwsSamServerlessStepCommonOptionalFields/AwsSamServerlessStepCommonOptionalFieldsEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AwsSamBuildDeployStepFormikVaues = AwsSamDeployStepFormikValues | AwsSamBuildStepFormikValues

interface AwsSamDeployStepOptionalFieldsProps {
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
  readonly?: boolean
  formik: FormikProps<AwsSamBuildDeployStepFormikVaues>
  isAwsSamBuildStep?: boolean
}

export function AwsSamBuildDeployStepOptionalFields(props: AwsSamDeployStepOptionalFieldsProps): React.ReactElement {
  const { readonly, allowableTypes, formik, isAwsSamBuildStep } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <AwsSamServerlessStepCommonOptionalFieldsEdit
        allowableTypes={allowableTypes}
        readonly={readonly}
        formik={formik}
        versionFieldName={'spec.samVersion'}
        versionFieldLabel={getString('cd.samVersionLabel')}
        commandOptionsFieldName={isAwsSamBuildStep ? 'spec.buildCommandOptions' : 'spec.deployCommandOptions'}
        commandOptionsFieldLabel={
          isAwsSamBuildStep
            ? getString('cd.steps.awsSamBuildStep.awsSamBuildCommandOptions')
            : getString('cd.steps.awsSamDeployStep.awsSamDeployCommandOptions')
        }
        isAwsSamBuildStep={isAwsSamBuildStep}
      />

      <Container className={stepCss.formGroup}>
        <MultiTypeMap
          appearance={'minimal'}
          name={'spec.envVariables'}
          valueMultiTextInputProps={{ expressions, allowableTypes }}
          multiTypeFieldSelectorProps={{
            label: getString('optionalField', { name: getString('environmentVariables') }),
            disableTypeSelection: true
          }}
          configureOptionsProps={{
            hideExecutionTimeField: true
          }}
          disabled={readonly}
        />
      </Container>
    </>
  )
}
