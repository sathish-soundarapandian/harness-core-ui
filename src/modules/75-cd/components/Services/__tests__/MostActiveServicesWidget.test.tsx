/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MostActiveServicesWidgetRef } from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import * as cdngServices from 'services/cd-ng'
import { mostActiveServiceInfo } from '@cd/mock'

jest.spyOn(cdngServices, 'useGetWorkloads').mockImplementation(() => {
  return { loading: false, error: false, data: mostActiveServiceInfo, refetch: jest.fn() } as any
})

const getLoader = (container: HTMLElement): Element =>
  container.querySelector('[data-test="mostActiveServicesWidgetLoader"]')!
const getError = (container: HTMLElement): Element =>
  container.querySelector('[data-test="mostActiveServicesWidgetError"]')!
const getEmpty = (container: HTMLElement): Element =>
  container.querySelector('[data-test="mostActiveServicesWidgetEmpty"]')!
const getContent = (container: HTMLElement): Element =>
  container.querySelector('[data-test="mostActiveServicesWidgetContent"]')!
const getEnvironmentTypes = (container: HTMLElement): NodeListOf<Element> =>
  container.querySelectorAll('[data-test="mostActiveServicesWidgetEnvironmentType"]')!
const getTypes = (container: HTMLElement): NodeListOf<Element> =>
  container.querySelectorAll('[data-test^="mostActiveServicesWidgetType"]')!
const getSelectedType = (container: HTMLElement): Element =>
  container.querySelector('[data-test^="mostActiveServicesWidgetTypeSelected"]')!

const title = 'Widget Title'

describe('MostActiveServicesWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should render MostActiveServicesWidget', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <MostActiveServicesWidgetRef title={title} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should display loading state', () => {
    jest.spyOn(cdngServices, 'useGetWorkloads').mockImplementation(() => {
      return { loading: true, error: false, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <MostActiveServicesWidgetRef title={title} />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeTruthy()
  })

  test('should display loading state', () => {
    jest.spyOn(cdngServices, 'useGetWorkloads').mockImplementation(() => {
      return { loading: true, error: false, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <MostActiveServicesWidgetRef title={title} />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeTruthy()
    expect(getError(container)).toBeFalsy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeFalsy()
  })

  test('should display error state', () => {
    jest.spyOn(cdngServices, 'useGetWorkloads').mockImplementation(() => {
      return { loading: false, error: true, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <MostActiveServicesWidgetRef title={title} />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeFalsy()
    expect(getError(container)).toBeTruthy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeFalsy()
  })

  test('should fetch data if env changes', async () => {
    const mockApi = jest.spyOn(cdngServices, 'useGetWorkloads').mockImplementation(() => {
      return { loading: false, error: false, data: mostActiveServiceInfo, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <MostActiveServicesWidgetRef title={title} />
      </TestWrapper>
    )
    expect(getLoader(container)).toBeFalsy()
    expect(getError(container)).toBeFalsy()
    expect(getEmpty(container)).toBeFalsy()
    expect(getContent(container)).toBeTruthy()

    expect(mockApi).toHaveBeenCalledTimes(1)
    fireEvent.click(getEnvironmentTypes(container)[1])
    await waitFor(() => expect(mockApi).toBeCalledTimes(2))
  })

  test('should be able to switch to different type', async () => {
    jest.spyOn(cdngServices, 'useGetWorkloads').mockImplementation(() => {
      return { loading: false, error: false, data: mostActiveServiceInfo, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <MostActiveServicesWidgetRef title={title} />
      </TestWrapper>
    )

    expect(getSelectedType(container).textContent).toBe('deploymentsText')
    fireEvent.click(getTypes(container)[1])
    await waitFor(() => expect(getSelectedType(container).textContent).toBe('errors'))

    expect(container).toMatchSnapshot()
  })
})
