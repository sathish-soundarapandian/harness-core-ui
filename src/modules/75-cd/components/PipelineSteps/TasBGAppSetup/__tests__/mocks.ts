/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { InstancesType } from '../../TASBasicAppSetupStep/TASBasicAppSetupTypes'
import type { TasBGAppSetupData } from '../TasBGAppSetup'

export const initialValues: TasBGAppSetupData = {
  type: StepType.BGAppSetup,
  name: 'TASBGAppSetup',
  identifier: 'TASBGAppSetup',
  timeout: '10m',
  spec: {
    tasInstanceCountType: InstancesType.FromManifest,
    existingVersionToKeep: 3,
    tempRoutes: ['tempRoute'],
    additionalRoutes: ['addRoute1']
  }
}
export const variableCustomStepProps = {
  stageIdentifier: 'qaStage',
  metadataMap: {
    'mF96Tc2eR7GLfy1tP-pzRQ': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.description',
        localName: 'execution.steps.BGAppSetup.description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      }
    },
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.name',
        localName: 'execution.steps.BGAppSetup.name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      }
    },
    lVkXFFEUTLi4PzQzS7OhKw: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.timeout',
        localName: 'execution.steps.BGAppSetup.timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      }
    },
    c6WYnnqnSj6Bi5paKrGMqg: {
      yamlExtraProperties: {
        properties: [
          {
            fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.spec.instances.type',
            localName: 'execution.steps.BGAppSetup.spec.instances.type',
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
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.spec.tasInstanceCountType',
        localName: 'execution.steps.BGAppSetup.spec.tasInstanceCountType',
        variableName: 'spec.tasInstanceCountType',
        aliasFQN: '',
        visible: true
      }
    },

    existingVersionToKeep: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.spec.existingVersionToKeep',
        localName: 'execution.steps.BGAppSetup.spec.existingVersionToKeep',
        variableName: 'spec.existingVersionToKeep',
        aliasFQN: '',
        visible: true
      }
    },
    additionalRoutes: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.spec.additionalRoutes',
        localName: 'execution.steps.BGAppSetup.spec.additionalRoutes',
        variableName: 'spec.additionalRoutes',
        aliasFQN: '',
        visible: true
      }
    },
    tempRoutes: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.BGAppSetup.spec.tempRoutes',
        localName: 'execution.steps.BGAppSetup.spec.tempRoutes',
        variableName: 'spec.tempRoutes',
        aliasFQN: '',
        visible: true
      }
    }
  },
  variablesData: {
    type: 'TASBGAppSetup',
    identifier: 'TASBGAppSetup',
    name: 'step-name',
    description: 'mF96Tc2eR7GLfy1tP-pzRQ',
    timeout: 'lVkXFFEUTLi4PzQzS7OhKw',
    __uuid: '_Z743f4iRrS07-QndMuIbQ',
    spec: {
      tasInstanceCountType: InstancesType.FromManifest,
      existingVersionToKeep: 3,
      tempRoutes: ['tempRoute'],
      additionalRoutes: ['additionalRoute1']
    }
  }
}

export const runtimeValues = {
  type: StepType.BGAppSetup,
  name: 'TASBGAppSetup',
  identifier: 'TASBGAppSetup',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    tasInstanceCountType: InstancesType.FromManifest,
    existingVersionToKeep: RUNTIME_INPUT_VALUE,
    additionalRoutes: RUNTIME_INPUT_VALUE,
    tempRoutes: RUNTIME_INPUT_VALUE
  }
}
