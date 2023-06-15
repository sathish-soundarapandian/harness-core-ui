/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { VariableSuccessResponseWithData } from '@variables/pages/variables/__tests__/mock/variableResponse'
import { useCreateVariable, useUpdateVariable } from 'services/cd-ng'
import CreateEditVariable from '../CreateEditVariable'

jest.mock('services/cd-ng')
const useCreateVariableMock = useCreateVariable as jest.MockedFunction<any>
const useUpdateVariableMock = useUpdateVariable as jest.MockedFunction<any>
const updateVariable = jest.fn().mockReturnValueOnce({ status: 'SUCCESS' })
useUpdateVariableMock.mockReturnValue({ mutate: updateVariable })

describe('CreateEditVariable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('render component click submit - success', async () => {
    const onSuccessMock = jest.fn()
    const createVariable = jest.fn().mockImplementationOnce(() => ({ status: 'SUCCESS' }))
    useCreateVariableMock.mockImplementation(() => ({ mutate: createVariable }))
    const { container, getByText } = render(
      <TestWrapper>
        <CreateEditVariable accountId="accountid" closeModal={noop} onSuccess={onSuccessMock} />
      </TestWrapper>
    )

    await waitFor(() => getByText('name'))

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'fixedValue',
        value: 'dummy fixed Value'
      }
    ])

    act(() => {
      clickSubmit(container)
    })

    await waitFor(() => expect(createVariable).toBeCalled())
    expect(onSuccessMock).toBeCalled()
  })

  test('render component click submit - success - edit', async () => {
    // Modify this test when edit functionality is implemented
    const createVariable = jest.fn().mockImplementationOnce(() => ({ status: 'SUCCESS' }))
    useCreateVariableMock.mockImplementation(() => ({ mutate: createVariable }))
    const { container, getByText } = render(
      <TestWrapper>
        <CreateEditVariable
          accountId="accountid"
          closeModal={noop}
          variable={VariableSuccessResponseWithData.data.content[0].variable as any}
        />
      </TestWrapper>
    )

    await waitFor(() => getByText('name'))

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'fixedValue',
        value: 'dummy fixed Value'
      }
    ])

    act(() => {
      clickSubmit(container)
    })

    await waitFor(() => expect(createVariable).toBeCalledTimes(0))
  })

  test('render component click submit - error', async () => {
    const createVariable = jest.fn().mockImplementationOnce(() => {
      throw Error('Failed to create')
    })
    useCreateVariableMock.mockImplementation(() => ({ mutate: createVariable }))
    const { container, getByText } = render(
      <TestWrapper>
        <CreateEditVariable accountId="accountid" closeModal={noop} />
      </TestWrapper>
    )

    await waitFor(() => getByText('name'))

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'fixedValue',
        value: 'dummy fixed Value'
      }
    ])

    act(() => {
      clickSubmit(container)
    })

    await waitFor(() => expect(createVariable).toBeCalled())
    expect(getByText('Failed to create')).toBeDefined()
  })

  test('render component check validations', async () => {
    const createVariable = jest.fn().mockImplementationOnce(() => ({ status: 'SUCCESS' }))
    useCreateVariableMock.mockImplementation(() => ({ mutate: createVariable }))
    const { container, getByText } = render(
      <TestWrapper>
        <CreateEditVariable
          accountId="accountid"
          closeModal={noop}
          projectIdentifier="projectId"
          orgIdentifier="orgId"
        />
      </TestWrapper>
    )

    await waitFor(() => getByText('name'))
    act(() => {
      clickSubmit(container)
    })
    await waitFor(() => getByText('common.validation.nameIsRequired'))
    expect(container).toMatchSnapshot()
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      }
    ])

    act(() => {
      clickSubmit(container)
    })
    await waitFor(() => getByText('variables.validation.fixedValue'))
  })
})
