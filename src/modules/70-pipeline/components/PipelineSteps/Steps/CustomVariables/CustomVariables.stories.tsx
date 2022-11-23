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
import { CustomVariables } from './CustomVariables'

factory.registerStep(new CustomVariables())

export default {
  title: 'Pipelines / Pipeline Steps / Custom Variables Step',
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

export const CustomVariablesStep: Story<Omit<StepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}

CustomVariablesStep.args = {
  initialValues: { identifier: 'Test_A', type: StepType.CustomVariable, canAddVariable: true },
  type: StepType.CustomVariable,
  stepViewType: StepViewType.Edit,
  path: '',
  template: {
    identifier: 'Test_A',
    type: StepType.CustomVariable,
    spec: {
      url: RUNTIME_INPUT_VALUE,
      method: RUNTIME_INPUT_VALUE,
      requestBody: RUNTIME_INPUT_VALUE,
      timeout: RUNTIME_INPUT_VALUE
    }
  },
  allValues: {
    type: StepType.CustomVariable,
    name: 'Test A',
    identifier: 'Test_A',
    spec: { url: RUNTIME_INPUT_VALUE, method: RUNTIME_INPUT_VALUE }
  }
}
