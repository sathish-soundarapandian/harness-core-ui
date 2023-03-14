import { AllowedTypesWithExecutionTime, AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

export const AllMultiTypeInputTypesForStep: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

export const AllMultiTypeInputTypesForInputSet: AllowedTypesWithExecutionTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION
]
