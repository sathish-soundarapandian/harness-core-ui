/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ServiceCardWithChart, { ServiceCardWithChartProps } from '../DeploymentCards/CardWithChart'
import type { WorkloadCardProps } from '../DeploymentCards/WorkloadCard'
import WorkloadCard from '../DeploymentCards/WorkloadCard'

const ServiceCardProps: ServiceCardWithChartProps = {
  title: 'serviceN',
  message: 'test',
  username: 'admin',
  startTime: 0,
  endTime: 0,
  count: 2,
  countLabel: 'Deployments',
  seriesName: 'Executions',
  successRate: 10,
  successRateDiff: 10,
  countList: [
    {
      builds: {},
      time: 0
    },
    {}
  ],
  onClick: jest.fn()
}

const props: WorkloadCardProps = {
  serviceName: 'serviceN',
  lastExecuted: {
    startTime: 1653539840450,
    endTime: 1653805869508,
    deploymentType: 'Kubernetes',
    status: 'IGNOREFAILED'
  },
  workload: [
    {
      date: 1652918400000,
      execution: {
        count: 0
      }
    },
    {
      date: 1653004800000,
      execution: {
        count: 0
      }
    },
    {
      date: 1653091200000,
      execution: {
        count: 0
      }
    }
  ],
  serviceId: 'serviceID',
  percentSuccess: 10,
  rateSuccess: 20,
  totalDeployments: 3
}

jest.mock('highcharts-react-official', () => () => <div />)

describe('WorkloadCard', () => {
  test('initial render', async () => {
    const { getByText, getByTestId, container } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <WorkloadCard {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText('pipeline.dashboards.successRate'))
    await waitFor(() => getByTestId('location'))

    expect(getByTestId('location')).toHaveTextContent('/account/dummy/cd/orgs/dummy/projects/dummy/services/serviceID')
  })
})

describe('ServiceCardWithChart ', () => {
  test('render without time data', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceCardWithChart {...ServiceCardProps} />
      </TestWrapper>
    )

    // check if time and date not visible
    expect(container.querySelector('[data-icon="time"]')).toBeNull()
    expect(container.querySelector('[data-icon="calendar"]')).toBeNull()
  })
})
