/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import * as hooks from '@common/hooks/useFeatureFlag'
import ETSettings from '../ETSettings'

export const testWrapperProps: TestWrapperProps = {
  path: routes.toETSettings({ ...accountPathProps, ...orgPathProps, ...projectPathProps }),
  pathParams: {
    accountId: 'test_accountId',
    projectIdentifier: 'test_project',
    orgIdentifier: 'test_org'
  }
}

const WrapperComponent = (): React.ReactElement => {
  return (
    <TestWrapper {...testWrapperProps}>
      <ETSettings />
    </TestWrapper>
  )
}

describe('Unit tests for ETSettings', () => {
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']
  const useFeatureFlags = jest.spyOn(hooks, 'useFeatureFlag')
  useFeatureFlags.mockReturnValue(true)
  beforeEach(async () => {
    const renderObj = render(<WrapperComponent />)
    getByText = renderObj.getByText
    getByTestId = renderObj.getByTestId
    await waitFor(() => getByText('Agents'))
  })

  test('click on tokens', () => {
    const tokens = getByText('Tokens')
    act(() => {
      fireEvent.click(tokens)
    })
    expect(
      getByTestId('location').innerHTML.endsWith(
        routes.toETAgentsTokens({
          accountId: 'test_accountId',
          projectIdentifier: 'test_project',
          orgIdentifier: 'test_org'
        })
      )
    ).toBeTruthy()
  }),
    test('click on agents', () => {
      const agents = getByText('Agents')
      act(() => {
        fireEvent.click(agents)
      })
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toETAgents({
            accountId: 'test_accountId',
            projectIdentifier: 'test_project',
            orgIdentifier: 'test_org'
          })
        )
      ).toBeTruthy()
    }),
    test('click on critical events', () => {
      const agents = getByText('Critical Events')
      act(() => {
        fireEvent.click(agents)
      })
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toETCriticalEvents({
            accountId: 'test_accountId',
            projectIdentifier: 'test_project',
            orgIdentifier: 'test_org'
          })
        )
      ).toBeTruthy()
    })
})
