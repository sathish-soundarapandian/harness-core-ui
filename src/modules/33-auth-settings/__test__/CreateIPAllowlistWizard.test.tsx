/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, RenderResult, queryByAttribute, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import {
  validateUniqueIpAllowlistConfigIdentifier,
  useCreateIpAllowlistConfigMutation,
  useUpdateIpAllowlistConfigMutation,
  validateIpAddressAllowlistedOrNot
} from '@harnessio/react-ng-manager-client'
import type { IpAllowlistConfigResponse } from '@harnessio/react-ng-manager-client'

import { VIEWS } from '@auth-settings/pages/Configuration/Configuration'

import routes from '@common/RouteDefinitions'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import CreateIPAllowlistWizard from '@auth-settings/components/CreateIPAllowlist/CreateIPAllowlistWizard'
import StepTestIP from '@auth-settings/components/CreateIPAllowlist/StepTestIP/StepTestIP'
import StepOverview from '@auth-settings/components/CreateIPAllowlist/StepOverview/StepOverview'
import type { IIPAllowlistForm } from '@auth-settings/interfaces/IPAllowlistInterface'
import {
  mockResponseCreateOrUpdateIPAllowlist,
  mockResponseValidateIpAddressCustomBlockSuccess,
  mockResponseValidateIpAddressCustomBlockFailure,
  mockDataForEdit
} from './mock'

jest.mock('@harnessio/react-ng-manager-client')

type SetupMocksReturn = {
  mockCreateIpAllowlistPromise: jest.Mock<Promise<{ content: IpAllowlistConfigResponse }>, [any, any]>
  mockUpdateIpAllowlistPromise: jest.Mock<Promise<{ content: IpAllowlistConfigResponse }>, [any, any]>
  validateIpAddressAllowlistedOrNotMock: jest.Mock
}

const setupMocks = (): SetupMocksReturn => {
  const validateUniqueIdentifierMock = validateUniqueIpAllowlistConfigIdentifier as jest.MockedFunction<any>
  validateUniqueIdentifierMock.mockImplementation(() => {
    return { content: true }
  })

  const mockCreateIpAllowlistPromise = jest.fn((_, { onSuccess, onError }) =>
    Promise.resolve({ content: mockResponseCreateOrUpdateIPAllowlist }).then(onSuccess).catch(onError)
  )

  const mockUpdateIpAllowlistPromise = jest.fn((_, { onSuccess, onError }) =>
    Promise.resolve({ content: mockResponseCreateOrUpdateIPAllowlist }).then(onSuccess).catch(onError)
  )

  const useUpdateIpAllowlistConfigMutationMock = useUpdateIpAllowlistConfigMutation as jest.MockedFunction<any>
  useUpdateIpAllowlistConfigMutationMock.mockImplementation(() => {
    return {
      isLoading: false,
      mutate: mockUpdateIpAllowlistPromise
    }
  })

  const useCreateIpAllowlistConfigMutationMock = useCreateIpAllowlistConfigMutation as jest.MockedFunction<any>
  useCreateIpAllowlistConfigMutationMock.mockImplementation(() => {
    return {
      isLoading: false,
      mutate: mockCreateIpAllowlistPromise
    }
  })

  const validateIpAddressAllowlistedOrNotMock = validateIpAddressAllowlistedOrNot as jest.MockedFunction<any>
  validateIpAddressAllowlistedOrNotMock.mockImplementation(() =>
    Promise.resolve({
      content: mockResponseValidateIpAddressCustomBlockSuccess
    })
  )

  return {
    mockUpdateIpAllowlistPromise,
    mockCreateIpAllowlistPromise,
    validateIpAddressAllowlistedOrNotMock
  }
}

const setIsEditMode = jest.fn()
const onClose = jest.fn()

describe('CreateIPAllowlistWizard Create Flow', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let getByRole: RenderResult['getByRole']
  let mockCreateIpAllowlistPromise: any
  let validateIpAddressAllowlistedOrNotMock: any

  beforeEach(async () => {
    const mocks = setupMocks()
    const commonProps = {
      isEditMode: false,
      setIsEditMode,
      onClose
    }

    const renderObj = render(
      <TestWrapper
        queryParams={{ view: VIEWS.ALLOWLIST }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <CreateIPAllowlistWizard {...commonProps} />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    getByRole = renderObj.getByRole

    mockCreateIpAllowlistPromise = mocks.mockCreateIpAllowlistPromise
    validateIpAddressAllowlistedOrNotMock = mocks.validateIpAddressAllowlistedOrNotMock

    await waitFor(() => getAllByText('authSettings.ipAllowlist'))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Create flow', async () => {
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    await act(async () => {
      clickSubmit(container)
    })

    // Click back, and submit again
    const backBtnStep2 = getByRole('button', { name: 'back' })
    await userEvent.click(backBtnStep2!)
    await act(async () => {
      clickSubmit(container)
    })

    // STEP 2 StepDefineRange
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'ipAddress',
        value: '192.168.1.1'
      }
    ])

    const checkboxUI = getByRole('checkbox', { name: 'UI' })
    await userEvent.click(checkboxUI!)
    const checkboxAPI = getByRole('checkbox', { name: 'API' })
    await userEvent.click(checkboxAPI!)

    await act(async () => {
      clickSubmit(container)
    })

    await waitFor(() => expect(mockCreateIpAllowlistPromise).toBeCalledTimes(1))

    // STEP 3 StepTestIP
    await waitFor(() => getAllByText('authSettings.ipAddress.testIPIfInRange'))
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'testIP',
        value: '192.168.1.1'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(validateIpAddressAllowlistedOrNotMock).toBeCalledTimes(1))
    const backBtn = getByRole('button', { name: 'back' })
    await userEvent.click(backBtn!)
  })
})

