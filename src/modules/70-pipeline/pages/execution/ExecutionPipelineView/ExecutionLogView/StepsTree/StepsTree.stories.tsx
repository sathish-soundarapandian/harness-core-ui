/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import styled from '@emotion/styled'

import { TestWrapper } from '@common/utils/testUtils'
import type { StepsTreeProps } from './StepsTree';
import { StepsTree } from './StepsTree'

import data from './__tests__/data.json'

const Wrapper = styled.div`
  border: 1px solid #eee;
  width: 290px;
  padding: 40px;
  overflow: hidden;
`

export default {
  title: 'Pipelines / Execution / StepsTree',
  component: StepsTree
} as Meta

export const Basic: Story<StepsTreeProps> = args => {
  const [selectedStepId, setSelectedStepId] = React.useState(args.selectedStepId)

  React.useEffect(() => {
    setSelectedStepId(args.selectedStepId)
  }, [args.selectedStepId])

  return (
    <TestWrapper>
      <Wrapper>
        <StepsTree {...args} selectedStepId={selectedStepId} onStepSelect={setSelectedStepId} />
      </Wrapper>
    </TestWrapper>
  )
}

Basic.args = {
  nodes: data as any,
  isRoot: true
}
