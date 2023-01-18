/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TASBasicAppSetupData } from '../TASBasicAppSetupStep'
import { InstancesType } from '../TASBasicAppSetupTypes'

export const initialValues: TASBasicAppSetupData = {
  type: StepType.BasicAppSetup,
  name: 'TASBasicAppSetup',
  identifier: 'TASBasicAppSetup',
  timeout: '10m',
  spec: {
    tasInstanceCountType: InstancesType.FromManifest,
    existingVersionToKeep: 3
  }
}

export const runtimeValues = {
  type: StepType.BasicAppSetup,
  name: 'TASBasicAppSetup',
  identifier: 'TASBasicAppSetup',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    tasInstanceCountType: InstancesType.FromManifest,
    existingVersionToKeep: RUNTIME_INPUT_VALUE,
    additionalRoutes: RUNTIME_INPUT_VALUE
  }
}
export const variableCustomStepProps = {
  stageIdentifier: 'qaStage',
  metadataMap: {
    'mF96Tc2eR7GLfy1tP-pzRQ': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BasicAppSetup.description',
        localName: 'execution.steps.BasicAppSetup.description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      }
    },
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BasicAppSetup.name',
        localName: 'execution.steps.BasicAppSetup.name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      }
    },
    lVkXFFEUTLi4PzQzS7OhKw: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BasicAppSetup.timeout',
        localName: 'execution.steps.BasicAppSetup.timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      }
    },
    c6WYnnqnSj6Bi5paKrGMqg: {
      yamlExtraProperties: {
        properties: [
          {
            fqn: 'pipeline.stages.qaStage.spec.execution.steps.BasicAppSetup.spec.instances.type',
            localName: 'execution.steps.BasicAppSetup.spec.instances.type',
            variableName: 'type',
            aliasFQN: '',
            visible: true
          }
        ],
        outputproperties: []
      }
    },
    tasInstanceCountType: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BasicAppSetup.spec.tasInstanceCountType',
        localName: 'execution.steps.BasicAppSetup.spec.tasInstanceCountType',
        variableName: 'spec.tasInstanceCountType',
        aliasFQN: '',
        visible: true
      }
    },

    existingVersionToKeep: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BasicAppSetup.spec.existingVersionToKeep',
        localName: 'execution.steps.BasicAppSetup.spec.existingVersionToKeep',
        variableName: 'spec.existingVersionToKeep',
        aliasFQN: '',
        visible: true
      }
    },
    additionalRoutes: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BasicAppSetup.spec.additionalRoutes',
        localName: 'execution.steps.BasicAppSetup.spec.additionalRoutes',
        variableName: 'spec.additionalRoutes',
        aliasFQN: '',
        visible: true
      }
    }
  },
  variablesData: {
    type: 'TASBasicAppSetup',
    identifier: 'TASBasicAppSetup',
    name: 'step-name',
    description: 'mF96Tc2eR7GLfy1tP-pzRQ',
    timeout: 'lVkXFFEUTLi4PzQzS7OhKw',
    __uuid: '_Z743f4iRrS07-QndMuIbQ',
    spec: {
      tasInstanceCountType: InstancesType.FromManifest,
      existingVersionToKeep: 3,
      additionalRoutes: ['additionalRoute1']
    }
  }
}
