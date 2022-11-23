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
import { RestoreCacheGCSStep as RestoreCacheGCSStepComponent } from './RestoreCacheGCSStep'

factory.registerStep(new RestoreCacheGCSStepComponent())

export default {
  title: 'Pipelines / Pipeline Steps / RestoreCacheGCSStep',
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

export const RestoreCacheGCSStep: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
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

RestoreCacheGCSStep.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'Test A',
    type: StepType.RestoreCacheGCS,
    timeout: '10s',
    spec: {
      connectorRef: 'account.connectorRef',
      bucket: 'Bucket',
      key: 'Key',
      archiveFormat: 'Tar',
      failIfKeyNotFound: true,
      resources: {
        limits: {
          memory: '128Mi',
          cpu: '0.2'
        }
      }
    }
  },
  type: StepType.RestoreCacheGCS,
  stepViewType: StepViewType.Edit,
  path: '',
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  template: {
    type: StepType.RestoreCacheGCS,
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      bucket: RUNTIME_INPUT_VALUE,
      key: RUNTIME_INPUT_VALUE,
      archiveFormat: RUNTIME_INPUT_VALUE,
      failIfKeyNotFound: RUNTIME_INPUT_VALUE,
      resources: {
        limits: {
          cpu: RUNTIME_INPUT_VALUE,
          memory: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  allValues: {
    type: StepType.RestoreCacheGCS,
    name: 'Test A',
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      bucket: RUNTIME_INPUT_VALUE,
      key: RUNTIME_INPUT_VALUE,
      archiveFormat: RUNTIME_INPUT_VALUE,
      failIfKeyNotFound: RUNTIME_INPUT_VALUE,
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
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.name',
          localName: 'step.restoreCacheGCS.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.timeout',
          localName: 'step.restoreCacheGCS.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.connectorRef',
          localName: 'step.restoreCacheGCS.spec.connectorRef'
        }
      },
      'step-bucket': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.bucket',
          localName: 'step.restoreCacheGCS.spec.bucket'
        }
      },
      'step-key': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.key',
          localName: 'step.restoreCacheGCS.spec.key'
        }
      },
      'step-archiveFormat': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.archiveFormat',
          localName: 'step.restoreCacheGCS.spec.archiveFormat'
        }
      },
      'step-failIfKeyNotFound': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.failIfKeyNotFound',
          localName: 'step.restoreCacheGCS.spec.failIfKeyNotFound'
        }
      },
      // TODO: Right now we do not support Image Pull Policy but will do in the future
      // 'step-pull': {
      //   yamlProperties: {
      //     fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.pull',
      //     localName: 'step.restoreCacheGCS.spec.pull'
      //   }
      // },
      'step-limitMemory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.resources.limits.memory',
          localName: 'step.restoreCacheGCS.spec.resources.limits.memory'
        }
      },
      'step-limitCPU': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.resources.limits.cpu',
          localName: 'step.restoreCacheGCS.resources.spec.limits.cpu'
        }
      }
    },
    variablesData: {
      type: StepType.RestoreCacheGCS,
      identifier: 'restoreCacheGCS',
      name: 'step-name',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        bucket: 'step-bucket',
        key: 'step-key',
        archiveFormat: 'step-archiveFormat',
        failIfKeyNotFound: 'step-failIfKeyNotFound',
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
