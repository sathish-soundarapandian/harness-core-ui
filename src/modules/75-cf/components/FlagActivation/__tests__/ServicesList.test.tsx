/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  jest.clearAllMocks()
})

const useGetServiceListMock = jest.spyOn(useGetServiceDetailsMock, 'useGetServiceList')
const usePatchServiceMock = jest.spyOn(cfServiceMock, 'usePatchFeature')

describe('ServiceList', () => {
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
    const patchMock = jest.fn()

    useGetServiceListMock.mockReturnValue({
      loading: false,
      data: mockServiceList,
      refetch: jest.fn(),
      error: null
    } as any)

    usePatchServiceMock.mockReturnValue({ loading: false, mutate: patchMock } as any)

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
    usePatchServiceMock.mockReturnValue({
      loading: false,
      mutate: jest.fn().mockRejectedValue({ message: 'failed to patch services' })
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

  test('it should check removed and readded logic', async () => {
    const patchMock = jest.fn()

    usePatchServiceMock.mockReturnValue({ loading: false, mutate: patchMock } as any)

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

      expect(screen.getAllByText('cf.featureFlagDetail.serviceUpdateSuccess')[0]).toBeInTheDocument()
    })
  })
})

describe('EditServicesModal', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
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
      error: true
    } as any)

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      expect(screen.getAllByText('error')[0]).toBeInTheDocument()
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
})
