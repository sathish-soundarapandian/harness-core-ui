/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActiveServiceInstancePopover } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancePopover'
import * as cdngServices from 'services/cd-ng'
import {
  mockserviceInstanceDetails,
  mockGitopsServiceInstanceDetails,
  mockServiceInstanceDetailsWithContainerList,
  mockServiceInstanceDetailsForCustomDeployment,
  mockServiceInstanceDetailsForAsgCanaryDeployment,
  mockServiceInstanceDetailsForAsgBlueGreenDeployment
} from './mocks'

describe('ActiveServiceInstancePopover', () => {
  beforeEach(() => {
    jest
      .spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds')
      .mockImplementation(() => mockserviceInstanceDetails as any)
  })

  test('should render ActiveServiceInstancePopover', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render loading', () => {
    jest.spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds').mockImplementation(() => {
      return { loading: true, error: false, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should display function (not pod) as label when deployment type is ServerlessAwsLambda', () => {
    const { getByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={3} />
      </TestWrapper>
    )

    expect(getByText('Cd.servicedashboard.function:')).toBeInTheDocument()
  })

  test('should display function (not pod) as label when deployment type is AWS_SAM', () => {
    render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={4} />
      </TestWrapper>
    )

    // Function
    expect(screen.getByText('Cd.servicedashboard.function:')).toBeInTheDocument()
    expect(screen.getByText('release-893b57260532de1e28c01603f3ec71620b7eadfb-todolist-llk7p')).toBeInTheDocument()
    // Region
    expect(screen.getByText('Region:')).toBeInTheDocument()
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
  })

  test('should display cluster when clusterIdentifier field is present', () => {
    jest
      .spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds')
      .mockImplementation(() => mockGitopsServiceInstanceDetails as any)

    const { getByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )

    expect(getByText('common.cluster:')).toBeDefined()
  })

  test('should render container list images', () => {
    jest
      .spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds')
      .mockImplementation(() => mockServiceInstanceDetailsWithContainerList as any)

    const { getByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )
    expect(getByText('cd.serviceDashboard.containerList:')!).toBeDefined()
  })

  test('should render instances info for custom deployment', () => {
    jest
      .spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds')
      .mockImplementation(() => mockServiceInstanceDetailsForCustomDeployment as any)

    const { getByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )
    expect(getByText('hostname:')!).toBeInTheDocument()
    expect(getByText('instance2')!).toBeInTheDocument()
    expect(getByText('version:')!).toBeInTheDocument()
    expect(getByText('library/nginx:stable-perl')!).toBeInTheDocument()
    expect(getByText('2021.07.10_app_2.war')!).toBeInTheDocument()
  })
  test('should render instances info for Asg service deployment type for blue green deployment', () => {
    jest
      .spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds')
      .mockImplementation(() => mockServiceInstanceDetailsForAsgBlueGreenDeployment as any)
    const { getByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )
    expect(getByText('cd.serviceDashboard.instanceId:')!).toBeInTheDocument()
    expect(getByText('pipeline.artifactTriggerConfigPanel.artifact:')!).toBeInTheDocument()
    expect(getByText('cd.serviceDashboard.strategy:')!).toBeInTheDocument()
    expect(getByText('cd.serviceDashboard.bgEnv:')!).toBeInTheDocument()
    expect(getByText('i-0cdf780d3e0d03e83')!).toBeInTheDocument()
    expect(getByText('AWS AMI ssh 7999')!).toBeInTheDocument()
    expect(getByText('blue-green')!).toBeInTheDocument()
    expect(getByText('Prod')!).toBeInTheDocument()
  })
  test('should render instances info for Asg service deployment type for canary', () => {
    jest
      .spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds')
      .mockImplementation(() => mockServiceInstanceDetailsForAsgCanaryDeployment as any)
    const { getByText, queryByText } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )
    expect(getByText('cd.serviceDashboard.instanceId:')!).toBeInTheDocument()
    expect(getByText('pipeline.artifactTriggerConfigPanel.artifact:')!).toBeInTheDocument()
    expect(getByText('cd.serviceDashboard.strategy:')!).toBeInTheDocument()
    expect(queryByText('cd.serviceDashboard.bgEnv:')!).toBeFalsy()
    expect(getByText('i-0cdf780d3e0d03e83')!).toBeInTheDocument()
    expect(getByText('AWS AMI ssh 7999')!).toBeInTheDocument()
    expect(getByText('canary')!).toBeInTheDocument()
  })
})
