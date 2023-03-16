/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ResponseDashboardWorkloadDeploymentV2,
  ResponsePageServiceResponse,
  ResponseServiceDeploymentListInfoV2,
  ResponseServiceDetailsInfoDTOV2
} from 'services/cd-ng'

export const mostActiveServiceInfo: ResponseDashboardWorkloadDeploymentV2 = {
  data: {
    workloadDeploymentInfoList: [
      {
        serviceName: 'aws-service-test',
        serviceId: 'awsservicetest',
        lastExecuted: {
          startTime: 1676014076123,
          endTime: 1676014098086,
          deploymentType: 'Ssh',
          status: 'SUCCESS',
          authorInfo: {
            name: 'automation ng',
            url: undefined
          },
          triggerType: 'MANUAL'
        },
        deploymentTypeList: ['Ssh', 'WinRm', 'Kubernetes'],
        totalDeployments: 3,
        totalDeploymentChangeRate: {
          percentChange: 84.21052631578948,
          trend: 'DOWN_TREND'
        },
        percentSuccess: 100,
        rateSuccess: {
          percentChange: 50,
          trend: 'DOWN_TREND'
        },
        failureRate: 0,
        failureRateChangeRate: {
          percentChange: 100,
          trend: 'DOWN_TREND'
        },
        frequency: 0.0967741935483871,
        frequencyChangeRate: {
          percentChange: 84.21052631578947,
          trend: 'DOWN_TREND'
        },
        lastPipelineExecutionId: '63e5f0b6e342511cc75c0e2d',
        workload: [
          {
            date: 1674864000000,
            execution: {
              count: 0
            }
          },
          {
            date: 1674950400000,
            execution: {
              count: 0
            }
          },
          {
            date: 1675036800000,
            execution: {
              count: 0
            }
          }
        ]
      }
    ]
  }
}

export const deploymentsInfo: ResponseServiceDeploymentListInfoV2 = {
  status: 'SUCCESS',
  data: {
    startTime: 1623149323912,
    endTime: 1625741323912,
    totalDeployments: 57,
    failureRate: 24.2,
    frequency: 324.2,
    failureRateChangeRate: {
      percentChange: 45.7,
      trend: 'UP_TREND'
    },
    totalDeploymentsChangeRate: {
      percentChange: 34.4,
      trend: 'UP_TREND'
    },
    frequencyChangeRate: {
      percentChange: 23.2,
      trend: 'UP_TREND'
    },
    serviceDeploymentList: [{ time: 1625443200000, deployments: { total: 0, success: 0, failure: 0 } }]
  },
  metaData: undefined,
  correlationId: 'deaf3a4d-161b-4d64-a77d-5be92b7cf41b'
}

export const envBuildInstanceCount = {
  status: 'SUCCESS',
  data: {
    envBuildIdAndInstanceCountInfoList: [
      {
        envId: 'env1',
        envName: 'envName',
        buildIdAndInstanceCountList: [{ buildId: 'build1', count: 1 }]
      }
    ]
  }
}

export const serviceDetails: ResponseServiceDetailsInfoDTOV2 = {
  status: 'SUCCESS',
  data: {
    serviceDeploymentDetailsList: [
      {
        serviceName: 'asdfasdf',
        serviceIdentifier: 'asdfasdf',
        deploymentTypeList: undefined,
        totalDeployments: 0,
        totalDeploymentChangeRate: {
          percentChange: 0,
          trend: 'NO_CHANGE'
        },
        successRate: 0.0,
        successRateChangeRate: {
          percentChange: 0,
          trend: 'NO_CHANGE'
        },
        failureRate: 0.0,
        failureRateChangeRate: {
          percentChange: 0,
          trend: 'NO_CHANGE'
        },
        frequency: 0.0,
        frequencyChangeRate: {
          percentChange: 0,
          trend: 'NO_CHANGE'
        },
        instanceCountDetails: undefined,
        lastPipelineExecuted: undefined
      },

      {
        serviceName: 'service one',
        serviceIdentifier: 'service_one',
        description: '',
        tags: { type: 'dummy' },
        deploymentTypeList: ['Kubernetes'],
        totalDeployments: 3,
        totalDeploymentChangeRate: {
          percentChange: 1,
          trend: 'UP_TREND'
        },
        successRate: 1,
        successRateChangeRate: {
          percentChange: 1,
          trend: 'UP_TREND'
        },
        failureRate: 1,
        failureRateChangeRate: {
          percentChange: 1,
          trend: 'UP_TREND'
        },
        frequency: 1,
        frequencyChangeRate: {
          percentChange: 0,
          trend: 'NO_CHANGE'
        },
        instanceCountDetails: undefined,
        lastPipelineExecuted: {
          pipelineExecutionId: '60c99de2a6187a57e841993b',
          identifier: 'Test',
          name: 'Test',
          status: 'SUCCESS',
          lastExecutedAt: 1523825890218,
          planExecutionId: 'nDo66l1JRNumvjObZpOKlQ'
        }
      }
    ]
  }
}

