/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, getByText, render } from '@testing-library/react'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import RepoStore from '../RepoStore'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ data: {} }))
}))
describe('ManifestSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoStore
          name={'manifestSource'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={{}}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`click on git card`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoStore
          name={'manifestSource'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={{}}
        />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-id=store-0]')!)
    expect(container).toMatchSnapshot()
  })

  test('connector as runtime', () => {
    const { container } = render(
      <TestWrapper>
        <RepoStore
          name={'manifestSource'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={
            {
              connectorRef: RUNTIME_INPUT_VALUE,
              gitFetchType: 'Branch',
              paths: ['dsfs'],
              repoName: 'demoRepo',
              branch: 'demoBranch',
              store: 'Github',
              selectedManifest: 'K8sManifest'
            } as any
          }
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`renders Git Store`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoStore
          name={'manifestSource'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={
            {
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'project',
                live: true,
                connector: {
                  name: 'test',
                  identifier: 'test',
                  description: '',
                  orgIdentifier: 'default',
                  projectIdentifier: 'default',
                  tags: {},
                  type: 'Github',
                  spec: {
                    url: 'http://github.com/default',
                    validationRepo: 'Gdummy-repo',
                    authentication: {
                      type: 'Http',
                      spec: {
                        type: 'UsernameToken',
                        spec: {
                          username: 'default',
                          usernameRef: null,
                          tokenRef: 'secret'
                        }
                      }
                    },
                    apiAccess: null,
                    delegateSelectors: [],
                    executeOnDelegate: false,
                    type: 'Account'
                  }
                }
              },
              gitFetchType: 'Branch',
              paths: ['dsfs'],
              repoName: 'demoRepo',
              branch: 'demoBranch',
              store: 'Github',
              selectedManifest: 'K8sManifest'
            } as any
          }
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`click continue btn`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoStore
          name={'manifestSource'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={
            {
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'project',
                live: true,
                connector: {
                  name: 'test',
                  identifier: 'test',
                  description: '',
                  orgIdentifier: 'default',
                  projectIdentifier: 'default',
                  tags: {},
                  type: 'Github',
                  spec: {
                    url: 'http://github.com/default',
                    validationRepo: 'Gdummy-repo',
                    authentication: {
                      type: 'Http',
                      spec: {
                        type: 'UsernameToken',
                        spec: {
                          username: 'default',
                          usernameRef: null,
                          tokenRef: 'secret'
                        }
                      }
                    },
                    apiAccess: null,
                    delegateSelectors: [],
                    executeOnDelegate: false,
                    type: 'Account'
                  }
                }
              },
              gitFetchType: 'Branch',
              paths: ['dsfs'],
              repoName: 'demoRepo',
              branch: 'demoBranch',
              store: 'Github',
              selectedManifest: 'K8sManifest'
            } as any
          }
        />
      </TestWrapper>
    )

    fireEvent.click(getByText(container, 'continue'))
    expect(container).toMatchSnapshot()
  })
})
