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
import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockService from './__data__/mockService'
import ServicesList from '../ServicesList'

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <ServicesList featureFlag={mockFeature} refetchFlag={jest.fn()} />
    </TestWrapper>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

const useGetServicesMock = jest.spyOn(useGetServiceDetailsMock, 'useGetServiceDetails')
describe('ServiceList', () => {
  test('it should display pre-existing services', async () => {
    useGetServicesMock.mockImplementation((): any => {
      return {
        data: mockService,
        error: null,
        loading: false,
        refetch: jest.fn()
      }
    })

    renderComponent()

    mockFeature.services!.forEach(service => {
      expect(screen.getByText(service.name)).toBeInTheDocument()
    })
  })
})

describe('EditServicesModal', () => {
  test('it should open, close and render EditServicesModal correctly', async () => {
    useGetServicesMock.mockImplementation((): any => {
      return {
        data: mockService,
        error: null,
        loading: false,
        refetch: jest.fn()
      }
    })

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
    useGetServicesMock.mockImplementation((): any => {
      return {
        data: null,
        error: null,
        loading: true,
        refetch: jest.fn()
      }
    })

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => expect(screen.getByText('Loading, please wait...')).toBeInTheDocument())
  })

  test('it should display error message when fail to fetch Services', async () => {
    const refetch = jest.fn()
    useGetServicesMock.mockImplementation((): any => {
      return {
        data: null,
        error: true,
        loading: false,
        refetch
      }
    })

    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'edit-services' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      expect(screen.getByText('error')).toBeInTheDocument()
      expect(refetch).not.toBeCalled()

      userEvent.click(screen.getByRole('button', { name: 'Retry' }))
      expect(refetch).toBeCalled()
    })
  })

  test('it should already display existing services as selected in modal and can toggle to unselected', async () => {
    useGetServicesMock.mockImplementation((): any => {
      return {
        data: mockService,
        error: false,
        loading: false,
        refetch: jest.fn()
      }
    })

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
