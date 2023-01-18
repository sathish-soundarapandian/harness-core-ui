/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ECSRunTaskStepInitialValues } from '../ECSRunTaskStep'

export const emptyInitialValuesTaskDefinitionArn: ECSRunTaskStepInitialValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsRunTask,
  spec: {
    taskDefinitionArn: '',
    runTaskRequestDefinition: {
      type: ManifestStoreMap.Git,
      spec: {
        branch: '',
        connectorRef: '',
        gitFetchType: 'Branch',
        paths: []
      }
    },
    skipSteadyStateCheck: false
  }
}

export const templateTaskDefinitionArn: ECSRunTaskStepInitialValues = {
  identifier: 'Test_Name',
  name: 'Test Name',
  type: StepType.EcsRunTask,
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    taskDefinitionArn: RUNTIME_INPUT_VALUE,
    runTaskRequestDefinition: {
      type: ManifestStoreMap.Git,
      spec: {
        branch: RUNTIME_INPUT_VALUE,
        connectorRef: RUNTIME_INPUT_VALUE,
        gitFetchType: 'Branch',
        paths: RUNTIME_INPUT_VALUE
      }
    },
    skipSteadyStateCheck: false
  }
}

export const emptyInitialValuesGitStore: ECSRunTaskStepInitialValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsRunTask,
  spec: {
    taskDefinition: {
      type: ManifestStoreMap.Git,
      spec: {
        branch: '',
        connectorRef: '',
        gitFetchType: 'Branch',
        paths: []
      }
    },
    runTaskRequestDefinition: {
      type: ManifestStoreMap.Git,
      spec: {
        branch: '',
        connectorRef: '',
        gitFetchType: 'Branch',
        paths: []
      }
    },
    skipSteadyStateCheck: false
  }
}
export const templateGitStore: ECSRunTaskStepInitialValues = {
  identifier: 'Test_Name',
  name: 'Test Name',
  type: StepType.EcsRunTask,
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    taskDefinition: {
      type: ManifestStoreMap.Git,
      spec: {
        branch: RUNTIME_INPUT_VALUE,
        connectorRef: RUNTIME_INPUT_VALUE,
        gitFetchType: 'Branch',
        paths: RUNTIME_INPUT_VALUE
      }
    },
    runTaskRequestDefinition: {
      type: ManifestStoreMap.Git,
      spec: {
        branch: RUNTIME_INPUT_VALUE,
        connectorRef: RUNTIME_INPUT_VALUE,
        gitFetchType: 'Branch',
        paths: RUNTIME_INPUT_VALUE
      }
    },
    skipSteadyStateCheck: false
  }
}

export const emptyInitialValuesS3Store: ECSRunTaskStepInitialValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsRunTask,
  spec: {
    taskDefinition: {
      type: ManifestStoreMap.S3,
      spec: {
        connectorRef: '',
        region: '',
        bucketName: '',
        paths: []
      }
    },
    runTaskRequestDefinition: {
      type: ManifestStoreMap.S3,
      spec: {
        connectorRef: '',
        region: '',
        bucketName: '',
        paths: []
      }
    },
    skipSteadyStateCheck: false
  }
}

export const templateS3Store: ECSRunTaskStepInitialValues = {
  identifier: 'Test_Name',
  name: 'Test Name',
  type: StepType.EcsRunTask,
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    taskDefinition: {
      type: ManifestStoreMap.S3,
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        region: RUNTIME_INPUT_VALUE,
        bucketName: RUNTIME_INPUT_VALUE,
        paths: RUNTIME_INPUT_VALUE
      }
    },
    runTaskRequestDefinition: {
      type: ManifestStoreMap.S3,
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        region: RUNTIME_INPUT_VALUE,
        bucketName: RUNTIME_INPUT_VALUE,
        paths: RUNTIME_INPUT_VALUE
      }
    },
    skipSteadyStateCheck: false
  }
}
