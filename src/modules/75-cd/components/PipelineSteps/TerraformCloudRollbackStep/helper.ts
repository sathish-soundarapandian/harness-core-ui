import * as Yup from 'yup'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StepElementConfig, TerraformCloudRollbackStepInfo } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'

export function getValidationSchema(
  getString: UseStringsReturn['getString'],
  stepViewType?: StepViewType
): Yup.ObjectSchema {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      provisionerIdentifier: Yup.lazy((value): Yup.Schema<unknown> => {
        if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
          return IdentifierSchemaWithOutName(getString, {
            requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
            regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
          })
        }
        return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
      })
    })
  })
}

export interface TerraformCloudRollbackData extends StepElementConfig {
  spec: TerraformCloudRollbackStepInfo
}

export interface TerraformCloudRollbackVariableStepProps {
  initialValues: TerraformCloudRollbackData
  onUpdate?(data: TerraformCloudRollbackData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TerraformCloudRollbackData
}

export interface TerraformCloudRollbackProps {
  initialValues: TerraformCloudRollbackData
  onUpdate?: (data: TerraformCloudRollbackData) => void
  onChange?: (data: TerraformCloudRollbackData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: TerraformCloudRollbackData
  readonly?: boolean
  path?: string
}