export const serviceInstances = {
  serviceCount: 10,
  serviceGrowthTrendData: {},
  serviceInstancesCount: 20,
  prodCount: 10,
  nonProdCount: 10
}

export const serviceCard = {
  data: {
    createdAt: 1644648631847,
    lastModifiedAt: 1644648631847,
    service: {
      accountId: 'kmpySmUISimoRrJL6NL73w',
      deleted: false,
      description: '',
      identifier: 'jjn',
      name: 'hmk',
      orgIdentifier: 'default',
      projectIdentifier: 'Test_Yunus',
      tags: { run: 'jj' },
      version: 1
    }
  }
}

export const environmentModal = {
  isEdit: false,
  isEnvironment: true,
  data: {
    accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
    orgIdentifier: 'default',
    projectIdentifier: 'asdasd',
    identifier: 'qa',
    name: 'qa',
    description: 'Decription mock',
    color: '#0063F7',
    deleted: false,
    tags: { asd: '' },
    version: 1
  },
  onCreateOrUpdate: jest.fn()
}

export const serviceListResponse: ResponsePageServiceResponse | null = {
  correlationId: '0655d280-1804-4935-91b1-ffdc733a7eb9',
  data: {
    content: [
      {
        createdAt: 1644951149242,
        lastModifiedAt: 1644951149242,
        service: {
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          deleted: false,
          description: '',
          identifier: 'dfg',
          name: 'dfg',
          orgIdentifier: 'default',
          projectIdentifier: 'Jira',
          tags: {}
        }
      }
    ],
    empty: false,
    pageIndex: 0,
    pageItemCount: 1,
    pageSize: 50,
    totalItems: 1,
    totalPages: 1
  },
  status: 'SUCCESS'
}

export const serviceListResponseWithoutIdentifier: ResponsePageServiceResponse | null = {
  correlationId: '0655d280-1804-4935-91b1-ffdc733a7eb9',
  data: {
    content: [
      {
        createdAt: 1644951149242,
        lastModifiedAt: 1644951149242,
        service: {
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          deleted: false,
          description: '',
          name: 'dfg',
          orgIdentifier: 'default',
          projectIdentifier: 'Jira',
          tags: {}
        }
      }
    ],
    empty: false,
    pageIndex: 0,
    pageItemCount: 1,
    pageSize: 50,
    totalItems: 1,
    totalPages: 1
  },
  status: 'SUCCESS'
}

export const serviceModal = {
  isEdit: false,
  isService: true,
  data: {
    accountId: 'kmpySmUISimoRrJL6NL73w',
    deleted: false,
    description: 'Descrip',
    identifier: 'Test_13',
    name: 'Test 13',
    orgIdentifier: 'default',
    projectIdentifier: 'defaultproject',
    tags: {},
    version: 1
  },
  onCreateOrUpdate: jest.fn()
}

export const serviceRow = {
  row: {
    original: {
      accountId: 'kmpySmUISimoRrJL6NL73w',
      deleted: false,
      description: 'Descrip',
      identifier: 'Test_13',
      name: 'Test 13',
      orgIdentifier: 'default',
      projectIdentifier: 'defaultproject',
      tags: {},
      version: 1
    }
  }
}
