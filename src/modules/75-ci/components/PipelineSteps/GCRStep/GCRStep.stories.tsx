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
import { GCRStep as GCRStepComponent } from './GCRStep'

factory.registerStep(new GCRStepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / GCRStep',
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

export const GCRStep: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
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

GCRStep.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.GCR,
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      host: 'Host',
      projectID: 'Project ID',
      imageName: 'Image Name',
      tags: ['tag1', 'tag2', 'tag3'],
      dockerfile: 'Dockerfile',
      context: 'Context',
      labels: {
        label1: 'value1',
        label2: 'value2',
        label3: 'value3'
      },
      buildArgs: {
        buildArg1: 'value1',
        buildArg2: 'value2',
        buildArg3: 'value3'
      },
      optimize: true,
      target: 'Target',
      remoteCacheImage: 'remote cache image',
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
  type: StepType.GCR,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.GCR,
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      host: RUNTIME_INPUT_VALUE,
      projectID: RUNTIME_INPUT_VALUE,
      imageName: RUNTIME_INPUT_VALUE,
      tags: RUNTIME_INPUT_VALUE,
      dockerfile: RUNTIME_INPUT_VALUE,
      context: RUNTIME_INPUT_VALUE,
      labels: RUNTIME_INPUT_VALUE,
      buildArgs: RUNTIME_INPUT_VALUE,
      optimize: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      remoteCacheImage: RUNTIME_INPUT_VALUE,
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
    type: StepType.GCR,
    name: 'Test A',
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      host: RUNTIME_INPUT_VALUE,
      projectID: RUNTIME_INPUT_VALUE,
      imageName: RUNTIME_INPUT_VALUE,
      tags: RUNTIME_INPUT_VALUE,
      dockerfile: RUNTIME_INPUT_VALUE,
      context: RUNTIME_INPUT_VALUE,
      labels: RUNTIME_INPUT_VALUE,
      buildArgs: RUNTIME_INPUT_VALUE,
      optimize: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      remoteCacheImage: RUNTIME_INPUT_VALUE,
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
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.name',
          localName: 'step.gcr.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.timeout',
          localName: 'step.gcr.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.connectorRef',
          localName: 'step.gcr.spec.connectorRef'
        }
      },
      'step-host': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.host',
          localName: 'step.gcr.spec.host'
        }
      },
      'step-projectID': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.projectID',
          localName: 'step.gcr.spec.projectID'
        }
      },
      'step-imageName': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.imageName',
          localName: 'step.gcr.spec.imageName'
        }
      },
      'step-tags': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.tags',
          localName: 'step.gcr.spec.tags'
        }
      },
      'step-dockerfile': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.dockerfile',
          localName: 'step.gcr.spec.dockerfile'
        }
      },
      'step-context': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.context',
          localName: 'step.gcr.spec.context'
        }
      },
      'step-labels': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.labels',
          localName: 'step.gcr.spec.labels'
        }
      },
      'step-buildArgs': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.buildArgs',
          localName: 'step.gcr.spec.buildArgs'
        }
      },
      'step-optimize': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.optimize',
          localName: 'step.gcr.spec.optimize'
        }
      },
      'step-target': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.target',
          localName: 'step.gcr.spec.target'
        }
      },
      'step-remoteCacheImage': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.remoteCacheImage',
          localName: 'step.gcr.spec.remoteCacheImage'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.pull',
      //     localName: 'step.gcr.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.resources.limits.memory',
          localName: 'step.gcr.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.gcr.spec.resources.limits.cpu',
          localName: 'step.gcr.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.GCR,
      identifier: 'gcr',
      name: 'step-name',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        host: 'step-host',
        projectID: 'step-projectID',
        imageName: 'step-imageName',
        tags: 'step-tags',
        dockerfile: 'step-dockerfile',
        context: 'step-context',
        labels: 'step-labels',
        buildArgs: 'step-buildArgs',
        optimize: 'step-optimize',
        target: 'step-target',
        remoteCacheImage: 'step-remoteCacheImage',
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
