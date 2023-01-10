/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { InstancesType, ResizeStrategyType } from '../../TASBasicAppSetupStep/TASBasicAppSetupTypes'
import type { TasCanaryAppSetupData } from '../TasCanaryAppSetup'

export const initialValues: TasCanaryAppSetupData = {
  type: StepType.CanaryAppSetup,
  name: 'TASCanaryAppSetup',
  identifier: 'TASCanaryAppSetup',
  timeout: '10s',
  spec: {
    tasInstanceCountType: InstancesType.FromManifest,
    existingVersionToKeep: 3,
    resizeStrategy: ResizeStrategyType.DownScaleOldFirst,
    additionalRoutes: ['addRoute1']
  }
}

export const variableCustomStepProps = {
  stageIdentifier: 'qaStage',
  metadataMap: {
    'mF96Tc2eR7GLfy1tP-pzRQ': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.description',
        localName: 'execution.steps.CanaryAppSetup.description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      }
    },
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.name',
        localName: 'execution.steps.CanaryAppSetup.name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      }
    },
    lVkXFFEUTLi4PzQzS7OhKw: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.timeout',
        localName: 'execution.steps.CanaryAppSetup.timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      }
    },
    c6WYnnqnSj6Bi5paKrGMqg: {
      yamlExtraProperties: {
        properties: [
          {
            fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.spec.instances.type',
            localName: 'execution.steps.CanaryAppSetup.spec.instances.type',
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
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.spec.tasInstanceCountType',
        localName: 'execution.steps.CanaryAppSetup.spec.tasInstanceCountType',
        variableName: 'spec.tasInstanceCountType',
        aliasFQN: '',
        visible: true
      }
    },
    resizeStrategy: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.spec.resizeStrategy',
        localName: 'execution.steps.CanaryAppSetup.spec.resizeStrategy',
        variableName: 'spec.resizeStrategy',
        aliasFQN: '',
        visible: true
      }
    },

    existingVersionToKeep: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.spec.existingVersionToKeep',
        localName: 'execution.steps.CanaryAppSetup.spec.existingVersionToKeep',
        variableName: 'spec.existingVersionToKeep',
        aliasFQN: '',
        visible: true
      }
    },
    additionalRoutes: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.CanaryAppSetup.spec.additionalRoutes',
        localName: 'execution.steps.CanaryAppSetup.spec.additionalRoutes',
        variableName: 'spec.additionalRoutes',
        aliasFQN: '',
        visible: true
      }
    }
  },
  variablesData: {
    type: 'TASCanaryAppSetup',
    identifier: 'TASCanaryAppSetup',
    name: 'step-name',
    description: 'mF96Tc2eR7GLfy1tP-pzRQ',
    timeout: 'lVkXFFEUTLi4PzQzS7OhKw',
    __uuid: '_Z743f4iRrS07-QndMuIbQ',
    spec: {
      tasInstanceCountType: InstancesType.FromManifest,
      resizeStrategy: ResizeStrategyType.DownScaleOldFirst,
      existingVersionToKeep: 3,
      additionalRoutes: ['additionalRoute1']
    }
  }
}

export const runtimeValues = {
  type: StepType.CanaryAppSetup,
  name: 'TASCanaryAppSetup',
  identifier: 'TASCanaryAppSetup',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    tasInstanceCountType: InstancesType.FromManifest,
    resizeStrategy: ResizeStrategyType.DownScaleOldFirst,
    existingVersionToKeep: RUNTIME_INPUT_VALUE,
    additionalRoutes: RUNTIME_INPUT_VALUE
  }
}
