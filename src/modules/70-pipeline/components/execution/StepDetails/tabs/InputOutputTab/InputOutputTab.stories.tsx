/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import type { Meta, Story } from '@storybook/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { InputOutputTabProps} from './InputOutputTab';
import { InputOutputTab } from './InputOutputTab'
import data from './__tests__/io-1.json'

export default {
  title: 'Pipelines / Execution / InputOutputTab ',
  component: InputOutputTab
} as Meta

type StoryProps = Pick<InputOutputTabProps, 'mode'> & {
  inputData: any
  outputData: any
}

export const Basic: Story<StoryProps> = args => (
  <TestWrapper>
    <InputOutputTab data={args.mode === 'input' ? args.inputData : args.outputData} mode={args.mode} />
  </TestWrapper>
)

Basic.args = {
  mode: 'input',
  inputData: [data.stepParameters],
  outputData: data.outcomes
}
