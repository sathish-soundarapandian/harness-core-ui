/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, getAllByText, getByText, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ASRuleTabs } from '@ce/constants'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import COGatewayDetails from '../COGatewayDetails'

const accessDetails = {
  dnsLink: { selected: false },
  ssh: { selected: false },
  rdp: { selected: false },
  backgroundTasks: { selected: false },
  ipaddress: { selected: false }
}

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const initialGatewayDetails = {
  name: 'mockname',
  cloudAccount: {
    id: 'caId',
    name: 'caName'
  },
  idleTimeMins: 15,
  fullfilment: 'ondemand',
  filter: '',
  kind: 'instance',
  orgID: 'orgIdentifier',
  projectID: 'projectIdentifier',
  accountID: 'accountId',
  hostName: 'hostname.lw.in',
  customDomains: [],
  matchAllSubdomains: false,
  disabled: false,
  routing: {
    instance: {
      filterText: '[tags]\nlwrule = "rnein1fdx1xrpze20zzgn"'
    },
    lb: '',
    ports: [
      {
        id: 'id1',
        protocol: 'http',
        target_protocol: 'http',
        port: 80,
        target_port: 80,
        server_name: '',
        action: 'forward',
        redirect_url: '',
        routing_rules: []
      },
      {
        id: 'id2',
        protocol: 'https',
        target_protocol: 'https',
        port: 443,
        target_port: 443,
        server_name: '',
        action: 'forward',
        redirect_url: '',
        routing_rules: []
      }
    ]
  },
  healthCheck: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    interval: 90
  },
  opts: {
    preservePrivateIP: false,
    deleteCloudResources: false,
    alwaysUsePrivateIP: false,
    hide_progress_page: false,
    access_details: accessDetails // eslint-disable-line
  },
  provider: {
    name: 'AWS',
    value: 'aws',
    icon: 'service-aws'
  },
  selectedInstances: [
    {
      id: '1',
      ipv4: '',
      launch_time: '', // eslint-disable-line
      name: '',
      region: 'us-east-2',
      status: 'stopped',
      tags: '',
      type: 't2.micro',
      vpc: 'vpc-4e233426'
    }
  ],
  accessPointID: 'mock.com',
  metadata: {
    security_groups: [], // eslint-disable-line
    cloud_provider_details: { name: 'cpName' },
    target_group_details: {
      '80': 'tg',
      '443': 'tg'
    }
  },
  deps: []
}

const rdsGatewayDetails = {
  id: 480,
  name: 'RDS Test 1',
  idleTimeMins: 10,
  fullfilment: 'ondemand',
  orgID: 'orgIdentifier',
  projectID: 'projectIdentifier',
  filter: '',
  kind: 'database',
  healthCheck: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    id: '',
    status_code_from: 200,
    status_code_to: 299
  },
  hostName: 'enjoyed-catfish-c852ctqqejqm0186kq40.test.io',
  routing: {
    database: {
      id: 'database-3-rdstest',
      region: 'us-east-1'
    },
    instance: {},
    lb: '',
    ports: []
  },
  opts: {
    preservePrivateIP: false,
    deleteCloudResources: false,
    alwaysUsePrivateIP: false,
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
        selected: false
      }
    },
    hide_progress_page: false,
    dry_run: false
  },
  provider: {
    name: 'AWS',
    value: 'aws',
    icon: 'service-aws'
  },
  selectedInstances: [],
  accessPointID: null,
  accountID: 'acc1',
  cloudAccount: {
    id: 'Lightwing_Non_prod_old',
    name: 'Lightwing Non prod old'
  },
  metadata: {
    target_group_details: null,
    access_details: null,
    cloud_provider_details: {
      name: 'Lightwing Non prod old'
    },
    service_errors: null,
    kubernetes_connector_id: '',
    health_check_details: null,
    custom_domain_providers: null,
    port_config: null,
    dns_mapping_to_retain: null
  },
  deps: [],
  schedules: []
}

const mockAccessPointList = {
  response: [
    {
      name: 'mock.com',
      id: 'mock.com',
      metadata: {
        albArn: 'mockalbARN'
      }
    }
  ]
}
const mockedHostedZonesData = {
  data: {
    response: [{ id: 'route53mock.com', name: 'route53mock.com' }]
  },
  loading: false,
  refetch: jest.fn(() => Promise.resolve({ data: { response: [{ id: 'route53mock.com', name: 'route53mock.com' }] } }))
}

