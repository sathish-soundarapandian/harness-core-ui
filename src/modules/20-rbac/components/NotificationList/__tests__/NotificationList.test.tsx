/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import NotificationList from '../NotificationList'

jest.mock('@wings-software/uicore', () => ({
  ...jest.requireActual('@wings-software/uicore'),
  FormInput: {
    ...jest.requireActual('@wings-software/uicore').FormInput,
    Select: (props: any) => {
      return (
        <button
          onClick={() => {
            props.formik?.setFieldValue('type', 'EMAIL')
          }}
          data-testid="msTeams"
        >
          Ms teams
        </button>
      )
    }
  }
}))

describe('notification list tests', () => {
  test('test add channel button', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <NotificationList
          userGroup={{
            identifier: 'dummy_identifier',
            name: 'dummy_name'
          }}
          onSubmit={() => {
            //on submit
          }}
        />
      </TestWrapper>
    )
    expect(queryByTestId('addChannel')).not.toBeNull()
  })

  test('click on add channel', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <NotificationList
          userGroup={{
            identifier: 'dummy_identifier',
            name: 'dummy_name'
          }}
          onSubmit={() => {
            //on submit
          }}
        />
      </TestWrapper>
    )
    const plusBtn = queryByTestId('addChannel')
    fireEvent.click(plusBtn!)
    const btn = queryByTestId('msTeams')
    fireEvent.click(btn!)
    const saveBtn = queryByTestId('saveBtn')
    fireEvent.submit(saveBtn!)
    expect(saveBtn).toBeDefined()
  })
})
