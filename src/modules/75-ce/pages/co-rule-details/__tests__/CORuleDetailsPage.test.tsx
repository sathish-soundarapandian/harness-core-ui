/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ResponsePageUserAggregate } from 'services/cd-ng'
import * as lwServices from 'services/lw'
import CORuleDetailsPage from '../CORuleDetailsPage'

jest.mock('highcharts-react-official', () => () => <div />)

const mockService = {
  id: 1,
  name: 'test rule',
  fulfilment: 'ondemand',
  kind: 'instance',
  cloud_account_id: 'Non_prod_old',
  idle_time_mins: 5,
  host_name: 'dummy',
  custom_domains: null,
  match_all_subdomains: false,
  disabled: false,
  created_by: '123',
  updated_at: 1660058438270,
  routing: {
    instance: {
      filter_text: "id = ['i-79asd698879']",
      scale_group: null
    }
  },
  health_check: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    id: '',
    status_code_from: 200,
    status_code_to: 299
  },
  opts: {
    preserve_private_ip: false,
    delete_cloud_resources: false,
    always_use_private_ip: false,
    access_details: {
      backgroundTasks: {
        selected: false
      },
      dnsLink: {
        selected: false
      },
      ipaddress: {
        selected: false
      },
      rdp: {
        selected: false
      },
      ssh: {
        selected: true
      }
    },
    hide_progress_page: false,
    dry_run: false
  },
  metadata: {
    target_group_details: null,
    access_details: null,
    cloud_provider_details: {
      name: 'Non prod old'
    },
    service_errors: null,
    kubernetes_connector_id: '',
    health_check_details: null,
    custom_domain_providers: null,
    port_config: null,
    instance_filters: {
      Name: '',
      IDs: ['i-09789csgi890'],
      Tags: null,
      Regions: null,
      ResourceGroups: null,
      VpcID: '',
      Zones: null,
      AttrInclFilter: null
    },
    dns_mapping_to_retain: null
  },
  access_point_id: null,
  status: 'created',
  account_identifier: 'acc'
}

const mockConnector = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'Sample',
      identifier: 'Sample',
      description: '',
      orgIdentifier: null,
      projectIdentifier: null,
      tags: { connector: 'dx' },
      type: 'CEAws',
      spec: {}
    },
    status: null,
    harnessManaged: false
  },
  metaData: null,
  correlationId: 'Sample'
}

const mockedRouteDetailsResponseData = {
  deps: null,
  service: mockService
}

