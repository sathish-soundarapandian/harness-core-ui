/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { RouteMappingStepData, RouteType } from '../RouteMappingStep'

export const initialValues: RouteMappingStepData = {
  type: StepType.RouteMapping,
  name: 'TASRouteMapping',
  identifier: 'TASRouteMapping',
  timeout: '10m',
  spec: {
    appName: 'appName',
    routeType: RouteType.Map,
    routes: ['route1']
  }
}

export const runtimeValues = {
  type: StepType.RouteMapping,
  name: 'TASRouteMapping',
  identifier: 'TASRouteMapping',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    appName: RUNTIME_INPUT_VALUE,
    routeType: RouteType.Map,
    routes: RUNTIME_INPUT_VALUE
  }
}
export const variableCustomStepProps = {
  stageIdentifier: 'qaStage',
  metadataMap: {
    'mF96Tc2eR7GLfy1tP-pzRQ': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.RouteMapping.description',
        localName: 'execution.steps.RouteMapping.description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      }
    },
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.RouteMapping.name',
        localName: 'execution.steps.RouteMapping.name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      }
    },
    lVkXFFEUTLi4PzQzS7OhKw: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.RouteMapping.timeout',
        localName: 'execution.steps.RouteMapping.timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      }
    },
    routeType: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.RouteMapping.spec.routeType',
        localName: 'execution.steps.RouteMapping.spec.routeType',
        variableName: 'spec.routeType',
        aliasFQN: '',
        visible: true
      }
    },

    appName: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.RouteMapping.spec.appName',
        localName: 'execution.steps.RouteMapping.spec.appName',
        variableName: 'spec.appName',
        aliasFQN: '',
        visible: true
      }
    },
    routes: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.RouteMapping.spec.routes',
        localName: 'execution.steps.RouteMapping.spec.routes',
        variableName: 'spec.routes',
        aliasFQN: '',
        visible: true
      }
    }
  },
  variablesData: {
    type: StepType.RouteMapping,
    name: 'TASRouteMapping',
    identifier: 'TASRouteMapping',
    description: 'mF96Tc2eR7GLfy1tP-pzRQ',
    timeout: 'lVkXFFEUTLi4PzQzS7OhKw',
    __uuid: '_Z743f4iRrS07-QndMuIbQ',
    spec: {
      appName: 'appName',
      routeType: RouteType.Map,
      routes: ['route1']
    }
  }
}
