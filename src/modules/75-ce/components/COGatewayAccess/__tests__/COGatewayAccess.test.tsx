/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import * as lwService from 'services/lw'
import { TestWrapper } from '@common/utils/testUtils'
import COGatewayAccess from '../COGatewayAccess'
import { mockedSecurityGroupResponse } from './data'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const accessDetails = {
  dnsLink: { selected: false },
  ssh: { selected: false },
  rdp: { selected: false },
  backgroundTasks: { selected: false },
  ipaddress: { selected: false }
}

const initialGatewayDetails = {
  name: 'mockname',
  cloudAccount: {
    id: '',
    name: ''
  },
  idleTimeMins: 15,
  fullfilment: '',
  filter: '',
  kind: 'instance',
  orgID: 'orgIdentifier',
  projectID: 'projectIdentifier',
  accountID: 'accountId',
  hostName: '',
  customDomains: [],
  matchAllSubdomains: false,
  disabled: false,
  routing: {
    instance: {
      filterText: ''
    },
    lb: '',
    ports: []
  },
  healthCheck: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30
  },
  opts: {
    preservePrivateIP: false,
    deleteCloudResources: false,
    alwaysUsePrivateIP: false,
    access_details: accessDetails, // eslint-disable-line
    hide_progress_page: false
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
  accessPointID: '',
  metadata: {
    // security_groups: [], // eslint-disable-line
  },
  deps: []
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

jest.mock('services/lw', () => ({
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
  useSecurityGroupsOfInstances: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve({ response: mockedSecurityGroupResponse })),
    loading: false
  })),
  useDescribeServiceInContainerServiceCluster: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false
  }))
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Testing COGatewayAccess', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
          allServices={[]}
          serverNames={[]}
          setServerNames={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('DNS checkbox checks succesfully', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
          allServices={[]}
          serverNames={[]}
          setServerNames={jest.fn()}
        />
      </TestWrapper>
    )
    const dnsCheckBox = container.querySelector('#DNSLink') as HTMLInputElement
    expect(dnsCheckBox).toBeDefined()
    fireEvent.click(dnsCheckBox)
    await waitFor(() => {
      expect(dnsCheckBox.checked).toBe(true)
    })
    expect(container).toMatchSnapshot()
  })

  test('SSH checkbox checks succesfully and download os ssh file', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
          allServices={[]}
          serverNames={[]}
          setServerNames={jest.fn()}
        />
      </TestWrapper>
    )
    const sshCheckBox = container.querySelector('#ssh') as HTMLInputElement
    expect(sshCheckBox).toBeDefined()
    fireEvent.click(sshCheckBox)
    await waitFor(() => {
      expect(sshCheckBox.checked).toBe(true)
    })
    const sshTab = await findByText(container, 'ce.co.gatewayAccess.sshRdp')
    act(() => {
      fireEvent.click(sshTab)
    })
    expect(container).toMatchSnapshot()

    const osDropdown = container.querySelector('input[name="sshOs"]') as HTMLInputElement
    const osCaret = container
      .querySelector(`input[name="sshOs"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(osCaret!)
    })
    const osToSelect = await findByText(container, 'Mac (amd64)')
    act(() => {
      fireEvent.click(osToSelect)
    })
    expect(osDropdown.value).toBe('Mac (amd64)')

    const downloadBtn = await findByText(container, 'ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.download')
    act(() => {
      fireEvent.click(downloadBtn)
    })
  })

  test('render yaml editor for k8s rule', async () => {
    const mockedYamlData = {
      apiVersion: 'lightwing.lightwing.io/v1',
      kind: 'AutoStoppingRule',
      metadata: {
        annotations: {},
        name: 'test-rule-ry5',
        namespace: 'default'
      },
      spec: {
        rules: [
          {
            http: {
              paths: [
                {
                  backend: {
                    service: {
                      name: 'frontend',
                      port: {
                        number: 80
                      }
                    }
                  },
                  path: '/ry-test',
                  pathType: 'Prefix'
                }
              ]
            }
          }
        ]
      },
      status: {}
    }
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={{
            ...initialGatewayDetails,
            kind: 'k8s',
            routing: {
              ...initialGatewayDetails.routing,
              k8s: {
                RuleJson: JSON.stringify(mockedYamlData),
                ConnectorID: 't1',
                Namespace: 'default'
              }
            }
          }}
          allServices={[]}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
          serverNames={[]}
          setServerNames={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('k8s rule setup access screen')
  })

  test('render nothing in case of ecs response with no load balancer', async () => {
    jest.spyOn(lwService, 'useDescribeServiceInContainerServiceCluster').mockImplementation(
      () =>
        ({
          data: { response: { loadbalanced: false } },
          loading: false
        } as any)
    )

    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
          allServices={[]}
          serverNames={[]}
          setServerNames={jest.fn()}
        />
      </TestWrapper>
    )

    const emptyPageText = await findByText(container, 'ce.co.autoStoppingRule.setupAccess.noSetupRequired')
    expect(emptyPageText).toBeDefined()
  })
})
