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
import { JFrogArtifactoryStep as JFrogArtifactoryStepComponent } from './JFrogArtifactoryStep'

factory.registerStep(new JFrogArtifactoryStepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / JFrogArtifactoryStep',
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

export const JFrogArtifactoryStep: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
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

JFrogArtifactoryStep.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.JFrogArtifactory,
    description: 'Description',
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      target: 'Target',
      sourcePath: 'Source path',
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
  type: StepType.JFrogArtifactory,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.JFrogArtifactory,
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      sourcePath: RUNTIME_INPUT_VALUE,
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
    type: StepType.JFrogArtifactory,
    name: 'Test A',
    identifier: 'Test_A',
    description: RUNTIME_INPUT_VALUE,
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      sourcePath: RUNTIME_INPUT_VALUE,
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
      'step-target': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.target',
          localName: 'step.run.spec.target'
        }
      },
      'step-sourcePath': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.sourcePath',
          localName: 'step.run.spec.sourcePath'
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
      type: StepType.JFrogArtifactory,
      identifier: 'run',
      name: 'step-name',
      description: 'step-description',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        target: 'step-target',
        sourcePath: 'step-sourcePath',
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
