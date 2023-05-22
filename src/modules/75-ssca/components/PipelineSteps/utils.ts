import { AllowedTypesWithExecutionTime, AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import type { SscaOrchestrationStepData } from './SscaOrchestrationStep/SscaOrchestrationStep'

export const AllMultiTypeInputTypesForStep: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

export const AllMultiTypeInputTypesForInputSet: AllowedTypesWithExecutionTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION
]

export const commonDefaultSpecValues: SscaOrchestrationStepData['spec'] = {
  tool: {
    type: 'Syft',
    spec: {
      format: 'spdx-json'
    }
  },
  source: {
    type: 'image',
    spec: {
      connector: '',
      image: ''
    }
  },
  attestation: {
    type: 'cosign',
    spec: {
      privateKey: '',
      password: ''
    }
  }
}
