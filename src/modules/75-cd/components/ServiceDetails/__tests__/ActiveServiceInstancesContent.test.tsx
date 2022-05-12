/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActiveServiceInstancesContent } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesContent'
import * as cdngServices from 'services/cd-ng'
import dataMock from '../DeploymentView/dataMock.json'
import { ActiveServiceInstances } from '../ActiveServiceInstances/ActiveServiceInstances'

jest.mock('highcharts-react-official', () => () => <></>)

const mockData = {
  status: 'SUCCESS',
  data: {
    envBuildIdAndInstanceCountInfoList: [
      {
        envId: 'env1',
        envName: 'envName',
        buildIdAndInstanceCountList: [{ buildId: 'build1', count: 1 }, {}, { buildId: 'build3', count: 3 }]
      },
      {}
    ]
  }
}
jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
  return { loading: false, error: false, data: mockData, refetch: jest.fn() } as any
})
const noData = {
  status: 'SUCCESS',
  data: {}
}
describe('ActiveServiceInstancesContent', () => {
  test('should render ActiveServiceInstancesContent', () => {
    const { container, getByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancesContent />
      </TestWrapper>
    )
    fireEvent.click(getByText('cd.serviceDashboard.seeMore'))
    expect(container).toMatchSnapshot()
  })
  test('should render error', () => {
    jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
      return { loading: false, error: true, data: noData, refetch: jest.fn() } as any
    })
    const { container, getByText } = render(
      <TestWrapper>
        <ActiveServiceInstancesContent />
      </TestWrapper>
    )
    fireEvent.click(getByText('Retry'))
    expect(container).toMatchSnapshot()
  })

  test('should render loading', () => {
    jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
      return { loading: true, error: false, data: noData, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesContent />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render no data', () => {
    jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
      return {
        loading: false,
        error: false,
        data: noData,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesContent />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

//tests differents default states of tab according to the returned api response

jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
  return {
    loading: false,
    error: false,
    data: {},
    refetch: jest.fn()
  } as any
})
jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
  return {
    loading: false,
    error: false,
    data: {},
    refetch: jest.fn()
  } as any
})
describe('ActiveInstance Tab states ', () => {
  //tab should be defaulted to activeInstances
  test('when both are not empty - (activeInstance and deployments) ', () => {
    jest.spyOn(cdngServices, 'useGetEnvArtifactDetailsByServiceId').mockImplementation(() => {
      return {
        data: dataMock
      } as any
    })
    jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
      return { loading: false, error: false, data: mockData, refetch: jest.fn() } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ActiveServiceInstances />
      </TestWrapper>
    )

    // activeInstance Tab should be visible
    expect(getByText('common.instanceLabel')).toBeTruthy()
  })

  //tab should be defaulted to deployments
  test('when activeInstance is empty and deployments is not ', () => {
    jest.spyOn(cdngServices, 'useGetEnvArtifactDetailsByServiceId').mockImplementation(() => {
      return {
        data: dataMock
      } as any
    })
    jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
      return {
        loading: false,
        error: false,
        data: noData,
        refetch: jest.fn()
      } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ActiveServiceInstances />
      </TestWrapper>
    )
    //check if table header are visible
    expect(getByText('environment')).toBeTruthy()
    expect(getByText('cd.artifactVersion')).toBeTruthy()

    //check if table rows of deployments are visible

    //value is environment column
    expect(getByText('NewEnv')).toBeTruthy()

    //corresponding artifact version
    expect(getByText('perl')).toBeTruthy()
  })

  //when both are empty then defaulted to activeInstance
  test('when both are empty ', () => {
    jest.spyOn(cdngServices, 'useGetEnvArtifactDetailsByServiceId').mockImplementation(() => {
      return {
        mutate: () => Promise.resolve({ loading: false, data: [] })
      } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ActiveServiceInstances />
      </TestWrapper>
    )
    //activeInstance tab should open
    expect(getByText('cd.serviceDashboard.noActiveServiceInstances')).toBeTruthy()
  })
})
