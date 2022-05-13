/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import ServiceStudio from '@cd/components/Services/ServiceStudio/ServiceStudio'

jest.mock('highcharts-react-official', () => () => <></>)
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})
jest.spyOn(cdngServices, 'useGetServiceV2').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
  return {
    mutate: () => Promise.resolve({ loading: true, data: [] })
  } as any
})

jest.spyOn(cdngServices, 'useGetEnvArtifactDetailsByServiceId').mockImplementation(() => {
  return {
    mutate: () => Promise.resolve({ loading: false, data: [] })
  } as any
})

jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetInstanceCountHistory').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetDeploymentsByServiceId').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetServiceHeaderInfo').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

describe('ServiceStudio', () => {
  test('should render ServiceStudio', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceStudio />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
