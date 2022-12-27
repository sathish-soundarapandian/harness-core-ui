/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import CVHomePage from '../CVHomePage'

jest.mock('services/cd-ng')
jest.mock('@projects-orgs/pages/HomePageTemplate/HomePageTemplate', () => ({
  ...(jest.requireActual('@projects-orgs/pages/HomePageTemplate/HomePageTemplate') as any),
  HomePageTemplate: function MockComponent(props: any) {
    return (
      <div className="homepagetemplage">
        <button className="projectCreate" onClick={() => props.projectCreateSuccessHandler({})}></button>
      </div>
    )
  }
}))

const useGetModuleLicenseInfoMock = useGetLicensesAndSummary as jest.MockedFunction<any>

describe('CVHomePage snapshot test', () => {
  test('should render properly', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CVHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Ensure project success handler calls history push', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CVHomePage />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[class~="projectCreate"]')!)
    expect(container).toMatchSnapshot()
  })

  test('Should show loader if the license call is in progress', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {}
        },
        loading: true,
        refetch: jest.fn()
      }
    })

    render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CVHomePage />
      </TestWrapper>
    )

    const spinner = screen.getByText('Loading, please wait...')

    expect(spinner).toBeInTheDocument()
  })

  test('Should show error UI if license call responds with error', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {}
        },
        error: { message: 'Call failed message' },
        refetch: jest.fn()
      }
    })

    render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CVHomePage />
      </TestWrapper>
    )

    const errorMessage = screen.getByText('Call failed message')

    expect(errorMessage).toBeInTheDocument()
  })
})
