/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageServiceResponse } from 'services/cd-ng'

export const mostActiveServiceInfo = {
  data: {
    workloadDeploymentInfoList: [
      {
        serviceName: 'Service1',
        serviceId: 'Service1Id',
        totalDeployments: 100,
        totalSuccess: 37,
        totalFailure: 63,
        rateSuccess: 45.4,
        failureRateChangeRate: 600.2
      },
      {
        serviceName: 'Service2',
        serviceId: 'Service2Id',
        totalDeployments: 200,
        totalSuccess: 137,
        totalFailure: 163,
        rateSuccess: 435.4,
        failureRateChangeRate: 620.2
      }
    ]
  }
}

export const deploymentsInfo = {
  status: 'SUCCESS',
  data: {
    startTime: 1623149323912,
    endTime: 1625741323912,
    totalDeployments: 57,
    failureRate: 24.2,
    frequency: 324.2,
    failureRateChangeRate: 45.7,
    totalDeploymentsChangeRate: 34.4,
    frequencyChangeRate: 23.2,
    serviceDeploymentList: [{ time: 1625443200000, deployments: { total: 0, success: 0, failure: 0 } }]
  },
  metaData: null,
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

export const serviceDetails = {
  status: 'SUCCESS',
  data: {
    serviceDeploymentDetailsList: [
      {
        serviceName: 'asdfasdf',
        serviceIdentifier: 'asdfasdf',
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
      },

      {
        serviceName: 'service one',
        serviceIdentifier: 'service_one',
        description: '',
        tags: { type: 'dummy' },
        deploymentTypeList: ['Kubernetes'],
        totalDeployments: 3,
        totalDeploymentChangeRate: 1,
        successRate: 1,
        successRateChangeRate: 1,
        failureRate: 1,
        failureRateChangeRate: 1,
        frequency: 1,
        frequencyChangeRate: 0,
        instanceCountDetails: null,
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
