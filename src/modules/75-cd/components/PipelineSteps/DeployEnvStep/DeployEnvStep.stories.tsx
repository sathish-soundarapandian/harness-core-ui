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
import { DeployEnvironmentStep } from './DeployEnvStep'
factory.registerStep(new DeployEnvironmentStep())

export default {
  title: 'Pipelines / Pipeline Steps / DeployEnvironmentStep',
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

export const DeployEnvironment: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [value, setValue] = React.useState({ ...(args.initialValues as any) })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} initialValues={value} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}
DeployEnvironment.args = {
  initialValues: {},
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  type: StepType.DeployEnvironment,
  stepViewType: StepViewType.Edit,
  path: '',
  template: {
    environmentRef: RUNTIME_INPUT_VALUE
  },
  allValues: {
    environmentRef: RUNTIME_INPUT_VALUE
  }
}
