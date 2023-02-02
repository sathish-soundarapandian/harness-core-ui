/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateCommandLineCreation from '../DelegateCommandLineCreation'
import KubernetesManfiestTroubleShooting from '../components/troubleShooting/KubernetesManfiestTroubleShooting'

let feedBackSaved = false
jest.mock('@delegates/constants', () => {
  return { ...jest.requireActual('@delegates/constants'), DELEGATE_COMMAND_LINE_TIME_OUT: 0 }
})
jest.mock('services/cd-ng', () => ({
  useGenerateTerraformModule: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn(),
      data: 'test',
      loading: false,
      error: null,
      refetch: jest.fn().mockImplementation(() => {
        return 'test'
      })
    }
  })
}))
jest.mock('services/portal', () => ({
  useGetInstallationCommand: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn(),
      data: { resource: { command: 'test' } },
      loading: false,
      error: null,
      refetch: jest.fn().mockImplementation(() => {
        return {
          data: { resource: { command: 'test' } },
          loading: false,
          error: null
        }
      })
    }
  }),
  useAddFeedback: jest.fn().mockImplementation(() => {
    return {
      data: null,
      error: null,
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        feedBackSaved = true
        return Promise.resolve({
          status: 'SUCCESS',
          data: { resource: true }
        })
      })
    }
  }),
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(() => {
    return { data: { resource: { numberOfConnectedDelegates: 0 } }, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Delegate Command line creation failure', () => {
  test('troubleShoot click for helm', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateCommandLineCreation onDone={() => noop} />
      </TestWrapper>
    )
    expect(getByText('delegates.commandLineCreation.firstCommandHeadingHelm')).toBeDefined()
    expect(getByText('test')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('verify'))
    })

    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.retryConnections')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot'))
    })

    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.helmTroubleShooting1')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('yes')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('yes'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.delegateFixed')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('save')).toBeDefined()
    })
    expect(container).toMatchSnapshot()
  })
  test('troubleShoot click for terraform', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateCommandLineCreation onDone={() => noop} />
      </TestWrapper>
    )

    expect(getByText('delegates.commandLineCreation.firstCommandHeadingHelm')).toBeDefined()
    expect(getByText('test')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('delegates.commandLineCreation.terraForm'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.firstCommandHeadingTerraform')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('verify'))
    })

    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.retryConnections')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot'))
    })

    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.terraformTroubleShooting1')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('no')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('no'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.delegateNotFixed')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('save')).toBeDefined()
    })
    expect(container).toMatchSnapshot()
  })
  test('troubleShoot click for docker', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateCommandLineCreation onDone={() => noop} />
      </TestWrapper>
    )

    expect(getByText('delegates.commandLineCreation.firstCommandHeadingHelm')).toBeDefined()
    expect(getByText('test')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('delegate.cardData.docker.name'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.firstCommandHeadingDocker')).toBeDefined()
    })
    expect(getByText('delegates.commandLineCreation.firstCommandHeadingDocker')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('verify'))
    })

    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.retryConnections')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot'))
    })

    await waitFor(() => {
      expect(getByText('delegates.delegateNotInstalled.statusOfCluster')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('yes')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('yes'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.delegateFixed')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('save')).toBeDefined()
    })
    expect(container).toMatchSnapshot()
  })

  test('troubleShoot click for Kubernetes Manifest', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateCommandLineCreation onDone={() => noop} />
      </TestWrapper>
    )

    expect(getByText('delegates.commandLineCreation.firstCommandHeadingHelm')).toBeDefined()
    expect(getByText('test')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('delegates.commandLineCreation.kubernetesManifest'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.firstComandHeadingKubernetes')).toBeDefined()
    })
    expect(getByText('verify').closest('button')).toBeDisabled()
    const textInput = container.querySelector('.bp3-input')

    await act(async () => {
      fireEvent.change(textInput!, { target: { value: 'mock_value' } })
    })

    expect(container).toMatchSnapshot()
  })
  test('troubleShoot click for Kubernetes Manifest snapshot', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <KubernetesManfiestTroubleShooting />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(getByText('delegates.delegateNotInstalled.statusOfCluster')).toBeDefined()
    })
    expect(container).toMatchSnapshot()
  })

  test('feedback save ', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateCommandLineCreation onDone={() => noop} />
      </TestWrapper>
    )

    expect(getByText('delegates.commandLineCreation.firstCommandHeadingHelm')).toBeDefined()
    expect(getByText('test')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('delegate.cardData.docker.name'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.firstCommandHeadingDocker')).toBeDefined()
    })
    expect(getByText('delegates.commandLineCreation.firstCommandHeadingDocker')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('verify'))
    })

    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.retryConnections')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('delegates.commandLineCreation.retryConnections'))
    })
    await act(async () => {
      fireEvent.click(getByText('delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot'))
    })

    await waitFor(() => {
      expect(getByText('delegates.delegateNotInstalled.statusOfCluster')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('yes')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('yes'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.delegateFixed')).toBeDefined()
    })
    await waitFor(() => {
      expect(getByText('save')).toBeDefined()
    })
    await waitFor(() => {
      expect(container.querySelector('textarea')).toBeDefined()
    })
    await act(async () => {
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'new desc' } })
    })
    await waitFor(() => {
      expect(container.querySelector('button[aria-label="common.clear"]')).not.toBeDisabled()
    })
    await act(async () => {
      fireEvent.click(getByText('common.clear'))
    })
    await waitFor(() => {
      expect(container.querySelector('textarea')?.value).toEqual('')
    })
    await act(async () => {
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'new desc' } })
    })
    await waitFor(() => {
      expect(container.querySelector('button[aria-label="save"]')).not.toBeDisabled()
    })
    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => {
      expect(feedBackSaved).toBeTruthy()
    })
    await act(async () => {
      fireEvent.click(getByText('done'))
    })
  })
})
