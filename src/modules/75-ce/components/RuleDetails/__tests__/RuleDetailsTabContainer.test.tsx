/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Service } from 'services/lw'
import type { ConnectorInfoDTO } from 'services/ce'
import RuleDetailsTabContainer from '../RuleDetailsTabContainer'

const mockService: Service = {
  id: 1,
  name: 'test rule',
  org_id: '',
  fulfilment: 'ondemand',
  kind: 'instance',
  cloud_account_id: 'Non_prod_old',
  idle_time_mins: 5,
  host_name: 'dummy',
  match_all_subdomains: false,
  disabled: false,
  created_by: '123',
  routing: {
    instance: {
      filter_text: "id = ['i-79asd698879']"
    },
    ports: [
      {
        action: 'Redirect',
        port: 80,
        protocol: 'http',
        target_port: 80,
        target_protocol: 'http'
      }
    ]
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
    cloud_provider_details: {
      name: 'Non prod old'
    },
    kubernetes_connector_id: ''
  },
  status: 'created',
  account_identifier: 'acc'
}

const mockHealthData = {
  state: 'active',
  target_url: '100.24.20.134',
  error: '',
  id: ''
}

const mockConnector = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'Sample',
      identifier: 'Sample',
      description: '',
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
    ipv4: ['10.20.30.40'],
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

const mockDeps = [
  {
    delay_secs: 10,
    dep_id: 1,
    service_id: 123
  }
]

jest.mock('services/lw', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({
    loading: false,
    data: mockConnector
  })),
  useSaveService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve({ response: {} }))
  })),
  useListStaticSchedules: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false,
    refetch: jest.fn()
  })),
  useDeleteStaticSchedule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useCreateStaticSchedules: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

describe('rule details tab', () => {
  const renderComponent = () =>
    render(
      <TestWrapper>
        <RuleDetailsTabContainer
          service={mockService}
          healthStatus={mockHealthData.state}
          refetchHealthStatus={jest.fn()}
          connectorData={mockConnector.data.connector as ConnectorInfoDTO}
          accessPointData={mockObj.response}
          resources={mockResources}
          setService={jest.fn()}
          dependencies={mockDeps}
        />
      </TestWrapper>
    )
  test('should open resources table on expand', async () => {
    const { container, getByText } = renderComponent()

    act(() => {
      fireEvent.click(getByText('ce.common.expand'))
      expect(container.querySelector('table[role="table"]')).toBeDefined()
    })
  })

  test('toggle options', () => {
    const { getByTestId } = renderComponent()
    const progressPageToggle = getByTestId('progressPageViewToggle')
    const dryRunToggle = getByTestId('dryRunToggle')
    act(() => {
      fireEvent.click(progressPageToggle)
      fireEvent.click(dryRunToggle)
      expect(progressPageToggle.querySelector('input[type="checkbox"]') as HTMLInputElement).toBeTruthy()
      expect(dryRunToggle.querySelector('input[type="checkbox"]') as HTMLInputElement).toBeTruthy()
    })
  })
})
