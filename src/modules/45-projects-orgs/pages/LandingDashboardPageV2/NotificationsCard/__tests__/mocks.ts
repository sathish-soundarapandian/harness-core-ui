/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Error, Failure, ExecutionResponseDeploymentsStatsOverview } from 'services/dashboard-service'

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
        runningExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'Delegate-qa-sanity',
              pipelineIdentifier: 'Delegateqasanity'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: 'uhR4u7bMSPmlLwwPxXBO-Q',
            startTs: 1670327255006
          }
        ],
        pendingApprovalExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          }
        ],
        pendingManualInterventionExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          }
        ],
        failed24HrsExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          }
        ]
      },
      deploymentsStatsSummary: {
        countAndChangeRate: { count: 7, countChangeAndCountChangeRateInfo: { countChange: 0, countChangeRate: 0.0 } },
        failureRateAndChangeRate: { rate: 28.571428571428573, rateChangeRate: 0.0 },
        deploymentRateAndChangeRate: { rate: 0.23333333333333334, rateChangeRate: 0.0 },
        deploymentStats: [
          {
            time: 1633651200000,
            countWithSuccessFailureDetails: {
              count: 1,
              // countChangeAndCountChangeRateInfo: null,
              successCount: 0,
              failureCount: 1
            }
          },
          {
            time: 1633910400000,
            countWithSuccessFailureDetails: {
              count: 2,
              // countChangeAndCountChangeRateInfo: null,
              successCount: 2,
              failureCount: 0
            }
          },
          {
            time: 1633996800000,
            countWithSuccessFailureDetails: {
              count: 1,
              // countChangeAndCountChangeRateInfo: null,
              successCount: 1,
              failureCount: 0
            }
          },
          {
            time: 1634083200000,
            countWithSuccessFailureDetails: {
              count: 3,
              // countChangeAndCountChangeRateInfo: null,
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
    },
    executionStatus: 'SUCCESS',
    executionMessage: 'Successfully fetched data'
  }
}

export const deploymentStatsWithMoreThenOneData: {
  data: ExecutionResponseDeploymentsStatsOverview
  error: Error | Failure | undefined
  loading: boolean
} = {
  error: undefined,
  loading: false,
  data: {
    response: {
      deploymentsOverview: {
        runningExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'Delegate-qa-sanity',
              pipelineIdentifier: 'Delegateqasanity'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: 'uhR4u7bMSPmlLwwPxXBO-Q',
            startTs: 1670327255006
          },
          {
            pipelineInfo: {
              pipelineName: 'PR Harness Env',
              pipelineIdentifier: 'PR_Harness_Env'
            },
            projectInfo: {
              projectIdentifier: 'PREQA_NG_Pipelines',
              projectName: 'PRE-QA NG Pipelines'
            },
            orgInfo: {
              orgIdentifier: 'default',
              orgName: 'default'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: 'hj6yf4IgRH6fDNJrmYXEUA',
            startTs: 1663660654374
          }
        ],
        pendingApprovalExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          },
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          }
        ],
        pendingManualInterventionExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          },
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          },
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          }
        ],
        failed24HrsExecutions: [
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          },
          {
            pipelineInfo: {
              pipelineName: 'PRE-QA-Merge-Develop-Master',
              pipelineIdentifier: 'PREQAMergeDevelopMaster'
            },
            projectInfo: {
              projectIdentifier: 'Quality_Assurence',
              projectName: 'Quality_Assurance'
            },
            orgInfo: {
              orgIdentifier: 'QE_Team',
              orgName: 'QE_Team'
            },
            accountInfo: {
              accountIdentifier: 'vpCkHKsDSxK9_KYfjCTMKA'
            },
            planExecutionId: '6rmlRtrPRCmwr4WjSNUM9A',
            startTs: 1655270849978
          }
        ]
      },
      deploymentsStatsSummary: {
        countAndChangeRate: { count: 7, countChangeAndCountChangeRateInfo: { countChange: 0, countChangeRate: 0.0 } },
        failureRateAndChangeRate: { rate: 28.571428571428573, rateChangeRate: 0.0 },
        deploymentRateAndChangeRate: { rate: 0.23333333333333334, rateChangeRate: 0.0 },
        deploymentStats: [
          {
            time: 1633651200000,
            countWithSuccessFailureDetails: {
              count: 1,
              // countChangeAndCountChangeRateInfo: null,
              successCount: 0,
              failureCount: 1
            }
          },
          {
            time: 1633910400000,
            countWithSuccessFailureDetails: {
              count: 2,
              // countChangeAndCountChangeRateInfo: null,
              successCount: 2,
              failureCount: 0
            }
          },
          {
            time: 1633996800000,
            countWithSuccessFailureDetails: {
              count: 1,
              // countChangeAndCountChangeRateInfo: null,
              successCount: 1,
              failureCount: 0
            }
          },
          {
            time: 1634083200000,
            countWithSuccessFailureDetails: {
              count: 3,
              // countChangeAndCountChangeRateInfo: null,
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

export const noDeploymentOverview: {
  data: ExecutionResponseDeploymentsStatsOverview
  error: Error | Failure | undefined
  loading: boolean
} = {
  error: undefined,
  loading: false,
  data: {
    response: {
      deploymentsOverview: {},
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
