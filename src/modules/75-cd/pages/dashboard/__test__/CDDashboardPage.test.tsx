/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, render } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import * as hooksMock from '@common/hooks'
import executionList from '@pipeline/pages/execution-list/__tests__/mocks/execution-list.json'
import pipelines from '@pipeline/pages/execution-list/__tests__/mocks/pipeline-list.json'
import filters from '@pipeline/pages/execution-list/__tests__/mocks/filters.json'
import CDDashboardPage from '../CDDashboardPage'
import { deploymentExecutionMock, deploymentHealthMock, deploymentsMock, workloadsMock } from './mocks'

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
  })
}))

jest.mock('react-timeago', () => () => 'dummy date')
jest.mock('highcharts-react-official', () => () => <div />)

jest.mock('services/cd-ng', () => ({
  useGetDeployments: () => ({
    loading: false,
    data: deploymentsMock
  }),
  useGetDeploymentHealth: () => ({
    loading: false,
    data: deploymentHealthMock
  }),
  useGetDeploymentHealthV2: () => ({
    loading: false,
    data: deploymentHealthMock
  }),
  useGetDeploymentExecution: () => ({
    loading: false,
    data: deploymentExecutionMock
  }),
  useGetWorkloads: () => ({
    loading: false,
    data: workloadsMock
  }),
  useGetWorkloadsV2: () => ({
    loading: false,
    data: workloadsMock
  })
}))
const mockGetCallFunction = jest.fn()
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: executionList, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve([executionList])),
    loading: false,
    cancel: jest.fn()
  })),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelines)), cancel: jest.fn(), loading: false }
  }),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  })
}))
const RealDate = Date.now

describe('CDDashboardPage snapshot test', () => {
  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2021-04-22T10:20:30Z').getTime())
  })

  afterAll(() => {
    global.Date.now = RealDate
  })

  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CDDashboardPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should bg image when no pipeline/no execution', () => {
    jest.spyOn(hooksMock, 'useMutateAsGet').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CDDashboardPage />
      </TestWrapper>
    )

    // modal should open saying run pipeline
    const dailog = findDialogContainer()
    expect(findByText(dailog!, 'pipeline.runAPipeline')).toBeDefined()

    //bgImage should be applied
    expect(container.querySelector('div[style*="background-image: url(test-file-stub)"]')).toBeDefined()
  })

  test('if loading true', () => {
    jest.spyOn(hooksMock, 'useMutateAsGet').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: true
      }
    })
    const { getByText, container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CDDashboardPage />
      </TestWrapper>
    )

    //loading icon and text should be visible
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
    expect(getByText('Loading, please wait...')).toBeDefined()
  })
})
