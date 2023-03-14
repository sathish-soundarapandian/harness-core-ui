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

jest.mock('@delegates/constants', () => {
  return { ...jest.requireActual('@delegates/constants'), DELEGATE_COMMAND_LINE_TIME_OUT: 3 }
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
  useGenerateKubernetesYaml: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn().mockImplementation(() => {
        return 'test'
      }),
      data: 'test',
      loading: false,
      error: null,
      refetch: jest.fn().mockImplementation(() => {
        return 'test'
      })
    }
  }),
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
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(() => {
    return { data: { resource: { numberOfConnectedDelegates: 1 } }, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Delegate Command line creation', () => {
  test('render UI Helm Kubernetes Helm', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateCommandLineCreation onDone={() => noop} />
      </TestWrapper>
    )

    expect(getByText('delegates.commandLineCreation.firstCommandHeadingHelm')).toBeDefined()

    expect(container).toMatchSnapshot()
    expect(getByText('test')).toBeDefined()
  })

  test('render UI Docker Delegate', async () => {
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
    expect(container).toMatchSnapshot()
  })
  test('render UI Helm Kubernetes Helm after Docker', async () => {
    const { getByText } = render(
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
      fireEvent.click(getByText('kubernetesText'))
    })
    await waitFor(() => {
      expect(getByText('common.HelmChartLabel')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('common.HelmChartLabel'))
    })

    expect(getByText('delegates.commandLineCreation.firstCommandHeadingHelm')).toBeDefined()
  })
  test('render UI Docker Kubernetes Manifest', async () => {
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
      expect(getByText('delegates.commandLineCreation.yamlBasicOptionText')).toBeDefined()
    })
    expect(container).toMatchSnapshot()
  })
  test('render UI Docker Kubernetes Terraform', async () => {
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

    expect(container).toMatchSnapshot()
  })
  test('verifyButton click', async () => {
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
      expect(getByText('common.delegateSuccess')).toBeDefined()
    })
    expect(container).toMatchSnapshot()
  })
})
