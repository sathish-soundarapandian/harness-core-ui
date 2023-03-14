export const stepDetails = {
  uuid: '1WI5IMc0QgCJCpWT15z0Sg',
  setupId: 'U_yTNq52QOWUutowLBNyaA',
  name: 'Verify_2',
  identifier: 'verify_dev',
  baseFqn: 'pipeline.stages.deploy.spec.execution.steps.canaryDepoyment.steps.verify_dev',
  outcomes: {
    output: {
      progressPercentage: '100',
      estimatedRemainingTime: '0 minutes',
      activityId: 'tQbQXRKBQXK_F06qlpL4eQ',
      verifyStepExecutionId: 'tQbQXRKBQXK_F06qlpL4eQ'
    },
    policyOutput: {
      evaluationId: '233',
      status: 'pass',
      policySetDetails: {
        ps1: {
          status: 'pass',
          identifier: 'ps1',
          name: 'ps1',
          policyDetails: {
            policy3: { identifier: 'policy3', name: 'policy3', status: 'pass', denyMessages: [], error: '' }
          }
        }
      }
    }
  },
  stepParameters: {
    identifier: 'verify_dev',
    name: 'Verify_2',
    timeout: '10m',
    failureStrategies: [
      {
        onFailure: {
          errors: ['VERIFICATION_ERROR'],
          action: {
            type: 'MANUAL_INTERVENTION',
            specConfig: {
              timeout: {
                __recast: 'io.harness.yaml.core.timeout.Timeout',
                timeoutString: '2h',
                timeoutInMillis: 7200000
              },
              onTimeout: { action: { type: 'STAGE_ROLLBACK' } }
            }
          }
        }
      },
      {
        onFailure: {
          errors: ['UNKNOWN'],
          action: {
            type: 'MANUAL_INTERVENTION',
            specConfig: {
              timeout: {
                __recast: 'io.harness.yaml.core.timeout.Timeout',
                timeoutString: '2h',
                timeoutInMillis: 7200000
              },
              onTimeout: { action: { type: 'IGNORE' } }
            }
          }
        }
      }
    ],
    type: 'Verify',
    spec: {
      serviceIdentifier: 'test',
      envIdentifier: 'env1',
      deploymentTag: 'test',
      sensitivity: 'LOW',
      failOnNoAnalysis: false,
      verificationJobBuilder: {
        sensitivity: { isRuntimeParam: false, value: 'LOW' },
        createdAt: 0,
        lastUpdatedAt: 0,
        allMonitoringSourcesEnabled: false,
        duration: { isRuntimeParam: false, value: '5m' },
        failOnNoAnalysis: { isRuntimeParam: false, value: 'false' },
        isDefaultJob: false
      },
      spec: { uuid: 'J4dmzK09SN2dHl0GftBc1g', deploymentTag: 'test', duration: '5m', sensitivity: 'LOW' },
      monitoredService: { uuid: 'Z2zBVmzQR7CG-1dptoMy8Q', type: 'Default', spec: {} }
    },
    enforce: { policySets: ['ps1'] }
  },
  startTs: 1678105414437,
  endTs: 1678105962198,
  stepType: 'Verify',
  status: 'Success',
  failureInfo: { message: '', failureTypeList: [], responseMessages: [] },
  skipInfo: null,
  nodeRunInfo: {
    whenCondition: '\u003c+OnStageSuccess\u003e',
    evaluatedCondition: true,
    expressions: [
      {
        expression: 'OnStageSuccess',
        expressionValue: 'true',
        count: 1
      }
    ]
  },
  executableResponses: [
    {
      async: {
        callbackIds: ['tQbQXRKBQXK_F06qlpL4eQ'],
        logKeys: [],
        units: [],
        timeout: 0,
        status: 'NO_OP'
      }
    }
  ],
  unitProgresses: [],
  progressData: {
    progressPercentage: 80,
    estimatedRemainingTime: '1 minutes',
    activityId: 'tQbQXRKBQXK_F06qlpL4eQ'
  },
  delegateInfoList: [],
  interruptHistories: [],
  stepDetails: null,
  strategyMetadata: null,
  executionInputConfigured: false
}

export const stepDetailsWithoutPolicy = {
  ...stepDetails,
  outcomes: {}
}

export const executionMetadata = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  pipelineIdentifier: 'policy_verify',
  orgIdentifier: 'default',
  projectIdentifier: 'srm',
  planExecutionId: 'jVYURKqCRKGXIUttylC5fA'
}