const mockAccessPointResourceData = {
  response: [
    {
      details: {
        albARN: 'mockalbARN',
        name: 'mockALBname'
      }
    }
  ]
}

const mockedFetchRuleResponse = {
  response: {
    records: [],
    total: 0,
    pages: 1
  },
  loading: false
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(() => true),
  useFeatureFlags: jest.fn(() => ({}))
}))

jest.mock('services/lw', () => ({
  useSaveService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve({}))
  })),
  useFetchRules: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(mockedFetchRuleResponse)
  })),
  useAllResourcesOfAccount: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    loading: false
  })),
  useGetAllASGs: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    loading: false
  })),
  useGetServices: jest.fn().mockImplementation(() => ({ data: null, loading: false, error: null })),
  useSecurityGroupsOfInstances: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    loading: false
  })),
  useListAccessPoints: jest.fn().mockImplementation(() => ({
    data: mockAccessPointList,
    loading: false,
    refetch: jest.fn(() => mockAccessPointList)
  })),
  useAllHostedZones: jest.fn().mockImplementation(() => mockedHostedZonesData),
  useAccessPointResources: jest.fn().mockImplementation(() => ({
    data: mockAccessPointResourceData,
    loading: false,
    refetch: jest.fn(() => mockAccessPointResourceData)
  })),
  useCreateAccessPoint: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useDescribeServiceInContainerServiceCluster: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false
  })),
  useCreateStaticSchedules: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useDeleteStaticSchedule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useToggleRuleMode: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve())
  }))
}))

describe('Test GatewayDetails', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayDetails
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          previousTab={jest.fn()}
          isEditFlow={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders setup access screen', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayDetails
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          previousTab={jest.fn()}
          isEditFlow={false}
        />
      </TestWrapper>
    )
    const nextBtn = getByText(container, 'next')
    expect(nextBtn).toBeDefined()
    act(() => {
      fireEvent.click(nextBtn)
    })
    expect(container).toMatchSnapshot()
  })

  test('renders setup access screen and move to previous step', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayDetails
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          previousTab={jest.fn()}
          isEditFlow={false}
        />
      </TestWrapper>
    )
    const nextBtn = getByText(container, 'next')
    expect(nextBtn).toBeDefined()
    act(() => {
      fireEvent.click(nextBtn)
    })
    expect(container).toMatchSnapshot()

    const prevBtn = getByText(container, 'Previous')
    expect(prevBtn).toBeDefined()
    act(() => {
      fireEvent.click(prevBtn)
    })
    expect(container).toMatchSnapshot()
  })

  // TODO: review the test after
  test('renders review screen', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayDetails
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          previousTab={jest.fn()}
          activeTab={ASRuleTabs.REVIEW}
          isEditFlow={false}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const editBtn = getAllByText(container, 'EDIT')[0]
    expect(editBtn).toBeDefined()
    act(() => {
      fireEvent.click(editBtn)
    })

    expect(container).toMatchSnapshot()
  })

  test('should save the rule', async () => {
    const setFn = jest.fn()
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayDetails
          gatewayDetails={rdsGatewayDetails as unknown as GatewayDetails}
          setGatewayDetails={setFn}
          previousTab={jest.fn()}
          isEditFlow={false}
        />
      </TestWrapper>
    )

    const nextBtn = getByText(container, 'next')
    expect(nextBtn).toBeDefined()
    act(() => {
      fireEvent.click(nextBtn)
    })

    await waitFor(() => {
      const step2NextBtn = getByText(container, 'next')
      expect(step2NextBtn).toBeDefined()
      act(() => {
        fireEvent.click(step2NextBtn)
      })
    })

    await waitFor(() => {
      const saveBtn = getByText(container, 'ce.co.autoStoppingRule.save')
      expect(saveBtn).toBeDefined()
      act(() => {
        fireEvent.click(saveBtn)
      })
    })

    await waitFor(() => expect(setFn).toHaveBeenCalled())
  })
})
