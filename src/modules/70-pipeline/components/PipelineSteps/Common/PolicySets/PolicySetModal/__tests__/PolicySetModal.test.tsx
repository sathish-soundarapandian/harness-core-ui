/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { PolicySetModal } from '../PolicySetModal'

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  get: jest.fn()
}))

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

jest.mock('@governance/PolicySetWizard', () => ({
  PolicySetWizard: () => <div>Policy Set Wizard Mock</div>
}))

jest.mock('services/pm', () => ({
  useGetPolicySetList: jest.fn().mockImplementation(() => ({
    data: [
      {
        account_id: 'acc',
        identifier: 'test1',
        name: 'test',
        updated: 12345
      },
      {
        account_id: 'acc',
        identifier: 'test2',
        name: 'test',
        org_id: 'org',
        updated: 12345
      },
      {
        account_id: 'acc',
        identifier: 'test3',
        name: 'test',
        org_id: 'org',
        project_id: 'project',
        updated: 12345
      }
    ],
    loading: false,
    refetch: jest.fn(),
    error: {},
    response: {
      headers: {
        get: () => 1
      }
    }
  }))
}))

describe('Test Policy Set Modal', () => {
  test('snapshot test and modal is navigable', async () => {
    const closeModal = jest.fn()
    const { baseElement } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetModal
          name={'spec.policySets'}
          policySetIds={['acc.test']}
          closeModal={closeModal}
          formikProps={
            {
              setFieldValue: jest.fn().mockImplementation((name, ids) => ({
                name,
                ids
              }))
            } as any
          }
        />
      </TestWrapper>
    )

    expect(baseElement).toMatchSnapshot()

    expect(screen.getByTestId('account')).toBeDefined()

    const orgTab = screen.getByTestId('orgLabel')
    await waitFor(() => expect(orgTab).toBeDefined())

    act(() => {
      fireEvent.click(orgTab)
    })

    const projectTab = screen.getByTestId('projectLabel')
    await waitFor(() => expect(projectTab).toBeDefined())

    act(() => {
      fireEvent.click(projectTab)
    })

    const applyButton = screen.getByText('Apply')

    act(() => {
      fireEvent.click(applyButton)
    })

    await waitFor(() => expect(closeModal).toHaveBeenCalled())
  })

  test('should open policy set wizard modal', async () => {
    const closeModal = jest.fn()

    const { getByText } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetModal
          name={'spec.policySets'}
          policySetIds={['acc.test']}
          closeModal={closeModal}
          formikProps={
            {
              setFieldValue: jest.fn().mockImplementation((name, ids) => ({
                name,
                ids
              }))
            } as any
          }
        />
      </TestWrapper>
    )

    const newPolicySetButton = getByText('common.policiesSets.newPolicyset')
    expect(newPolicySetButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(newPolicySetButton)
    })

    await waitFor(() => expect(screen.getByText('Policy Set Wizard Mock')).toBeInTheDocument())
  })
})
