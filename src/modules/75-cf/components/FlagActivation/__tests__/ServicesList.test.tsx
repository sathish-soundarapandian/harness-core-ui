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
import mockPaginatedServiceList from './__data__/mockPaginationServices'
import ServicesList from '../ServicesList'

const refetchFlagMock = jest.fn()
const loadingMessage = 'Loading, please wait...'

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
const patchMock = jest.fn()
describe('ServiceList', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const useGetServiceListMock = jest.spyOn(useGetServiceDetailsMock, 'useGetServiceList')
  const usePatchServicesMock = jest.spyOn(cfServiceMock, 'usePatchFeature')

  test('it should display pre-existing services', async () => {
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
    userEvent.click(screen.getByRole('checkbox', { name: 'Support' }))

    // delete existing service
    userEvent.click(screen.getByRole('checkbox', { name: 'My Service 1' }))

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
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    usePatchServicesMock.mockReturnValue({
      loading: false,
      mutate: patchMock.mockRejectedValue({ message: 'failed to patch services' })
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    // add a new service
    userEvent.click(screen.getByRole('checkbox', { name: 'Support' }))
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Support' })).toBeChecked())

    // delete existing service
    userEvent.click(screen.getByRole('checkbox', { name: 'My Service 1' }))
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'My Service 1' })).not.toBeChecked())

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

    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    userEvent.click(screen.getByRole('checkbox', { name: 'My Service 1' }))

    userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => expect(screen.getByText(loadingMessage)).toBeInTheDocument())
  })

  test('it should check removed and readded logic', async () => {
    const { clear } = useToaster()
    clear()

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
    userEvent.click(screen.getByRole('checkbox', { name: 'My Service 1' }))
    // re-add the deleted service
    userEvent.click(screen.getByRole('checkbox', { name: 'My Service 1' }))

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
  beforeEach(() => {
    const { clear } = useToaster()
    clear()
    jest.resetAllMocks()

    usePatchServicesMock.mockReturnValue({
      loading: false,
      mutate: patchMock
    } as any)
  })

  const useGetServiceListMock = jest.spyOn(useGetServiceDetailsMock, 'useGetServiceList')
  const usePatchServicesMock = jest.spyOn(cfServiceMock, 'usePatchFeature')

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

    await waitFor(() => expect(screen.getByText(loadingMessage)).toBeInTheDocument())
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

  test('it should already display existing services as checked in modal', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    const service = screen.getByRole('checkbox', { name: 'My Service 1' })

    await waitFor(() => expect(service).toBeChecked())
  })

  test('it should show the spinner when loading search results', async () => {
    useGetServiceListMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    userEvent.type(screen.getByRole('searchbox'), 'Support', { allAtOnce: true })

    await waitFor(() => expect(screen.getByText(loadingMessage)).toBeInTheDocument())
  })

  test('it should show only checked services when selecting dropdown', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))
    const dropdown = screen.getByPlaceholderText('- Select -')

    userEvent.click(dropdown)

    expect(screen.getByText('showAll')).toBeInTheDocument()
    expect(screen.getByText('common.showSelected')).toBeInTheDocument()

    userEvent.click(screen.getByText('common.showSelected'))

    // Only services already associated with a flag should appear
    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: 'My Service 1' })).toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'My Service 2' })).toBeInTheDocument()

      expect(screen.queryByRole('checkbox', { name: 'Support' })).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Messages' })).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Account' })).not.toBeInTheDocument()
    })

    // searching amongst the already associated services
    userEvent.type(screen.getByRole('searchbox'), 'My Service 1', { allAtOnce: true })

    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: 'My Service 1' })).toBeInTheDocument()

      expect(screen.queryByRole('checkbox', { name: 'My Service 2' })).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Support' })).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Messages' })).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Account' })).not.toBeInTheDocument()
    })
  })

  test('it should switch between Show all and Show selected dropdown filters', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: 'My Service 1' })).toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'My Service 2' })).toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Support' })).toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Messages' })).toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Account' })).toBeInTheDocument()
    })

    userEvent.click(screen.getByPlaceholderText('- Select -'))

    userEvent.click(screen.getByText('common.showSelected'))

    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: 'My Service 1' })).toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'My Service 2' })).toBeInTheDocument()

      expect(screen.queryByRole('checkbox', { name: 'Support' })).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Messages' })).not.toBeInTheDocument()
      expect(screen.queryByRole('checkbox', { name: 'Account' })).not.toBeInTheDocument()
    })
  })

  test('it should render correct empty state', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: [],
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'cf.featureFlagDetail.noServices' })).toBeInTheDocument()
      expect(screen.getByTestId('nodata-image')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'plus newService' })).toBeInTheDocument()
    })
  })

  test('it should render link to take user to create a new Service', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: [],
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    userEvent.click(await screen.findByRole('button', { name: 'plus newService' }))

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/account/dummy/cv/orgs/dummy/projects/dummy/monitoringservices/setup'
    )
  })

  test('it should correctly go to selected paginated page', async () => {
    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockPaginatedServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    userEvent.click(screen.getByRole('button', { name: '2' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '2' })).toBeDisabled
      expect(screen.getByRole('button', { name: '1' })).not.toBeDisabled
    })

    userEvent.click(screen.getByRole('button', { name: '1' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '1' })).toBeDisabled
      expect(screen.getByRole('button', { name: '2' })).not.toBeDisabled
    })
  })
})
