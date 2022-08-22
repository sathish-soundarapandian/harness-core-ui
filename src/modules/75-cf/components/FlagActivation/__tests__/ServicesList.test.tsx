/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useToaster } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as useGetServiceDetailsMock from 'services/cd-ng'
import * as cfServiceMock from 'services/cf'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockServiceList from './__data__/mockService'
import ServicesList from '../ServicesList'

const refetchFlagMock = jest.fn()

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <ServicesList featureFlag={mockFeature} refetchFlag={refetchFlagMock} />
    </TestWrapper>
  )
}

beforeEach(() => {
  const { clear } = useToaster()
  clear()
  jest.clearAllMocks()
})
describe('ServiceList', () => {
  const patchMock = jest.fn()

  const useGetServiceListMock = jest.spyOn(useGetServiceDetailsMock, 'useGetServiceList')
  const usePatchServicesMock = jest.spyOn(cfServiceMock, 'usePatchFeature')

  test('it should display pre-existing services', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()

    mockFeature.services!.forEach(service => {
      expect(screen.getByText(service.name)).toBeInTheDocument()
    })
  })

  test('it should send patch request correctly', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    usePatchServicesMock.mockReturnValue({
      loading: false,
      mutate: patchMock
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    // add a new service
    userEvent.click(screen.getByRole('generic', { name: 'Support-0' }))

    // delete existing service
    userEvent.click(screen.getByRole('generic', { name: 'My Service 1-3' }))

    userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(patchMock).toBeCalledWith({
        instructions: [
          {
            kind: 'removeService',
            parameters: {
              identifier: 'service1Id'
            }
          },
          {
            kind: 'addService',
            parameters: {
              identifier: 'Support',
              name: 'Support'
            }
          }
        ]
      })

      expect(screen.queryByTestId('modaldialog-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('modaldialog-body')).not.toBeInTheDocument()
      expect(screen.queryByTestId('modaldialog-footer')).not.toBeInTheDocument()

      expect(refetchFlagMock).toBeCalled()
      expect(screen.getByText('cf.featureFlagDetail.serviceUpdateSuccess')).toBeInTheDocument()
    })
  })

  test('it should show error if patch fails', async () => {
    usePatchServicesMock.mockReturnValueOnce({
      loading: false,
      mutate: patchMock.mockRejectedValue({ message: 'failed to patch services' })
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    // add a new service
    userEvent.click(screen.getByRole('generic', { name: 'Support-0' }))

    // delete existing service
    userEvent.click(screen.getByRole('generic', { name: 'My Service 1-3' }))

    userEvent.click(screen.getByRole('button', { name: 'save' }))
    await waitFor(() => {
      expect(screen.getByText('failed to patch services')).toBeInTheDocument()
      expect(refetchFlagMock).not.toBeCalled()
    })
  })

  test('it should show spinner when patch request is sending', async () => {
    usePatchServicesMock.mockReturnValue({
      loading: true,
      mutate: patchMock.mockResolvedValue(undefined)
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    userEvent.click(screen.getByRole('generic', { name: 'My Service 1-3' }))

    userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => expect(screen.getByText('Loading, please wait...')).toBeInTheDocument())
  })

  test('it should check removed and readded logic', async () => {
    usePatchServicesMock.mockReturnValue({
      loading: false,
      mutate: patchMock
    } as any)

    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    // delete existing service
    userEvent.click(screen.getByRole('generic', { name: 'My Service 1-3' }))
    // re-add the deleted service
    userEvent.click(screen.getByRole('generic', { name: 'My Service 1-3' }))

    userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(patchMock).toBeCalledWith({
        instructions: []
      })

      expect(screen.queryByTestId('modaldialog-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('modaldialog-body')).not.toBeInTheDocument()
      expect(screen.queryByTestId('modaldialog-footer')).not.toBeInTheDocument()

      expect(refetchFlagMock).toBeCalled()

      expect(screen.getByText('cf.featureFlagDetail.serviceUpdateSuccess')).toBeInTheDocument()
    })
  })
})

describe('EditServicesModal', () => {
  const useGetServiceListMock = jest.spyOn(useGetServiceDetailsMock, 'useGetServiceList')

  test('it should open, close and render EditServicesModal correctly', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()

    expect(screen.getByRole('heading', { name: 'services' })).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlagDetail.serviceDescription')).toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => {
      expect(screen.getByTestId('modaldialog-header')).toBeInTheDocument()
      expect(screen.getByTestId('modaldialog-body')).toBeInTheDocument()
      expect(screen.getByTestId('modaldialog-footer')).toBeInTheDocument()
    })

    userEvent.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByTestId('modaldialog-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('modaldialog-body')).not.toBeInTheDocument()
      expect(screen.queryByTestId('modaldialog-footer')).not.toBeInTheDocument()
    })
  })

  test('it should show spinner when services are loading', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: true,
      data: null,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => expect(screen.getByText('Loading, please wait...')).toBeInTheDocument())
  })

  test('it should display error message when fail to fetch Services', async () => {
    const refetch = jest.fn()

    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: null,
      refetch,
      error: { message: 'failed to fetch services' }
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      expect(screen.getByText('failed to fetch services')).toBeInTheDocument()
      expect(refetch).not.toBeCalled()
    })
    userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(refetch).toBeCalled())
  })

  test('it should already display existing services as selected in modal and can toggle to unselected', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: false
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    const service = screen.getByRole('generic', { name: 'My Service 1-3' })

    await waitFor(() => {
      expect(service).toHaveClass('bp3-active')
    })

    userEvent.click(service)
    expect(service).not.toHaveClass('bp3-active')

    userEvent.click(service)
    expect(service).toHaveClass('bp3-active')
  })

  test('it should return searched options', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    const searchbox = screen.getByRole('searchbox')

    await waitFor(() => {
      expect(searchbox).toBeInTheDocument()
      expect(screen.getByRole('generic', { name: 'Support-0' })).toBeInTheDocument()
      expect(screen.getByRole('generic', { name: 'Messages-1' })).toBeInTheDocument()
      expect(screen.getByRole('generic', { name: 'Account-2' })).toBeInTheDocument()
      expect(screen.getByRole('generic', { name: 'My Service 1-3' })).toBeInTheDocument()
    })

    userEvent.type(searchbox, 'Support', { allAtOnce: true })
    expect(searchbox).toHaveValue('Support')

    // expect only the searched service to be returned
    await waitFor(() => {
      expect(screen.getByRole('generic', { name: 'Support-0' })).toBeInTheDocument()

      expect(screen.queryByRole('generic', { name: 'Messages-1' })).not.toBeInTheDocument()
      expect(screen.queryByRole('generic', { name: 'Account-2' })).not.toBeInTheDocument()
      expect(screen.queryByRole('generic', { name: 'My Service 1-3' })).not.toBeInTheDocument()
    })
  })

  test('it should return no results message', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: false
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    const searchbox = screen.getByRole('searchbox')
    await waitFor(() => expect(searchbox).toBeInTheDocument())

    userEvent.type(searchbox, 'Non existent Service Name', { allAtOnce: true })

    await waitFor(() => {
      expect(screen.getByText('cf.featureFlagDetail.noServices')).toBeInTheDocument()
    })
  })
})
