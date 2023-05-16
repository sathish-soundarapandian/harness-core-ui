/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Story, Meta } from '@storybook/react'
import styled from '@emotion/styled'
import { TestWrapper } from '@common/utils/testUtils'

import type { CopyTextProps } from './CopyText';
import { CopyText } from './CopyText'

export default {
  title: 'Common / CopyText',
  component: CopyText,
  argTypes: {}
} as Meta

const Wrapper = styled.div`
  width: 300px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
`

export const Basic: Story<CopyTextProps> = args => (
  <TestWrapper>
    <Wrapper>
      <CopyText {...args} />
    </Wrapper>
  </TestWrapper>
)

Basic.args = {
  children: 'Hello World',
  textToCopy: 'Hello World!'
}
