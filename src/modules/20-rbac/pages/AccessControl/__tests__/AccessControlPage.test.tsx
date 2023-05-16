/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { RenderResult} from '@testing-library/react';
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AccessControlPage from '../AccessControlPage'

describe('Access Control Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toAccessControl({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AccessControlPage />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
    getByTestId = renderObj.getByTestId
    await waitFor(() => getByText('account accessControl'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('click on users', () => {
      const users = getByText('users')
      act(() => {
        fireEvent.click(users)
      })
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toUsers({
            accountId: 'testAcc'
          })
        )
      ).toBeTruthy()
    })
})
