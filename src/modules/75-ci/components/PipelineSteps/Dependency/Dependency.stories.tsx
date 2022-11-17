/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  factory,
  TestStepWidget,
  TestStepWidgetProps
} from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { Dependency as DependencyComponent } from './Dependency'

factory.registerStep(new DependencyComponent())

export default {
  title: 'Pipelines / Pipeline Steps / Dependency',
  // eslint-disable-next-line react/display-name
  component: TestStepWidget,
  argTypes: {
    type: { control: { disable: true } },
    stepViewType: {
      control: {
        type: 'inline-radio',
        options: Object.keys(StepViewType)
      }
    },
    onUpdate: { control: { disable: true } },
    initialValues: {
      control: {
        type: 'object'
      }
    }
  }
} as Meta

export const Dependency: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}

Dependency.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.Dependency,
    description: 'Description',
    spec: {
      connectorRef: 'account.connectorRef',
      image: 'image',
      privileged: false,
      envVariables: {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      },
      entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
      args: ['arg1', 'arg2', 'arg3'],
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: 'always',
      resources: {
        limits: {
          memory: '128Mi',
          cpu: '0.2'
        }
      }
    }
  },
  type: StepType.Dependency,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.Dependency,
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      image: RUNTIME_INPUT_VALUE,
      privileged: RUNTIME_INPUT_VALUE,
      envVariables: RUNTIME_INPUT_VALUE,
      entrypoint: RUNTIME_INPUT_VALUE,
      args: RUNTIME_INPUT_VALUE,
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  allValues: {
    type: StepType.Dependency,
    name: 'Test A',
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      image: RUNTIME_INPUT_VALUE,
      privileged: RUNTIME_INPUT_VALUE,
      envVariables: RUNTIME_INPUT_VALUE,
      entrypoint: RUNTIME_INPUT_VALUE,
      args: RUNTIME_INPUT_VALUE,
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // pull: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.name',
          localName: 'step.dependency.name'
        }
      },
      'step-description': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.description',
          localName: 'step.dependency.description'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.connectorRef',
          localName: 'step.dependency.spec.connectorRef'
        }
      },
      'step-image': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.image',
          localName: 'step.dependency.spec.image'
        }
      },
      'step-privileged': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.privileged',
          localName: 'step.dependency.spec.privileged'
        }
      },
      'step-envVariables': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.envVariables',
          localName: 'step.dependency.spec.envVariables'
        }
      },
      'step-entrypoint': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.entrypoint',
          localName: 'step.dependency.spec.entrypoint'
        }
      },
      'step-args': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.args',
          localName: 'step.dependency.spec.args'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.pull',
      //     localName: 'step.dependency.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.resources.limits.memory',
          localName: 'step.dependency.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.resources.limits.cpu',
          localName: 'step.dependency.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.Dependency,
      identifier: 'dependency',
      name: 'step-name',
      description: 'step-description',
      spec: {
        connectorRef: 'step-connectorRef',
        image: 'step-image',
        privileged: 'step-privileged',
        envVariables: 'step-envVariables',
        entrypoint: 'step-entrypoint',
        args: 'step-args',
        // TODO: Right now we do not support Image Pull Policy but will do in the future
        // pull: 'step-pull',
        resources: {
          limits: {
            memory: 'step-limitMemory',
            cpu: 'step-limitCPU'
          }
        }
      }
    }
  }
}
