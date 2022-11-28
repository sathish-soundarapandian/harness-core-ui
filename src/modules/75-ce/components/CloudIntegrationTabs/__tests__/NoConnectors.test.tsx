/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import NoConnectors from '../NoConnectors'

const props = {
  handleConnectorCreation: jest.fn(),
  k8sSelected: false,
  setK8sSelected: jest.fn(),
  openAdvancedK8sModal: jest.fn(),
  openQuicK8sCreateModal: jest.fn()
}

describe('Test cases for No Connectors screen', () => {
  test('should be able to render the screen', () => {
    const { container } = render(
      <TestWrapper>
        <NoConnectors {...props} />
      </TestWrapper>
    )
    expect(getByText(container, 'kubernetesText')).toBeInTheDocument()
  })

  test('should be able to open K8s created modal', () => {
    const { container } = render(
      <TestWrapper>
        <NoConnectors {...props} k8sSelected={true} />
      </TestWrapper>
    )
    expect(getByText(container, 'kubernetesText')).toBeInTheDocument()
    expect(getByText(document.body, 'ce.k8sQuickCreate.quickCreate')).toBeInTheDocument()
    const crossButton = document.body.getElementsByClassName('ModalDialog--closeButton')
    act(() => {
      fireEvent.click(crossButton[0]!)
    })
    expect(props.setK8sSelected).toBeCalledWith(false)
  })

  test('should be able to open K8s created modal and open quick create', () => {
    const { container } = render(
      <TestWrapper>
        <NoConnectors {...props} k8sSelected={true} />
      </TestWrapper>
    )
    expect(getByText(container, 'kubernetesText')).toBeInTheDocument()
    expect(getByText(document.body, 'ce.k8sQuickCreate.quickCreate')).toBeInTheDocument()

    const continueBtn = getByText(document.body, 'continue')
    act(() => {
      fireEvent.click(continueBtn)
    })
    expect(props.openQuicK8sCreateModal).toBeCalled()
  })
})
