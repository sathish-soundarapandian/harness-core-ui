/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  factory,
  TestStepWidget,
  TestStepWidgetProps
} from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { BackgroundStep as BackgroundStepComponent } from './BackgroundStep'

factory.registerStep(new BackgroundStepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / BackgroundStep',
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

export const BackgroundStep: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
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

BackgroundStep.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.Run,
    description: 'Description',
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      image: 'image',
      command: 'command',
      privileged: false,
      reports: {
        type: 'JUnit',
        spec: {
          paths: ['path1.xml', 'path2.xml', 'path3.xml', 'path4.xml', 'path5.xml']
        }
      },
      envVariables: {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      },
      outputVariables: [{ name: 'variable1' }, { name: 'variable2' }, { name: 'variable3' }, { name: 'variable4' }],
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
  type: StepType.Run,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.Run,
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      image: RUNTIME_INPUT_VALUE,
      command: RUNTIME_INPUT_VALUE,
      privileged: RUNTIME_INPUT_VALUE,
      reports: {
        spec: {
          paths: RUNTIME_INPUT_VALUE
        }
      },
      envVariables: RUNTIME_INPUT_VALUE,
      outputVariables: RUNTIME_INPUT_VALUE,
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
    type: StepType.Run,
    name: 'Test A',
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      image: RUNTIME_INPUT_VALUE,
      command: RUNTIME_INPUT_VALUE,
      privileged: RUNTIME_INPUT_VALUE,
      reports: {
        spec: {
          paths: RUNTIME_INPUT_VALUE
        }
      },
      envVariables: RUNTIME_INPUT_VALUE,
      outputVariables: RUNTIME_INPUT_VALUE,
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
          fqn: 'pipeline.stages.qaStage.execution.steps.run.name',
          localName: 'step.run.name'
        }
      },
      'step-description': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.description',
          localName: 'step.run.description'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.timeout',
          localName: 'step.run.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.connectorRef',
          localName: 'step.run.spec.connectorRef'
        }
      },
      'step-image': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.image',
          localName: 'step.run.spec.image'
        }
      },
      'step-command': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.command',
          localName: 'step.run.spec.command'
        }
      },
      'step-privileged': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.privileged',
          localName: 'step.run.spec.privileged'
        }
      },
      'step-reportPaths': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.reports.spec.paths',
          localName: 'step.run.spec.reports.spec.paths'
        }
      },
      'step-envVariables': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.spec.run.envVariables',
          localName: 'step.run.spec.envVariables'
        }
      },
      'step-outputVariables': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.outputVariables',
          localName: 'step.run.spec.outputVariables'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.pull',
      //     localName: 'step.run.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.resources.limits.memory',
          localName: 'step.run.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.resources.limits.cpu',
          localName: 'step.run.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.Run,
      identifier: 'run',
      name: 'step-name',
      description: 'step-description',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        image: 'step-image',
        command: 'step-command',
        privileged: 'step-privileged',
        reports: {
          spec: {
            paths: 'step-reportPaths'
          }
        },
        envVariables: 'step-envVariables',
        outputVariables: 'step-outputVariables',
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
