/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card } from '@harness/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { K8sDeleteStep } from './K8sDeleteStep'
factory.registerStep(new K8sDeleteStep())

export default {
  title: 'Pipelines / Pipeline Steps / K8sDeleteStep',
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

export const K8sDelete: Story<Omit<StepWidgetProps, 'factory'>> = args => {
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
K8sDelete.args = {
  initialValues: { identifier: 'Test_A', type: StepType.K8sDelete },
  type: StepType.K8sDelete,
  stepViewType: StepViewType.Edit,
  path: '',
  template: {
    identifier: 'Test_A',
    type: StepType.K8sDelete,
    timeout: '10m',
    spec: {
      deleteResourcesBy: 'ManifestPath',
      spec: {
        manifestPaths: ['testA', 'testB']
      }
    }
  },
  allValues: {
    identifier: 'Test_A',
    type: StepType.K8sDelete,
    timeout: '10m',
    spec: {
      deleteResourcesBy: 'ManifestPath',
      spec: {
        manifestPaths: ['testA', 'testB']
      }
    }
  }
}
