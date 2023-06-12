/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithExecutionTime, AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import type { SscaOrchestrationStepData } from './SscaOrchestrationStep/SscaOrchestrationStep'
import type { SscaEnforcementStepData } from './SscaEnforcementStep/SscaEnforcementStep'

export const AllMultiTypeInputTypesForStep: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

export const AllMultiTypeInputTypesForInputSet: AllowedTypesWithExecutionTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION
]

export const commonDefaultOrchestrationSpecValues: SscaOrchestrationStepData['spec'] = {
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

export const commonDefaultEnforcementSpecValues: SscaEnforcementStepData['spec'] = {
  source: {
    type: 'image',
    spec: {
      connector: '',
      image: ''
    }
  },
  verifyAttestation: {
    type: 'cosign',
    spec: {
      publicKey: ''
    }
  },
  policy: {
    store: {
      type: 'Harness',
      spec: {
        file: ''
      }
    }
  }
}
