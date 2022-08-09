/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import RepoDetails from '../RepoDetails'

const submitFn = jest.fn()

test(`test - account connectorRef`, async () => {
  const { container } = render(
    <TestWrapper>
      <RepoDetails
        name={'RepoDetails'}
        stepName={'second step'}
        expressions={[]}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        isReadonly={false}
        prevStepData={{
          connectorRef: {
            value: 'account.dsfds',
            connector: {
              identifier: 'account.dsfds'
            }
          },
          identifier: 'test'
        }}
        initialValues={{
          identifier: 'test',

          type: 'ReleaseRepo',

          branch: 'testbranch',
          connectorRef: 'account.dsfds',
          gitFetchType: 'Branch',
          paths: 'eqwewq',
          repoName: 'repo'
        }}
        manifest={{
          identifier: 'test',
          type: 'ReleaseRepo',
          spec: {
            store: {
              type: undefined,
              spec: {
                connectorRef: 'account.dsfds',
                gitFetchType: 'Branch',
                branch: 'testbranch',
                paths: ['eqwewq'],
                repoName: 'repo'
              }
            }
          }
        }}
        handleSubmit={submitFn}
      />
    </TestWrapper>
  )

  fireEvent.click(container.querySelector('button[type="submit"]')!)
  expect(container).toMatchSnapshot()
})

test(`test - org connectorRef`, async () => {
  const { container } = render(
    <TestWrapper>
      <RepoDetails
        name={'RepoDetails'}
        stepName={'second step'}
        expressions={[]}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        isReadonly={false}
        prevStepData={{
          store: 'Git',

          connectorRef: {
            value: 'account.dsfds',
            connector: {
              identifier: 'org.dsfds'
            }
          },
          identifier: 'test'
        }}
        initialValues={{
          identifier: 'test',

          type: 'ReleaseRepo',

          branch: 'testbranch',
          connectorRef: 'org.dsfds',
          gitFetchType: 'Branch',
          paths: 'eqwewq',
          repoName: 'repo'
        }}
        manifest={{
          identifier: 'test',
          type: 'ReleaseRepo',
          spec: {
            store: {
              type: undefined,
              spec: {
                connectorRef: 'org.dsfds',
                gitFetchType: 'Branch',
                branch: 'testbranch',
                paths: ['eqwewq'],
                repoName: 'repo'
              }
            }
          }
        }}
        handleSubmit={submitFn}
      />
    </TestWrapper>
  )

  fireEvent.click(container.querySelector('button[type="submit"]')!)
  expect(container).toMatchSnapshot()
})

test(`test - urltype repo`, async () => {
  const { container } = render(
    <TestWrapper>
      <RepoDetails
        name={'RepoDetails'}
        stepName={'second step'}
        expressions={[]}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        isReadonly={false}
        prevStepData={{
          store: 'Git',
          connector: {
            identifier: 'dsfds',
            spec: {
              url: 'test'
            }
          },
          connectorRef: {
            scope: 'org',
            connector: {
              identifier: 'dsfds',
              spec: {
                url: 'test'
              }
            }
          },
          urlType: 'Repo',
          identifier: 'test'
        }}
        initialValues={{
          identifier: 'test',

          type: 'ReleaseRepo',

          branch: 'testbranch',
          connectorRef: 'org.dsfds',
          gitFetchType: 'Branch',
          paths: 'eqwewq',
          repoName: 'repo'
        }}
        manifest={{
          identifier: 'test',
          type: 'ReleaseRepo',
          spec: {
            store: {
              type: undefined,
              spec: {
                connectorRef: 'org.dsfds',
                gitFetchType: 'Branch',
                branch: 'testbranch',
                paths: ['eqwewq'],
                repoName: 'repo'
              }
            }
          }
        }}
        handleSubmit={submitFn}
      />
    </TestWrapper>
  )

  fireEvent.click(container.querySelector('button[type="submit"]')!)
  expect(container).toMatchSnapshot()
})
