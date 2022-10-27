/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { createEvent, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateNode from '../CreateNode/CreateNode'
import CreateNodeStage from '../CreateNode/CreateNodeStage'
import CreateNodeStep from '../CreateNode/CreateNodeStep'
import EndNodeStage from '../EndNode/EndNodeStage'
import EndNodeStep from '../EndNode/EndNodeStep'

const callback = jest.fn()
const genericProps = { identifier: 'identifier', name: 'create-node', className: 'sampleClass', id: 'id' }

const eventProps = {
  onMouseOver: callback,
  onMouseLeave: callback,
  onDrop: callback,
  onClick: callback,
  fireEvent: callback
}

const eventData = {
  dataTransfer: {
    setData: jest.fn(),
    dropEffect: '',
    getData: () => '1'
  }
}

const dragEventsAssertions = (nodeElement: Element): void => {
  fireEvent.mouseEnter(nodeElement)
  fireEvent.mouseLeave(nodeElement)
  fireEvent.click(nodeElement)
  fireEvent.dragOver(nodeElement)
  const dropEvent = Object.assign(createEvent.drop(nodeElement), eventData)
  fireEvent(nodeElement, dropEvent)
  fireEvent.dragLeave(nodeElement)
}

describe('Rendering nodes', () => {
  test('should render create Node', () => {
    const { container } = render(
      <TestWrapper>
        <CreateNode {...genericProps} />
      </TestWrapper>
    )
    expect(container.getElementsByClassName('sampleClass')[0]).toBeInTheDocument()
    expect(container.querySelector('[data-name="node-name"]')).toBeInTheDocument()
  })

  test('should render create Stage Node', () => {
    const props = { ...eventProps, ...genericProps }
    const { container } = render(
      <TestWrapper>
        <CreateNodeStage {...props} />
      </TestWrapper>
    )
    expect(container.getElementsByClassName('sampleClass')[0]).toBeInTheDocument()
    expect(container.querySelector('[data-name="node-name"]')).toBeInTheDocument()

    const nodeElement = container.querySelector('[data-testid="create-node-stage"]')!
    dragEventsAssertions(nodeElement)
  })

  test('should render create Step Node', () => {
    const props = { ...eventProps, ...genericProps }
    const { container } = render(
      <TestWrapper>
        <CreateNodeStep {...props} />
      </TestWrapper>
    )
    expect(container.getElementsByClassName('sampleClass')[0]).toBeInTheDocument()
    expect(container.querySelector('[data-name="node-name"]')).toBeInTheDocument()
    const nodeElement = container.querySelector('[data-testid="create-node-step"]')!
    dragEventsAssertions(nodeElement)
  })

  test('should render End Stage Node', () => {
    const { container } = render(
      <TestWrapper>
        <EndNodeStage {...genericProps} />
      </TestWrapper>
    )
    expect(container.getElementsByClassName('sampleClass')[0]).toBeInTheDocument()
    expect(container.querySelector('#id')).toBeInTheDocument()
  })
  test('should render End Step Node', () => {
    const { container } = render(
      <TestWrapper>
        <EndNodeStep {...genericProps} />
      </TestWrapper>
    )
    expect(container.getElementsByClassName('sampleClass')[0]).toBeInTheDocument()
    expect(container.querySelector('#id')).toBeInTheDocument()
  })
})
