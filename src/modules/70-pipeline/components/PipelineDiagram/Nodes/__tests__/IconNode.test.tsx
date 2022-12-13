/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { createEvent, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { IconNode } from '../IconNode/IconNode'
import { IconNodeData } from './mocks/mock'

const callback = jest.fn()
const genericProps = { identifier: 'identifier', name: 'node-name', className: 'sampleClass', id: 'id' }

const eventProps = {
  onMouseOver: callback,
  onMouseLeave: callback,
  onDrop: callback,
  onClick: callback,
  fireEvent: callback
}

const nodeProps = {
  allowAdd: true,
  getNode: jest.fn(() => (<></>) as any),
  matrixNodeName: 'name',
  isSelected: true,
  readonly: false,
  icon: 'barrier-open',
  type: 'Barrier',
  defaultSelected: false,
  isParallelNode: true,
  isFirstParallelNode: true,
  prevNodeIdentifier: 'diamondStep',
  parentIdentifier: 'parentIdentifier',
  selectedNodeId: '',
  prevNode: IconNodeData,
  nextNode: IconNodeData,
  data: IconNodeData.data
}

const eventData = {
  dataTransfer: {
    setData: jest.fn(),
    dropEffect: '',
    getData: () => '1'
  }
}

const dragEventsAssertions = (nodeElement: Element, removeNode: Element): void => {
  fireEvent.mouseEnter(nodeElement)
  fireEvent.mouseLeave(nodeElement)
  fireEvent.click(nodeElement)
  //   fireEvent.dragOver(nodeElement)
  const dropEvent = Object.assign(createEvent.drop(nodeElement), eventData)
  fireEvent(nodeElement, dropEvent)
  //   fireEvent.dragLeave(nodeElement)
  fireEvent.mouseDown(removeNode)
  fireEvent.mouseLeave(removeNode)
}

describe('Rendering Icon nodes', () => {
  test('should render Icon Node', () => {
    const props = { ...nodeProps, ...eventProps, ...genericProps }
    const { container } = render(
      <TestWrapper>
        <IconNode {...props} />
      </TestWrapper>
    )
    expect(container.querySelector('#id')).toBeInTheDocument()

    expect(container.getElementsByClassName('icon-node')[0]).toBeInTheDocument()

    const nodeElement = container.querySelector('[data-testid="icon-node"]')!
    const removeNode = container.querySelector('[data-icon="cross"]')!
    dragEventsAssertions(nodeElement, removeNode)

    fireEvent.mouseDown(container.getElementsByClassName('icon-node')[0]!)
  })
})
