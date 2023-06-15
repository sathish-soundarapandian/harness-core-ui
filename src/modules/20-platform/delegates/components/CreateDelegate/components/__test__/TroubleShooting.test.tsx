/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DelegateTypes } from '@delegates/constants'
import TroubleShooting from '../DelegateInstallationError/TroubleShooting'

describe('Create Common Problems Tab', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('show event error btn', () => {
    const { container } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    const noBtn = container.querySelector('.noBtn')
    fireEvent.click(noBtn!)
    expect(container).toMatchSnapshot()
  })

  test('Show docker specific troubleshooting guide', () => {
    const { getByText, getByRole } = render(
      <TestWrapper>
        <TroubleShooting delegateType={DelegateTypes.DOCKER} />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.verifyStatus2')).toBeInTheDocument()
    const yesBtn = getByRole('button', { name: 'yes' })
    act(() => {
      fireEvent.click(yesBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.verifyLogs1')).toBeInTheDocument()
  })

  test('Click back button after verifying running status of Docker Container', () => {
    const { getByText, getByRole } = render(
      <TestWrapper>
        <TroubleShooting delegateType={DelegateTypes.DOCKER} />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.verifyStatus2')).toBeInTheDocument()
    const yesBtn = getByRole('button', { name: 'yes' })
    act(() => {
      fireEvent.click(yesBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.verifyLogs1')).toBeInTheDocument()
    const backBtn = getByRole('button', { name: 'back' })
    act(() => {
      fireEvent.click(backBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.verifyStatus2')).toBeInTheDocument()
  })

  test('Verify troubleshoot guide when docker container is not running', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TroubleShooting delegateType={DelegateTypes.DOCKER} />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.verifyStatus2')).toBeInTheDocument()
    const noBtn = container.querySelector('.noBtn')
    act(() => {
      fireEvent.click(noBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.heartbeatFailed')).toBeInTheDocument()
  })

  test('Click on restart button when docker container is not running', () => {
    const { container, getByText, getByRole } = render(
      <TestWrapper>
        <TroubleShooting delegateType={DelegateTypes.DOCKER} />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.verifyStatus2')).toBeInTheDocument()
    const noBtn = container.querySelector('.noBtn')
    act(() => {
      fireEvent.click(noBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.heartbeatFailed')).toBeInTheDocument()
    const restart = getByRole('button', { name: 'restart' })
    act(() => {
      fireEvent.click(restart!)
    })
    expect(getByText('delegates.delegateNotInstalled.containerRunning')).toBeInTheDocument()
  })

  test('Render K8s troubleshoot guide when delegate type is not passed', () => {
    const { getByText, getByRole } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.podCommand')).toBeInTheDocument()
    const yesBtn = getByRole('button', { name: 'yes' })
    act(() => {
      fireEvent.click(yesBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.harnessErrorValidation')).toBeInTheDocument()
  })
  test('Render K8s troubleshoot guide and verify guide when pod does not come up ', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.podCommand')).toBeInTheDocument()
    const noBtn = container.querySelector('.noBtn')
    act(() => {
      fireEvent.click(noBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.eventErrorBlock')).toBeInTheDocument()
  })
  test('Render K8s troubleshoot guide and verify cluster permission steps when pod does not come up ', () => {
    const { container, getByText, getByRole } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.podCommand')).toBeInTheDocument()
    const noBtn = container.querySelector('.noBtn')
    act(() => {
      fireEvent.click(noBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.eventErrorBlock')).toBeInTheDocument()
    const verifyClusterPermissionBtn = getByRole('button', {
      name: 'delegates.delegateNotInstalled.permissionError warning-sign'
    })
    act(() => {
      fireEvent.click(verifyClusterPermissionBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.checkClusterPermission')).toBeInTheDocument()
  })
  test('Render K8s troubleshoot guide and verify subsequent steps when pod does not come up ', () => {
    const { container, getByText, getByRole } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.podCommand')).toBeInTheDocument()
    const noBtn = container.querySelector('.noBtn')
    act(() => {
      fireEvent.click(noBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.eventErrorBlock')).toBeInTheDocument()
    const verifyClusterPermissionBtn = getByRole('button', {
      name: 'delegates.delegateNotInstalled.permissionError warning-sign'
    })
    act(() => {
      fireEvent.click(verifyClusterPermissionBtn!)
    })
    expect(getByText('delegates.delegateNotInstalled.checkClusterPermission')).toBeInTheDocument()

    const backBtn = getByRole('button', { name: 'back' })

    act(() => {
      fireEvent.click(backBtn!)
    })

    act(() => {
      fireEvent.click(noBtn!)
    })

    const containerFailureBtn = getByRole('button', {
      name: 'delegates.delegateNotInstalled.crashloopError warning-sign'
    })
    act(() => {
      fireEvent.click(containerFailureBtn!)
    })

    expect(getByText('delegates.delegateNotInstalled.eventErrorBlock')).toBeInTheDocument()
  })
})
