/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import VariableListView from '../VariableListView'
import {
  VariableSuccessResponseWithData,
  VariableSuccessResponseWithDataFor2Pages,
  VariableSuccessResponseWithDataWithDefaultValue,
  VariableSuccessResponseWithDataWithNoPagedInfo
} from '../../__tests__/mock/variableResponse'

jest.useFakeTimers()

describe('VariableListView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('render component at account level', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <VariableListView
          variables={VariableSuccessResponseWithData.data as any}
          gotoPage={jest.fn()}
          openCreateUpdateVariableModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => getByText('CUSTOM_VARIABLE'))
    expect(container).toMatchSnapshot()
  }),
    test('render component with initial page render - paged metric info missing', async () => {
      const { container, getByText } = render(
        <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
          <VariableListView
            variables={VariableSuccessResponseWithDataWithNoPagedInfo.data as any}
            gotoPage={jest.fn()}
            openCreateUpdateVariableModal={jest.fn()}
          />
        </TestWrapper>
      )

      await waitFor(() => getByText('CUSTOM_VARIABLE'))
      expect(container).toMatchSnapshot()
    })

  test('render component at account level', async () => {
    const gotoPageMock = jest.fn()
    const { getByText } = render(
      <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <VariableListView
          variables={VariableSuccessResponseWithDataFor2Pages.data as any}
          gotoPage={gotoPageMock}
          refetch={jest.fn()}
          openCreateUpdateVariableModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => getByText('CUSTOM_VARIABLE'))

    const nextBtn = getByText('Next')
    act(() => {
      fireEvent.click(nextBtn)
    })
    expect(gotoPageMock).toBeCalled()
  })

  test('render component at account level - with no variable data', async () => {
    const { container } = render(
      <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <VariableListView variables={undefined} gotoPage={jest.fn()} openCreateUpdateVariableModal={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render component at account level - with no variable data', async () => {
    const { container } = render(
      <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <VariableListView
          variables={{ content: undefined }}
          gotoPage={jest.fn()}
          openCreateUpdateVariableModal={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render component at account level - with no variable data', async () => {
    const { getByText } = render(
      <TestWrapper path={routes.toVariables({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <VariableListView
          openCreateUpdateVariableModal={jest.fn()}
          variables={VariableSuccessResponseWithDataWithDefaultValue.data as any}
          gotoPage={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => getByText('CUSTOM_VARIABLE'))
    expect(getByText('default'))
  })
})
