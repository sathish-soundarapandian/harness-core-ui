/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import { deploymentsInfo } from '@cd/mock'
import * as cdngServices from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)

jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
  return { loading: false, error: false, data: deploymentsInfo, refetch: jest.fn() } as any
})

const getLoader = (container: HTMLElement): Element => container.querySelector('[data-test="deploymentsWidgetLoader"]')!
const getError = (container: HTMLElement): Element => container.querySelector('[data-test="deploymentsWidgetError"]')!
const getEmpty = (container: HTMLElement): Element => container.querySelector('[data-test="deploymentsWidgetEmpty"]')!
const getContent = (container: HTMLElement): Element =>
  container.querySelector('[data-test="deploymentsWidgetContent"]')!

describe('DeploymentsWidget', () => {
  test('should render DeploymentsWidget', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should display loading state', () => {
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: true, error: false, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeTruthy()
    expect(getError(container)).toBeFalsy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeFalsy()
  })

  test('should display error state', () => {
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: false, error: true, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeFalsy()
    expect(getError(container)).toBeTruthy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeFalsy()
  })

  test('should display correct data', () => {
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: false, error: false, data: deploymentsInfo, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeFalsy()
    expect(getError(container)).toBeFalsy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeTruthy()

    const tickers = container.querySelectorAll('[data-test="ticker"]')
    expect(tickers.length).toBe(3)

    expect(tickers[0].querySelector('[data-test="tickerText"]')?.textContent).toBe(
      `${deploymentsInfo.data.totalDeployments}`
    )
    expect(tickers[0].querySelector('[data-test="tickerValue"]')?.textContent).toBe(
      `${deploymentsInfo.data.totalDeploymentsChangeRate}%`
    )
    expect(tickers[1].querySelector('[data-test="tickerText"]')?.textContent).toBe(
      `${deploymentsInfo.data.failureRate}%`
    )
    expect(tickers[1].querySelector('[data-test="tickerValue"]')?.textContent).toBe(
      `${deploymentsInfo.data.failureRateChangeRate}%`
    )
    expect(tickers[2].querySelector('[data-test="tickerText"]')?.textContent).toBe(`${deploymentsInfo.data.frequency}`)
    expect(tickers[2].querySelector('[data-test="tickerValue"]')?.textContent).toBe(
      `${deploymentsInfo.data.frequencyChangeRate}%`
    )
  })

  test('should refetch data if time range is changed', () => {
    const refetch = jest.fn()
    jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
      return { loading: false, error: false, data: [], refetch } as any
    })
    render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget />
      </TestWrapper>
    )

    expect(refetch).toBeCalledTimes(0)
    // Todo - Jasmeet - update this test when date picker component is integrated in deployment widget
  })
})
