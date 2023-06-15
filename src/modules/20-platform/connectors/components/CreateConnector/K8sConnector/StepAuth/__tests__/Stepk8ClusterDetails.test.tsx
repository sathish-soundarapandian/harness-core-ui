/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { mockSecret } from '@connectors/components/CreateConnector/K8sConnector/__test__/k8Mocks'

import Stepk8ClusterDetails from '../Stepk8ClusterDetails'

const updateConnector = jest.fn()
const createConnector = jest.fn()

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  onConnectorCreated: noop,
  setIsEditMode: noop,
  hideModal: noop
}
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/cd-ng', () => ({
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('Stepk8ClusterDetails', () => {
  test('render ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          {...commonProps}
          name="credentials"
          isEditMode={false}
          connectorInfo={{ name: 'nameK8s', identifier: 'id', type: 'K8sCluster', spec: {} } as any}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(getByText('continue'))
    })
    await act(async () => {
      fireEvent.click(container.querySelector('input[value="ManualConfig"]')!)
    })
    expect(container).toMatchSnapshot()
    expect(getByText('validation.username')).toBeDefined()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'masterUrl',
        value: 'dummyMasterUrl'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'usernametextField',
        value: 'dummyusername'
      }
    ])
    expect(container).toMatchSnapshot()
  })
  test('render edit mode ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          {...commonProps}
          name="credentials"
          isEditMode={true}
          connectorInfo={
            {
              name: 'dummyname',
              identifier: 'dummyId',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'dummymasterUrl',
                    auth: {
                      type: 'UsernamePassword',
                      spec: { username: 'username', usernameRef: null, passwordRef: 'account.jkdhkjdhk' }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
  test('render edit mode  service token', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          {...commonProps}
          name="credentials"
          isEditMode={true}
          connectorInfo={
            {
              name: 'dummy2',
              identifier: 'dummy2',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'master',
                    auth: { type: 'ServiceAccount', spec: { serviceAccountTokenRef: 'account.testcorrectpasswordRef' } }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
  test('render edit mode oidc update', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          {...commonProps}
          name="credentials"
          isEditMode={true}
          connectorInfo={
            {
              name: 'dmhgjdgj',
              identifier: 'dmhgjdgj',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'nmbshg',
                    auth: {
                      type: 'OpenIdConnect',
                      spec: {
                        oidcIssuerUrl: 'hsdgjgj',
                        oidcUsername: 'dmhdj',
                        oidcUsernameRef: null,
                        oidcClientIdRef: 'account.jkdhkjdhk',
                        oidcPasswordRef: 'account.jkdhkjdhk',
                        oidcSecretRef: 'account.jkdhkjdhk',
                        oidcScopes: 'dhgjdd'
                      }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('render edit mode if correct auth type is not given ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          {...commonProps}
          name="credentials"
          isEditMode={true}
          connectorInfo={
            {
              name: 'dmhgjdgj',
              identifier: 'dmhgjdgj',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'nmbshg',
                    auth: {
                      type: 'OpenIdWrongConnect',
                      spec: {
                        oidcIssuerUrl: 'hsdgjgj',
                        oidcUsername: 'dmhdj',
                        oidcUsernameRef: null,
                        oidcClientIdRef: 'account.jkdhkjdhk',
                        oidcPasswordRef: 'account.jkdhkjdhk',
                        oidcSecretRef: 'account.jkdhkjdhk',
                        oidcScopes: 'dhgjdd'
                      }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('render edit mode and validate that empty client key algo cannot be submitted', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          {...commonProps}
          name="connectorname"
          isEditMode={true}
          connectorInfo={
            {
              name: 'dmhgjdgj',
              identifier: 'dmhgjdgj',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'nmbshg',
                    auth: {
                      type: 'ClientKeyCert',
                      spec: {
                        clientKeyAlgo: ''
                      }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('details')).not.toBeNull())
    fireEvent.click(getByText('continue'))
    await waitFor(() => expect(queryByText('connectors.k8.validation.clientKeyAlgo')).toBeTruthy())
  })
})
