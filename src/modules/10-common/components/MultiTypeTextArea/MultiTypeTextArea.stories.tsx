/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { TestWrapper } from '@common/utils/testUtils'

import type { MultiTypeTextAreaProps } from './MultiTypeTextArea';
import { MultiTypeTextArea } from './MultiTypeTextArea'

export default {
  title: 'Forms / MultiTypeTextArea',
  component: MultiTypeTextArea,
  argTypes: {
    expressions: { control: { type: 'array' } },
    name: { control: { type: 'text' } }
  }
} as Meta

export const Basic: Story<MultiTypeTextAreaProps> = args => {
  return (
    <TestWrapper>
      <MultiTypeTextArea enableConfigureOptions name={args.name} expressions={['abc', 'abc.xyz']} />
    </TestWrapper>
  )
}

Basic.args = {
  name: 'fieldName'
}
