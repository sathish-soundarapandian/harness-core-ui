/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Error, Failure, ExecutionResponseDeploymentsStatsOverview } from 'services/dashboard-service'

const deploymentStatsResponse = {
  deploymentsStatsSummary: {
    countAndChangeRate: { count: 7, countChangeAndCountChangeRateInfo: { countChange: 0, countChangeRate: 0.0 } },
    failureRateAndChangeRate: { rate: 28.571428571428573, rateChangeRate: 0.0 },
    deploymentRateAndChangeRate: { rate: 0.23333333333333334, rateChangeRate: 0.0 },
    deploymentStats: [
      {
        time: 1633651200000,
        countWithSuccessFailureDetails: {
          count: 1,
          successCount: 0,
          failureCount: 1
        }
      },
      {
        time: 1633910400000,
        countWithSuccessFailureDetails: {
          count: 2,
          successCount: 2,
          failureCount: 0
        }
      },
      {
        time: 1633996800000,
        countWithSuccessFailureDetails: {
          count: 1,
          successCount: 1,
          failureCount: 0
        }
      },
      {
        time: 1634083200000,
        countWithSuccessFailureDetails: {
          count: 3,
          successCount: 2,
          failureCount: 1
        }
      }
    ]
  },
  mostActiveServicesList: {
    activeServices: [
      {
        serviceInfo: { serviceName: 'svc1', serviceIdentifier: 'svc1' },
        projectInfo: { projectIdentifier: 'ishant_test', projectName: 'ishant test' },
        orgInfo: { orgIdentifier: 'default', orgName: 'Default' },
        accountInfo: { accountIdentifier: 'kmpySmUISimoRrJL6NL73w' },
        countWithSuccessFailureDetails: {
          count: 5,
          countChangeAndCountChangeRateInfo: { countChange: 0, countChangeRate: 0.0 },
          successCount: 4,
          failureCount: 1
        }
      }
    ]
  }
}

export const deploymentStatsSummaryResponse: {
  data: ExecutionResponseDeploymentsStatsOverview
  error: Error | Failure | undefined
  loading: boolean
} = {
  error: undefined,
  loading: false,
  data: {
    response: {
      deploymentsOverview: {
        runningExecutions: [],
        pendingApprovalExecutions: [],
        pendingManualInterventionExecutions: [],
        failed24HrsExecutions: []
      },
      ...deploymentStatsResponse
    },
    executionStatus: 'SUCCESS',
    executionMessage: 'Successfully fetched data'
  }
}

export const noDeploymentData: {
  data: ExecutionResponseDeploymentsStatsOverview
  error: Error | Failure | undefined
  loading: boolean
} = {
  error: undefined,
  loading: false,
  data: {
    response: {
      deploymentsOverview: {
        runningExecutions: [],
        pendingApprovalExecutions: [],
        pendingManualInterventionExecutions: [],
        failed24HrsExecutions: []
      },
      deploymentsStatsSummary: {
        countAndChangeRate: { count: 0, countChangeAndCountChangeRateInfo: { countChange: 0, countChangeRate: 0.0 } },
        failureRateAndChangeRate: { rate: 0, rateChangeRate: 0.0 },
        deploymentRateAndChangeRate: { rate: 0, rateChangeRate: 0.0 },
        deploymentStats: []
      },
      mostActiveServicesList: {
        activeServices: []
      }
    },
    executionStatus: 'SUCCESS',
    executionMessage: 'Successfully fetched data'
  }
}

export const deploymentStatsSummaryWithOverviewResponse = {
  status: 'SUCCESS',
  data: {
    response: {
      deploymentsOverview: {
        runningExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'pipwithenvoverride',
              pipelineIdentifier: 'pipwithenvoverride'
            },
            projectInfo: {
              projectIdentifier: 'test1',
              projectName: 'test1'
            },
            orgInfo: {
              orgIdentifier: 'default',
              orgName: 'default'
            },
            accountInfo: {
              accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw'
            },
            planExecutionId: 'jVYFTPFkR4yv5IjOra9m-A',
            startTs: 1670849558369
          },
          {
            pipelineInfo: {
              pipelineName: 'Triggers - 2',
              pipelineIdentifier: 'Triggers_2'
            },
            projectInfo: {
              projectIdentifier: 'test2',
              projectName: 'test2'
            },
            orgInfo: {
              orgIdentifier: 'default',
              orgName: 'default'
            },
            accountInfo: {
              accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw'
            },
            planExecutionId: '6SMlruHPRl2Rzhuw7JP-LA',
            startTs: 1665166801126
          },
          {
            pipelineInfo: {
              pipelineName: 'Triggers - 2',
              pipelineIdentifier: 'Triggers_2'
            },
            projectInfo: {
              projectIdentifier: 'test2',
              projectName: 'test2'
            },
            orgInfo: {
              orgIdentifier: 'default',
              orgName: 'default'
            },
            accountInfo: {
              accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw'
            },
            planExecutionId: 'AjWas2yRReWoX1bncorSWg',
            startTs: 1665319801356
          }
        ],
        pendingApprovalExecutions: [],
        pendingManualInterventionExecutions: [],
        failed24HrsExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'bug-trigger-update-after-pipeline-update',
              pipelineIdentifier: 'bugtriggerupdateafterpipelineupdate'
            },
            projectInfo: {
              projectIdentifier: 'testname',
              projectName: 'testname'
            },
            orgInfo: {
              orgIdentifier: 'default',
              orgName: 'default'
            },
            accountInfo: {
              accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw'
            },
            planExecutionId: 'xyTsxDgUSLaiK3baCcK9AQ',
            startTs: 1671292203048
          }
        ]
      },
      ...deploymentStatsResponse
    },
    executionStatus: 'SUCCESS',
    executionMessage: 'Successfully fetched data'
  },
  metaData: null,
  correlationId: null
}