describe('CreateIPAllowlistWizard Edit Flow', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let mockUpdateIpAllowlistPromise: any

  beforeEach(async () => {
    const mocks = setupMocks()
    const commonProps = {
      isEditMode: true,
      setIsEditMode,
      onClose
    }

    const renderObj = render(
      <TestWrapper
        queryParams={{ view: VIEWS.ALLOWLIST }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <CreateIPAllowlistWizard {...commonProps} data={mockDataForEdit} />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText

    mockUpdateIpAllowlistPromise = mocks.mockUpdateIpAllowlistPromise

    await waitFor(() => getAllByText('authSettings.ipAllowlist'))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Edit flow', async () => {
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })
    await act(async () => {
      clickSubmit(container)
    })

    // STEP 2 StepDefineRange
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'ipAddress',
        value: '192.168.1.1'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    await waitFor(() => expect(mockUpdateIpAllowlistPromise).toBeCalledTimes(1))
  })
})

describe('StepTestIP tests', () => {
  const commonProps = {
    isEditMode: true,
    setIsEditMode,
    onClose
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  const renderTestIPComponent = (data: IIPAllowlistForm): RenderResult => {
    return render(
      <TestWrapper
        queryParams={{ view: VIEWS.ALLOWLIST }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <StepTestIP
          name={'authSettings.ipAddress.testIP'}
          data={data}
          {...commonProps}
          previousStep={jest.fn()}
          prevStepData={{ testIP: '192.168.1.1' }}
        />
      </TestWrapper>
    )
  }
  test('should render error in case testIP API throws', async () => {
    const validateIpAddressAllowlistedOrNotMock = validateIpAddressAllowlistedOrNot as jest.MockedFunction<any>
    validateIpAddressAllowlistedOrNotMock.mockImplementation(() => {
      throw new Error('Something went wrong')
    })
    const data: IIPAllowlistForm = {
      allowSourceTypeUI: true,
      allowSourceTypeAPI: true,
      description: '',
      enabled: false,
      identifier: 'ip_range_1',
      ipAddress: '192.168.1.1',
      name: 'ip range 1'
    }
    const { container, getByRole } = renderTestIPComponent(data)
    expect(screen.queryByText('authSettings.ipAddress.testIPIfInRange')).toBeInTheDocument()
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'testIP',
        value: '192.168.1.1'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(validateIpAddressAllowlistedOrNotMock).toBeCalledTimes(1))
    const finishBtn = getByRole('button', { name: 'finish' })
    await userEvent.click(finishBtn!)
  })

  test('should render error in case testIP API fails', async () => {
    const validateIpAddressAllowlistedOrNotMock = validateIpAddressAllowlistedOrNot as jest.MockedFunction<any>
    validateIpAddressAllowlistedOrNotMock.mockImplementation(() =>
      Promise.resolve({ content: mockResponseValidateIpAddressCustomBlockFailure })
    )
    const data: IIPAllowlistForm = {
      allowSourceTypeUI: true,
      allowSourceTypeAPI: true,
      description: '',
      enabled: false,
      identifier: 'ip_range_1',
      ipAddress: '192.168.1.1',
      name: 'ip range 1'
    }
    const { container, getByRole } = renderTestIPComponent(data)
    expect(screen.queryByText('authSettings.ipAddress.testIPIfInRange')).toBeInTheDocument()
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'testIP',
        value: '192.168.1.1'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(validateIpAddressAllowlistedOrNotMock).toBeCalledTimes(1))
    const finishBtn = getByRole('button', { name: 'finish' })
    await userEvent.click(finishBtn!)
  })
})

describe('StepOverview tests', () => {
  const commonProps = {
    isEditMode: false,
    setIsEditMode,
    onClose
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  const renderComponent = (data: IIPAllowlistForm): RenderResult => {
    return render(
      <TestWrapper
        queryParams={{ view: VIEWS.ALLOWLIST }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <StepOverview name={'overview'} data={data} {...commonProps} previousStep={jest.fn()} prevStepData={data} />
      </TestWrapper>
    )
  }
  test('should render error in case validate unique identifier API throws', async () => {
    const validateUniqueIdentifierMock = validateUniqueIpAllowlistConfigIdentifier as jest.MockedFunction<any>
    validateUniqueIdentifierMock.mockImplementation(() => {
      throw new Error('Something went wrong')
    })

    const data: IIPAllowlistForm = {
      allowSourceTypeUI: true,
      allowSourceTypeAPI: true,
      description: '',
      enabled: false,
      identifier: '',
      ipAddress: '',
      name: ''
    }
    const { container } = renderComponent(data)
    expect(screen.queryByText('overview')).toBeInTheDocument()
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'ip range 1' } })
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(validateUniqueIdentifierMock).toBeCalledTimes(1))
    expect(screen.queryByText('Something went wrong')).toBeInTheDocument()
  })

  test('should render error in case testIP API gives falsy result', async () => {
    const validateUniqueIdentifierMock = validateUniqueIpAllowlistConfigIdentifier as jest.MockedFunction<any>
    validateUniqueIdentifierMock.mockImplementation(() => {
      return { content: false }
    })

    const data: IIPAllowlistForm = {
      allowSourceTypeUI: true,
      allowSourceTypeAPI: true,
      description: '',
      enabled: false,
      identifier: 'ip_range_1',
      ipAddress: '192.168.1.1',
      name: 'ip range 1'
    }
    const { container } = renderComponent(data)
    expect(screen.queryByText('overview')).toBeInTheDocument()
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'ip range 1'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(validateUniqueIdentifierMock).toBeCalledTimes(1))
    expect(screen.queryByText('authSettings.ipAddress.duplicateIdError')).toBeInTheDocument()
  })
})
