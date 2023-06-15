/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import { getOrganizationListPromise, getProjectListPromise } from 'services/cd-ng'
import ciApiResponse from './mocks/ciApiResponse.json'
import CIUsageGraph from '../overview/CIUsageGraph'

jest.mock('services/cd-ng')
jest.mock('services/ci')
const getOrganizationListPromiseMock = getOrganizationListPromise as jest.MockedFunction<any>
const getProjectListPromiseMock = getProjectListPromise as jest.MockedFunction<any>
const orgListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: {
      pageCount: 1,
      itemCount: 3,
      pageSize: 50,
      content: [
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'testOrg',
            name: 'Org Name',
            description: 'Description',
            tags: { tag1: '', tag2: 'tag3' }
          }
        },
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'default',
            name: 'default',
            description: 'default',
            tags: { tag1: '', tag2: 'tag3' }
          },
          harnessManaged: true
        }
      ],
      pageIndex: 0,
      empty: false
    }
  })
})

const projListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: {
      pageCount: 1,
      itemCount: 3,
      pageSize: 50,
      content: [
        {
          project: {
            orgIdentifier: 'default',
            identifier: 'TestCiproject',
            name: 'TestCiproject',
            color: '#0063F7',
            modules: ['CI', 'CD'],
            description: 'Test description',
            tags: { tag1: 'value' }
          }
        }
      ],
      pageIndex: 0,
      empty: false
    }
  })
})

getOrganizationListPromiseMock.mockImplementation(() => {
  return orgListPromiseMock()
})

getProjectListPromiseMock.mockImplementation(() => {
  return projListPromiseMock()
})
jest.mock('services/cd-ng')
jest.mock('highcharts-react-official', () => () => <div />)
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: ciApiResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Service License Visualisation Graph test cases', () => {
  test('it renders the subscriptions page with CI usage graph', async () => {
    const { container, getAllByText, getByText } = render(
      <TestWrapper>
        <CIUsageGraph accountId={'accountId'} licenseType={'DEVELOPERS'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const orgDropdown = getAllByText('orgsText')[0]
    act(() => {
      fireEvent.click(orgDropdown)
    })
    // calling the orgchange by selecting value from dropdown
    await waitFor(() => {
      getByText('Org Name')
    })
    act(() => {
      fireEvent.click(getByText('Org Name'))
    })

    // project dropdown
    const projDropdown = getAllByText('projectsText')[0]
    act(() => {
      fireEvent.click(projDropdown)
    })
    // calling the projDropdown by selecting value from dropdown
    await waitFor(() => {
      getByText('TestCiproject')
    })
    act(() => {
      fireEvent.click(getByText('TestCiproject'))
    })
    // calling the fetch button
    const fetchButton = getByText('Update')
    expect(fetchButton).toBeDefined()
    fireEvent.click(fetchButton)
    expect(useMutateAsGet).toBeCalled()
  })
})

describe('CIUsage License Visualisation Graph test cases for api data still loading', () => {
  test('checking if spinner loads on loading as true from api ', async () => {
    ;(useMutateAsGet as any).mockImplementation(() => {
      return { data: [], refetch: jest.fn(), error: null, loading: true }
    })
    const { container } = render(
      <TestWrapper>
        <CIUsageGraph accountId={'accountId'} licenseType={'DEVELOPERS'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot('spinner')
  })
})
