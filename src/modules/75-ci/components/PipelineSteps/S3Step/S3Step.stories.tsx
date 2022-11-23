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
import { S3Step as S3StepComponent } from './S3Step'

factory.registerStep(new S3StepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / S3Step',
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

export const S3Step: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
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

S3Step.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.S3,
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      region: 'Region',
      bucket: 'Bucket',
      sourcePath: 'Source Path',
      endpoint: 'Endpoint',
      target: 'Target',
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
  type: StepType.S3,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.S3,
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      region: RUNTIME_INPUT_VALUE,
      bucket: RUNTIME_INPUT_VALUE,
      sourcePath: RUNTIME_INPUT_VALUE,
      endpoint: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  allValues: {
    type: StepType.S3,
    name: 'Test A',
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      region: RUNTIME_INPUT_VALUE,
      bucket: RUNTIME_INPUT_VALUE,
      sourcePath: RUNTIME_INPUT_VALUE,
      endpoint: RUNTIME_INPUT_VALUE,
      target: RUNTIME_INPUT_VALUE,
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
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.name',
          localName: 'step.s3.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.timeout',
          localName: 'step.s3.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.connectorRef',
          localName: 'step.s3.spec.connectorRef'
        }
      },
      'step-region': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.region',
          localName: 'step.s3.spec.region'
        }
      },
      'step-bucket': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.bucket',
          localName: 'step.s3.spec.bucket'
        }
      },
      'step-sourcePath': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.sourcePath',
          localName: 'step.s3.spec.sourcePath'
        }
      },
      'step-endpoint': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.endpoint',
          localName: 'step.s3.spec.endpoint'
        }
      },
      'step-target': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.target',
          localName: 'step.s3.spec.target'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.pull',
      //     localName: 'step.s3.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.resources.limits.memory',
          localName: 'step.s3.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.resources.limits.cpu',
          localName: 'step.s3.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.S3,
      identifier: 's3',
      name: 'step-name',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        region: 'step-region',
        bucket: 'step-bucket',
        sourcePath: 'step-sourcePath',
        endpoint: 'step-endpoint',
        target: 'step-target',
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