const mockUserServiceResponse: ResponsePageUserAggregate = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        user: {
          name: 'abc',
          email: 'abc@harness.io',
          uuid: '123',
          locked: false
        },
        roleAssignmentMetadata: [
          {
            identifier: 'role_assignment_vawmAV0YuQ9HlxmljpAu',
            roleIdentifier: '_account_admin',
            roleName: 'Account Admin',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: false
          },
          {
            identifier: 'role_assignment_obm6QvdxtfqrlDzug31t',
            roleIdentifier: '_account_viewer',
            roleName: 'Account Viewer',
            resourceGroupIdentifier: '_all_account_level_resources',
            resourceGroupName: 'All Resources',
            managedRole: true,
            managedRoleAssignment: true
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: ''
}

const mockHealthData = {
  state: 'active',
  target_url: '100.24.20.134',
  error: '',
  id: ''
}

const mockObj = { response: { id: 'mock', name: 'dummyAccessPoint' } }

const mockResources = [
  {
    id: 'i-0shue780',
    name: 'dummyInstance',
    region: 'us-east-1',
    availability_zone: 'us-east-1a',
    status: 'stopped',
    type: 't2.micro',
    launch_time: '2022-07-13T11:11:02Z',
    ipv4: null,
    private_ipv4: ['1.2.3.4'],
    tags: {
      Name: 'warmupsource'
    },
    resource_type: 'instance',
    provider_name: 'AWS',
    is_spot: false,
    is_managed: false,
    platform: 'Linux',
    cloud_account_id: 0,
    provider_type: 'aws',
    cloud_connector_id: 'Non_prod_old',
    account_identifier: 'acc',
    user_data: null,
    is_cluster: false
  }
]

const mockSavingsData = [
  {
    service_id: 0,
    potential_cost: 14.975999999999827,
    actual_cost: 2.5551461956799995,
    actual_savings: 12.420853804319828,
    savings_percentage: 82.93839345833314,
    usage_date: '2022-08-02T00:00:00Z',
    idle_hours: 19.905214429999724,
    actual_hours: 4.094785569999999
  },
  {
    service_id: 0,
    potential_cost: 14.975999999999827,
    actual_cost: 14.975999999999827,
    actual_savings: 0,
    savings_percentage: 0,
    usage_date: '2022-08-03T00:00:00Z',
    idle_hours: 0,
    actual_hours: 23.999999999999723
  }
]

const mockedData = [
  {
    id: 3991,
    service_id: 22,
    state: 'coolingdown',
    message: null,
    error: null,
    created_at: '2021-04-05T13:14:58.857084Z'
  },
  {
    id: 3991,
    service_id: 22,
    state: 'coolingdown',
    message: null,
    error: 'Error: null',
    created_at: '2021-04-05T13:14:58.857084Z'
  },
  {
    id: 3991,
    service_id: 22,
    state: 'active',
    message: null,
    error: null,
    created_at: '2021-04-05T13:14:58.857084Z'
  }
]

jest.mock('services/lw', () => ({
  useRouteDetails: jest.fn().mockImplementation(() => ({
    data: { response: mockedRouteDetailsResponseData },
    loading: false,
    refetch: jest.fn()
  })),
  useDeleteService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useToggleAutostoppingRule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useHealthOfService: jest.fn().mockImplementation(() => ({
    refetch: jest.fn(),
    data: { response: mockHealthData }
  })),
  useGetAccessPoint: jest.fn().mockImplementation(() => ({ data: mockObj, loading: false })),
  useAllServiceResources: jest.fn().mockImplementation(() => ({
    data: { response: mockResources }
  })),
  useSavingsOfService: jest.fn().mockImplementation(() => ({
    data: { response: mockSavingsData },
    refetch: jest.fn(),
    loading: false
  })),
  useLogsOfService: jest.fn().mockImplementation(() => ({ data: { response: mockedData }, loading: false })),
  useSaveService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useListStaticSchedules: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    refetch: jest.fn(() => Promise.resolve({ response: {} }))
  })),
  useDeleteStaticSchedule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useCreateStaticSchedules: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({
    data: mockConnector,
    loading: false,
    refetch: jest.fn()
  })),
  useGetAggregatedUsers: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => mockUserServiceResponse)
  }))
}))

describe('Rule details page tests', () => {
  test('should render successfully', async () => {
    const { container } = render(
      <TestWrapper
        path={'/account/:accountId/ce/autostopping-rules/rule/:ruleId'}
        pathParams={{
          accountId: 'accountId',
          ruleId: '1'
        }}
      >
        <CORuleDetailsPage />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('render page for disabled rule successfully', async () => {
    const servicesSpy = jest.spyOn(lwServices, 'useRouteDetails')
    const disabledService = {
      ...mockedRouteDetailsResponseData,
      service: { ...mockedRouteDetailsResponseData.service, disabled: true }
    }
    servicesSpy.mockImplementation(
      () =>
        ({
          data: {
            response: disabledService
          },
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    const { getAllByText } = render(
      <TestWrapper
        path={'/account/:accountId/ce/autostopping-rules/rule/:ruleId'}
        pathParams={{
          accountId: 'accountId',
          ruleId: '1'
        }}
      >
        <CORuleDetailsPage />
      </TestWrapper>
    )
    await waitFor(() => {
      const disableLabel = getAllByText('ce.common.disabled')[0]
      expect(disableLabel).toBeDefined()
    })
  })

  test('render page loader while fetching the rule details', async () => {
    const servicesSpy = jest.spyOn(lwServices, 'useRouteDetails')
    servicesSpy.mockImplementation(
      () =>
        ({
          data: null,
          loading: true,
          refetch: jest.fn()
        } as any)
    )
    const { getAllByText } = render(
      <TestWrapper
        path={'/account/:accountId/ce/autostopping-rules/rule/:ruleId'}
        pathParams={{
          accountId: 'accountId',
          ruleId: '1'
        }}
      >
        <CORuleDetailsPage />
      </TestWrapper>
    )
    await waitFor(() => {
      const loader = getAllByText('Loading, please wait...')[0]
      expect(loader).toBeDefined()
    })
  })
})
