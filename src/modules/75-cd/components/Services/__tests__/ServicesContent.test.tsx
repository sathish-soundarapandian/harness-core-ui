/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import { ServicesContent } from '../ServicesContent/ServicesContent'

jest.mock('services/cd-ng', () => {
  return {
    GetServiceDetailsQueryParams: jest.fn(),
    useGetServiceDetails: jest.fn(() => ({ loading: false })),
    useGetWorkloads: jest.fn(() => ({ loading: false, data: null })),
    useGetServicesGrowthTrend: jest.fn(() => ({ data: null })),
    useGetServiceDeploymentsInfo: jest.fn(() => ({ loading: false })),
    useDeleteServiceV2: jest.fn(() => ({ mutate: jest.fn() }))
  }
})

const dataMock = {
  status: 'SUCCESS',
  data: {
    serviceDeploymentDetailsList: [
      {
        serviceName: 'test1',
        serviceIdentifier: 'test1',
        description: null,
        tags: {},
        deploymentTypeList: ['Kubernetes'],
        totalDeployments: 1,
        totalDeploymentChangeRate: -10000.0,
        successRate: 100.0,
        successRateChangeRate: -10000.0,
        failureRate: 0.0,
        failureRateChangeRate: 0.0,
        frequency: 0.03333333333333333,
        frequencyChangeRate: -10000.0,
        instanceCountDetails: {
          nonProdInstances: 2,
          prodInstances: 3,
          totalInstances: 5
        },
        lastPipelineExecuted: {
          pipelineExecutionId: '627c0eaf21422907474dfb76',
          identifier: 'testTimeFilter',
          name: 'testTimeFilter',
          status: 'SUCCESS',
          lastExecutedAt: 1652297391544
        }
      },
      {
        serviceName: 'testDock',
        serviceIdentifier: 'testDock',
        description: null,
        tags: {},
        deploymentTypeList: null,
        totalDeployments: 0,
        totalDeploymentChangeRate: 0.0,
        successRate: 0.0,
        successRateChangeRate: 0.0,
        failureRate: 0.0,
        failureRateChangeRate: 0.0,
        frequency: 0.0,
        frequencyChangeRate: 0.0,
        instanceCountDetails: null,
        lastPipelineExecuted: null
      }
    ]
  },
  metaData: null,
  correlationId: 'a1c02f24-168e-487e-8130-34832c4c0dea'
}

describe('ServicesContent', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <ServicesContent />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('render with mock details ', () => {
    jest.spyOn(cdngServices, 'useGetServiceDetails').mockImplementation((): any => {
      return {
        data: dataMock,
        error: null,
        loading: false,
        refetch: jest.fn()
      }
    })
    const { getByText } = render(
      <TestWrapper>
        <ServicesContent />
      </TestWrapper>
    )
    expect(getByText('testTimeFilter')).toBeTruthy()
  })
})
