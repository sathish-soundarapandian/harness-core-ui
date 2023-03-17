/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepElementConfig, TerraformCloudRunStepInfo } from 'services/cd-ng'
import type { VariableResponseMapValue } from 'services/pipeline-ng'

export interface TerraformCloudRunEditProps {
  initialValues: TerraformCloudRunFormData
  onUpdate?: (data: TerraformCloudRunFormData) => void
  onChange?: (data: TerraformCloudRunFormData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  stepType?: StepType
  formik?: FormikProps<TerraformCloudRunFormData>
}

export interface TerraformCloudRunInputStepProps {
  initialValues: TerraformCloudRunFormData
  allValues?: TerraformCloudRunFormData
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: TerraformCloudRunFormData
  path?: string
}

export interface TerraformCloudRunVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: TerraformCloudRunFormData
}

export interface TerraformCloudRunFormData extends StepElementConfig {
  spec: Omit<TerraformCloudRunStepInfo, 'spec'> & {
    spec: {
      connectorRef?: string
      discardPendingRuns?: boolean
      organization?: string | SelectOption | any
      workspace?: string | SelectOption
      provisionerIdentifier?: string
      terraformVersion?: string
      variables?: any
      exportTerraformPlanJson?: boolean
      targets?: Array<{ id: string; value: string }> | string[] | string
      planType?: 'Plan' | 'Destroy'
      overridePolicies?: boolean
    }
  }
}
