/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { MultiTypePolicySetSelector } from '../MultiTypePolicySetSelector'

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

jest.mock('services/pm', () => ({
  useGetPolicySet: jest.fn().mockImplementation(() => {
    return {
      data: {
        name: 'test',
        policies: ['ptest1']
      },
      loading: false,
      error: {}
    }
  }),
  useGetPolicySetList: jest.fn().mockImplementation(() => ({
    error: 'Bad Modal'
  }))
}))

describe('Test Policy Sets Form Field', () => {
  test('snapshot test and open close modal', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <Formik
          initialValues={{
            spec: {
              policySets: ['acc.test', 'org.test', 'test']
            }
          }}
          onSubmit={jest.fn()}
        >
          <MultiTypePolicySetSelector name="spec.policySets" label="dummy" />
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const addOrModifyButton = screen.getByText('common.policiesSets.addOrModifyPolicySet')
    await waitFor(() => expect(addOrModifyButton).toBeDefined())

    act(() => {
      fireEvent.click(addOrModifyButton)
    })

    await waitFor(() => expect(screen.getByText('common.policiesSets.selectPolicySet')).toBeDefined())

    const cancelButton = screen.getByText('Cancel')
    await waitFor(() => expect(cancelButton).toBeInTheDocument())

    act(() => {
      fireEvent.click(cancelButton)
    })

    await waitFor(() => expect(cancelButton).not.toBeInTheDocument())
  })

  test('delete selected policy set', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <Formik
          initialValues={{
            spec: {
              policySets: ['acc.test', 'org.test', 'test']
            }
          }}
          onSubmit={jest.fn()}
        >
          <MultiTypePolicySetSelector name="spec.policySets" label="dummy" />
        </Formik>
      </TestWrapper>
    )

    const deleteButton = container.querySelector('[data-icon="main-trash"]')!
    fireEvent.click(deleteButton)
    await waitFor(() => expect(deleteButton).not.toBeInTheDocument())
  })

  test('change to runtime input', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <Formik
          initialValues={{
            spec: {
              policySets: ['acc.test', 'org.test', 'test']
            }
          }}
          onSubmit={jest.fn()}
        >
          <MultiTypePolicySetSelector name="spec.policySets" label="dummy" />
        </Formik>
      </TestWrapper>
    )

    const fixedTypeChangeButton = container.querySelector('[data-icon="fixed-input"]')
    fireEvent.click(fixedTypeChangeButton!)
    const typeSelectionMenu = document.querySelector('.bp3-menu')!
    await waitFor(() => expect(typeSelectionMenu).toBeInTheDocument())

    const runtimeInputButton = typeSelectionMenu.querySelector('.MultiTypeInput--RUNTIME')
    fireEvent.click(runtimeInputButton!)
    await waitFor(() => expect(container.querySelector('[data-icon="fixed-input"]')).not.toBeInTheDocument())
    await waitFor(() => expect(container.querySelector('[data-icon="runtime-input"]')).toBeInTheDocument())
  })
})
