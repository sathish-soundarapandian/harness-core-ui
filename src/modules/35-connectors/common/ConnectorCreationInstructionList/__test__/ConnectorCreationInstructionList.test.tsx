/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ConnectorInstructionList from '../ConnectorCreationInstructionList'

const instructionList = [
  {
    type: 'button',
    text: 'connectors.ceAws.cur.launchTemplate',
    icon: 'main-share',
    url: 'https://console.aws.amazon.com/billing/home?#/reports',
    listClassName: 'btnInstruction'
  },
  {
    type: 'text',
    text: 'connectors.ceAws.cur.instructions.i1'
  },
  {
    type: 'hybrid',
    renderer: function instructionRenderer() {
      return <div />
    }
  },
  {
    type: 'text',
    text: 'connectors.ceAws.cur.instructions.i4'
  }
]

describe('Connect creation instruction list component', () => {
  test('List should render', () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorInstructionList instructionsList={instructionList} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Button list item should render', () => {
    window.open = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <ConnectorInstructionList instructionsList={instructionList} />
      </TestWrapper>
    )

    const launchBtn = getByText('connectors.ceAws.cur.launchTemplate')
    expect(launchBtn).toBeDefined()

    act(() => {
      fireEvent.click(launchBtn)
    })
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith('https://console.aws.amazon.com/billing/home?#/reports', '_blank')
  })
})
