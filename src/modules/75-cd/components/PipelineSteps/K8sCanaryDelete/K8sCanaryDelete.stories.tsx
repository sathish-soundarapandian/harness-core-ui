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
import type { StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { K8sCanaryDeleteStep } from './K8sCanaryDeleteStep'
factory.registerStep(new K8sCanaryDeleteStep())

export default {
  title: 'Pipelines / Pipeline Steps / K8sCanaryDeleteStep',
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

export const K8sCanaryDelete: Story<Omit<StepWidgetProps, 'factory'>> = args => {
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
K8sCanaryDelete.args = {
  initialValues: { identifier: 'Test_A', type: StepType.K8sCanaryDelete },
  type: StepType.K8sCanaryDelete,
  stepViewType: StepViewType.InputVariable,
  path: '',
  template: {
    identifier: 'Test_A',
    type: StepType.K8sCanaryDelete,
    spec: { timeout: RUNTIME_INPUT_VALUE }
  },
  allValues: {
    type: StepType.K8sCanaryDelete,
    name: 'Test A',
    identifier: 'Test_A',
    spec: { timeout: RUNTIME_INPUT_VALUE }
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.k8sCanaryDelete.name',
          localName: 'step.k8sCanaryDelete.name'
        }
      },

      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.k8sCanaryDelete.timeout',
          localName: 'step.k8sCanaryDelete.timeout'
        }
      }
    },
    variablesData: {
      name: 'step-name',
      identifier: 'k8sCanaryDelete',
      type: 'K8sCanaryDelete',
      timeout: 'step-timeout'
    }
  }
}
