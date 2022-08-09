/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import executionList from '@pipeline/pages/execution-list/__mocks__/execution-list.json'
import pipelines from '@pipeline/components/PipelineModalListView/__tests__/RunPipelineListViewMocks'
import filters from '@pipeline/pages/execution-list/__mocks__/filters.json'
import * as hooksMock from '@common/hooks'
import CIDashboardPage from '../CIDashboardPage'

jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
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

const buildExecutionMock = {
  data: {
    buildExecutionInfoList: [
      {
        time: 1621125462238,
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      },
      {
        time: 1621125462238,
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      },
      {
        time: 1621125462238,
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      }
    ]
  }
}

const buildHealthMock = {
  data: {
    builds: {
      total: {
        count: 7,
        rate: -22.22222222222222
      },
      success: {
        count: 3,
        rate: 10
      },
      failed: {
        count: 2,
        rate: 0.0
      }
    }
  }
}

jest.mock('services/ci', () => ({
  useGetBuilds: () => ({
    loading: false,
    data: {
      data: {
        failed: [
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: 1621125462238,
            endTs: 1621126062238
          },
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: 1621125462238,
            endTs: 1621126062238,
            planExecutionId: 'planExecutionId' // not yet supported by backend but should render as snapshot
          }
        ],
        active: [
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: 1621125462238,
            status: 'RUNNING',
            endTs: 1621126062238
          }
        ]
      }
    }
  }),
  useGetBuildHealth: () => ({
    loading: false,
    data: buildHealthMock
  }),
  useGetBuildExecution: () => ({
    loading: false,
    data: buildExecutionMock
  }),
  useGetRepositoryBuild: () => ({
    loading: false,
    data: {
      data: {
        repositoryInfo: [
          {
            name: 'springboot',
            buildCount: 7,
            percentSuccess: 0.0,
            successRate: -100.0,
            lastRepository: {
              commit: 'Update test.txt'
            },
            countList: [
              {
                time: 1621125462238,
                builds: {
                  count: 3
                }
              },
              {
                time: 1621125462238,
                builds: {
                  count: 0
                }
              },
              {
                time: 1621125462238,
                builds: {
                  count: 1
                }
              },
              {
                time: 1621125462238,
                builds: {
                  count: 0
                }
              },
              {
                time: 1621125462238,
                builds: {
                  count: 0
                }
              },
              {
                time: 1621125462238,
                builds: {
                  count: 3
                }
              },
              {
                time: 1621125462238,
                builds: {
                  count: 0
                }
              }
            ],
            time: 1621125462238
          }
        ]
      }
    }
  })
}))

jest.mock('highcharts-react-official', () => () => <div />)
const RealDate = Date.now

describe('CIDashboardPage snapshot test', () => {
  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2021-04-22T10:20:30Z').getTime())
  })

  afterAll(() => {
    global.Date.now = RealDate
  })
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CIDashboardPage />
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
        <CIDashboardPage />
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
        <CIDashboardPage />
      </TestWrapper>
    )

    //loading icon and text should be visible
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
    expect(getByText('Loading, please wait...')).toBeDefined()
  })
})
