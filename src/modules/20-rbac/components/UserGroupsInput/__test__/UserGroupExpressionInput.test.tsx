/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'

import UserGroupExpressionInput from '../UserGroupExpressionInput'

const props = {
  formik: {
    setFieldValue: jest.fn(),
    values: {
      userGroupExpression: 'Individual',
      name: 'spec.approvers.userGroups'
    },
    setErrors: jest.fn(),
    errors: {},
    isSubmitting: false,

    setFieldTouched: jest.fn()
  } as any,
  label: 'User group inputs',
  name: 'spec.approvers.userGroups'
}
describe('UserGroup Expression Input tests', () => {
  test('should render without any issue', () => {
    const { container } = render(
      <TestWrapper>
        <UserGroupExpressionInput {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render when clicked on combined userGroup', async () => {
    render(
      <TestWrapper>
        <UserGroupExpressionInput {...props} />
      </TestWrapper>
    )

    userEvent.click(screen.getByLabelText('common.combined')!)
    waitFor(() => {
      expect(
        screen.getByPlaceholderText('( <+pipeline.variables.group1> + "," + <+pipeline.variables.group2>).split(",")')
      ).toBeInTheDocument()
    })
  })

  test('should render comined expression', async () => {
    const editProps = {
      formik: {
        setFieldValue: jest.fn(),
        values: {
          userGroupExpression: 'Combined',
          name: 'spec.approvers.userGroups',
          spec: {
            approvers: {
              userGroups: '(<+pipeline.variables.group1> + "," + <+pipeline.variables.group2>).split(",")'
            }
          }
        },
        setErrors: jest.fn(),
        errors: {},
        isSubmitting: false,

        setFieldTouched: jest.fn()
      } as any,
      label: 'User group inputs',
      name: 'spec.approvers.userGroups'
    }
    const { container } = render(
      <TestWrapper>
        <UserGroupExpressionInput {...editProps} />
      </TestWrapper>
    )

    act(() => {
      userEvent.type(container.querySelector('input[name="spec.approvers.userGroups"]')!, '<+test>')
    })

    waitFor(() => {
      expect(container.querySelector('input[name="spec.approvers.userGroups"]')!).toHaveValue('<+test>')
    })
  })
})
