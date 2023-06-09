import type { AllowedTypes } from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

export interface IACMApprovalData {
  name: string
  identifier: string
  timeout: string
}

export interface IACMApprovalStepProps {
  stepViewType: StepViewType
  isNewStep?: boolean
  initialValues: IACMApprovalData
  allowableTypes: AllowedTypes
  readonly?: boolean
}
