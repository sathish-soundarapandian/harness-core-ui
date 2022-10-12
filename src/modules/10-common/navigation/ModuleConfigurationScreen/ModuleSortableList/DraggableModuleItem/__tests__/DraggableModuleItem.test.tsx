/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import DraggableModuleItemWithCondition from '../DraggableModuleItem'

jest.mock('react-beautiful-dnd', () => {
  return {
    // eslint-disable-next-line
    // @ts-ignore
    Draggable: props => props.children({ draggableProps: {}, dragHandleProps: {} })
  }
})

describe('Draggable module item tests', () => {
  test('render when feature flag is off', () => {
    const { queryByText } = render(
      <TestWrapper>
        <DraggableModuleItemWithCondition index={0} module={ModuleName.CD} />
      </TestWrapper>
    )
    expect(queryByText('common.purpose.cd.continuous')).toBeNull()
  })

  test('render when feature flag is off', () => {
    const { queryByText, container } = render(
      <TestWrapper defaultFeatureFlagValues={{ CDNG_ENABLED: true }}>
        <DraggableModuleItemWithCondition index={0} module={ModuleName.CD} />
      </TestWrapper>
    )
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
