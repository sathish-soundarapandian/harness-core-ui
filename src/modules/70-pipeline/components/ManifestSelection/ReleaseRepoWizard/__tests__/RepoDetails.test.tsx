/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import RepoDetails from '../RepoDetails'

const submitFn = jest.fn()

describe('Repo Details testing', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{}}
          manifest={null}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`click on git card`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{}}
          manifest={null}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )
    const gitCard = container.querySelector('[data-icon=service-github]')
    fireEvent.click(gitCard!)

    expect(container).toMatchSnapshot()
  })

  test(`renders with initialValues for branch`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{
            identifier: 'test',

            branch: 'testbranch',

            gitFetchType: 'Branch',
            paths: ['test']
          }}
          manifest={{
            identifier: 'test',
            type: 'ReleaseRepo',
            spec: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: 'dsfds',
                  gitFetchType: 'Branch',
                  paths: ['eqwewq'],
                  branch: 'sdfds'
                }
              }
            }
          }}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders with initialValues for commitId`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{
            identifier: 'test',

            commitId: 'test-commit',

            gitFetchType: 'Commit',
            paths: ['test']
          }}
          manifest={{
            identifier: 'test',
            type: 'ReleaseRepo',
            spec: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: 'dsfds',
                  gitFetchType: 'Commit',
                  paths: ['eqwewq'],
                  commitId: 'sdfds'
                }
              }
            }
          }}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`runtime values for branch and paths`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{
            identifier: 'test',

            branch: RUNTIME_INPUT_VALUE,

            gitFetchType: 'Branch',
            paths: RUNTIME_INPUT_VALUE
          }}
          manifest={{
            identifier: 'test',
            type: 'ReleaseRepo',
            spec: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: 'dsfds',
                  gitFetchType: 'Branch',
                  paths: RUNTIME_INPUT_VALUE,
                  branch: RUNTIME_INPUT_VALUE
                }
              }
            }
          }}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`runtime values for commitId and paths`, () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{
            identifier: 'test',

            commitId: RUNTIME_INPUT_VALUE,

            gitFetchType: 'Commit',
            paths: RUNTIME_INPUT_VALUE
          }}
          manifest={{
            identifier: 'test',
            type: 'ReleaseRepo',
            spec: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: 'dsfds',
                  gitFetchType: 'Commit',
                  paths: RUNTIME_INPUT_VALUE,
                  commitId: RUNTIME_INPUT_VALUE
                }
              }
            }
          }}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`click submit`, async () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{
            identifier: 'test',

            type: 'ReleaseRepo',

            branch: 'testbranch',

            gitFetchType: 'Branch',
            paths: 'eqwewq'
          }}
          manifest={{
            identifier: 'test',
            type: 'ReleaseRepo',
            spec: {
              store: {
                type: undefined,
                spec: {
                  connectorRef: 'dsfds',
                  gitFetchType: 'Branch',
                  branch: 'testbranch',
                  paths: ['eqwewq']
                }
              }
            }
          }}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(submitFn).toHaveBeenCalledTimes(1)
      expect(submitFn).toHaveBeenCalledWith({
        manifest: {
          identifier: 'test',
          type: 'ReleaseRepo',
          spec: {
            store: {
              spec: {
                branch: 'testbranch',
                connectorRef: '',
                gitFetchType: 'Branch',
                paths: ['eqwewq'],
                repoName: undefined
              },
              type: undefined
            }
          }
        }
      })
    })
  })

  test(`click submit with commitid`, async () => {
    const { container } = render(
      <TestWrapper>
        <RepoDetails
          name={'RepoDetails'}
          stepName={'second step'}
          expressions={[]}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isReadonly={false}
          initialValues={{
            identifier: 'test',

            type: 'ReleaseRepo',

            commitId: 'testbranch',

            gitFetchType: 'Commit',
            paths: 'eqwewq'
          }}
          manifest={{
            identifier: 'test',
            type: 'ReleaseRepo',
            spec: {
              store: {
                type: undefined,
                spec: {
                  connectorRef: 'dsfds',
                  gitFetchType: 'Commit',
                  commitId: 'testbranch',
                  paths: ['eqwewq']
                }
              }
            }
          }}
          handleSubmit={submitFn}
        />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(submitFn).toBeCalled()
      expect(submitFn).toHaveBeenCalledWith({
        manifest: {
          identifier: 'test',
          type: 'ReleaseRepo',
          spec: {
            store: {
              spec: {
                commitId: 'testbranch',
                connectorRef: '',
                gitFetchType: 'Commit',
                paths: ['eqwewq'],
                repoName: undefined
              },
              type: undefined
            }
          }
        }
      })
    })
  })
})
