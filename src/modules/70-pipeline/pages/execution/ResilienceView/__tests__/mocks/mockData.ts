export const mockEmptyPipelineContext = {
  pipelineExecutionDetail: null,
  allNodeMap: {},
  pipelineStagesMap: new Map(),
  isPipelineInvalid: false,
  selectedStageId: '',
  selectedStepId: '',
  selectedStageExecutionId: '',
  loading: false,
  isDataLoadedForSelectedStage: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: jest.fn(),
  refetch: undefined,
  addNewNodeToMap: jest.fn(),
  setStepsGraphCanvasState: jest.fn(),
  stepsGraphCanvasState: { offsetX: 0, offsetY: 0, zoom: 100 },
  setSelectedStepId: jest.fn(),
  setSelectedStageId: jest.fn(),
  setSelectedStageExecutionId: jest.fn(),
  setIsPipelineInvalid: jest.fn()
}

export const mockPipelineContextWithChaosStep = {
  pipelineExecutionDetail: {
    pipelineExecutionSummary: {
      pipelineIdentifier: 'arkotest1',
      planExecutionId: 'SU2ZxJobQHagjTLLDUeKRA',
      name: 'arko-test-1',
      status: 'Success',
      tags: [],
      executionTriggerInfo: {
        triggerType: 'MANUAL',
        triggeredBy: {
          uuid: 'pAISBpOARlafAez0rucSgw',
          identifier: 'Arkajyoti Mukherjee',
          extraInfo: {
            email: 'arkajyoti.mukherjee@harness.io'
          }
        },
        isRerun: false
      },
      governanceMetadata: {
        id: '0',
        deny: false,
        details: [],
        message: '',
        timestamp: '1668764800930',
        status: 'pass',
        accountId: 'px7xd_BFRCi-pfWPYXVjvw',
        orgId: 'chaosorganisation',
        projectId: 'chaosproject',
        entity:
          'accountIdentifier%3Apx7xd_BFRCi-pfWPYXVjvw%2ForgIdentifier%3Achaosorganisation%2FprojectIdentifier%3Achaosproject%2FpipelineIdentifier%3Aarkotest1',
        type: 'pipeline',
        action: 'onrun',
        created: '1668764800927'
      },
      moduleInfo: {},
      layoutNodeMap: {
        gRHnVsjzRSamO5bpH8J2nA: {
          nodeType: 'Custom',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'chaos',
          name: 'chaos',
          nodeUuid: 'gRHnVsjzRSamO5bpH8J2nA',
          status: 'Success',
          module: 'pms',
          moduleInfo: {
            pms: {}
          },
          startTs: 1668764801181,
          endTs: 1668765060783,
          edgeLayoutList: {
            currentNodeChildren: [],
            nextIds: []
          },
          nodeRunInfo: {
            whenCondition: '<+OnPipelineSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnPipelineSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          failureInfo: {
            message: ''
          },
          failureInfoDTO: {
            message: '',
            failureTypeList: [],
            responseMessages: []
          },
          nodeExecutionId: 'tA3lID9sQI-keom_dZ69gw',
          executionInputConfigured: false,
          isRollbackStageNode: false
        },
        gRHnVsjzRSamO5bpH8J2nA_rollbackStage: {
          nodeType: 'Custom',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'gRHnVsjzRSamO5bpH8J2nA_rollbackStage',
          name: 'chaos (Rollback Stage)',
          nodeUuid: 'gRHnVsjzRSamO5bpH8J2nA_rollbackStage',
          status: 'NotStarted',
          module: 'pms',
          moduleInfo: {
            pms: {}
          },
          edgeLayoutList: {
            currentNodeChildren: [],
            nextIds: []
          },
          isRollbackStageNode: true
        }
      },
      modules: ['pms'],
      startingNodeId: 'gRHnVsjzRSamO5bpH8J2nA',
      startTs: 1668764800930,
      endTs: 1668765060869,
      createdAt: 1668764800991,
      canRetry: true,
      showRetryHistory: false,
      runSequence: 7,
      successfulStagesCount: 1,
      runningStagesCount: 0,
      failedStagesCount: 0,
      totalStagesCount: 1,
      storeType: 'INLINE',
      executionInputConfigured: false,
      parentStageInfo: {
        hasparentpipeline: false,
        stagenodeid: '',
        executionid: '',
        identifier: '',
        projectid: '',
        orgid: '',
        runsequence: 0
      },
      allowStageExecutions: false,
      stagesExecution: false
    },
    executionGraph: {
      rootNodeId: 'tA3lID9sQI-keom_dZ69gw',
      nodeMap: {
        'aVJf5Ho5TqOez9hSGW-kPg': {
          uuid: 'aVJf5Ho5TqOez9hSGW-kPg',
          setupId: 'eV36pbIkQfqWQxJ0T8kHag',
          name: 'Execution',
          identifier: 'execution',
          baseFqn: 'pipeline.stages.chaos.spec.execution',
          outcomes: {},
          stepParameters: null,
          startTs: 1668764801262,
          endTs: 1668765060696,
          stepType: 'NG_EXECUTION',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
          },
          skipInfo: null,
          nodeRunInfo: null,
          executableResponses: [
            {
              child: {
                childNodeId: 'eV36pbIkQfqWQxJ0T8kHagsteps',
                logKeys: [],
                units: []
              }
            }
          ],
          unitProgresses: [],
          progressData: null,
          delegateInfoList: [],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: null,
          executionInputConfigured: false
        },
        'tA3lID9sQI-keom_dZ69gw': {
          uuid: 'tA3lID9sQI-keom_dZ69gw',
          setupId: 'gRHnVsjzRSamO5bpH8J2nA',
          name: 'chaos',
          identifier: 'chaos',
          baseFqn: 'pipeline.stages.chaos',
          outcomes: {},
          stepParameters: {
            uuid: 'gRHnVsjzRSamO5bpH8J2nA',
            identifier: 'chaos',
            name: 'chaos',
            description: '',
            variables: {
              __recast: 'java.util.LinkedHashMap'
            },
            tags: {},
            type: 'Custom',
            specConfig: {
              childNodeID: 'YVTejW5mTF6jfH6IK8uuZA'
            }
          },
          startTs: 1668764801181,
          endTs: 1668765060783,
          stepType: 'CUSTOM_STAGE',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
          },
          skipInfo: null,
          nodeRunInfo: {
            whenCondition: '<+OnPipelineSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnPipelineSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          executableResponses: [
            {
              child: {
                childNodeId: 'YVTejW5mTF6jfH6IK8uuZA',
                logKeys: [],
                units: []
              }
            }
          ],
          unitProgresses: [],
          progressData: null,
          delegateInfoList: [],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: null,
          executionInputConfigured: false
        },
        puheSER1RsaZYNuRoGrf1g: {
          uuid: 'puheSER1RsaZYNuRoGrf1g',
          setupId: 'ZlWVJnr4RCmXQaJjdmOEdA',
          name: 'chaos-step',
          identifier: 'chaosstep',
          baseFqn: 'pipeline.stages.chaos.spec.execution.steps.chaosstep',
          outcomes: {
            output: {
              phase: 'Completed',
              experimentRunId: '8509eae6-753e-46c6-9029-1806e6b35bf6',
              resiliencyScore: 100,
              faultsPassed: 1,
              faultsFailed: 0,
              faultsAwaited: 0,
              faultsStopped: 0,
              faultsNa: 0,
              totalFaults: 0
            }
          },
          stepParameters: {
            uuid: 'ZlWVJnr4RCmXQaJjdmOEdA',
            identifier: 'chaosstep',
            name: 'chaos-step',
            timeout: '10h',
            failureStrategies: [
              {
                onFailure: {
                  errors: ['ALL_ERRORS'],
                  action: {
                    type: 'MANUAL_INTERVENTION',
                    specConfig: {
                      timeout: {
                        __recast: 'io.harness.yaml.core.timeout.Timeout',
                        timeoutString: '1h 40m',
                        timeoutInMillis: 6000000
                      },
                      onTimeout: {
                        action: {
                          type: 'IGNORE'
                        }
                      }
                    }
                  }
                }
              }
            ],
            type: 'Chaos',
            spec: {
              experimentRef: '8712c467-ba86-4630-b98a-24518d28fde4',
              expectedResilienceScore: 100,
              assertion: 'faultsFailed > 0'
            },
            rollbackParameters: {
              strategy: 'UNKNOWN',
              strategyToUuid: {
                STAGE_ROLLBACK: 'gRHnVsjzRSamO5bpH8J2nA_combinedRollback',
                PIPELINE_ROLLBACK: 'gRHnVsjzRSamO5bpH8J2nA_rollbackStage'
              },
              applicableFailureTypes: []
            }
          },
          startTs: 1668764801383,
          endTs: 1668765060572,
          stepType: 'Chaos',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: [
              {
                code: 'GENERAL_ERROR',
                level: 'ERROR',
                message: 'Assertion failed',
                exception: null,
                failureTypes: ['APPLICATION_ERROR']
              }
            ]
          },
          skipInfo: null,
          nodeRunInfo: {
            whenCondition: '<+OnStageSuccess>',
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
                callbackIds: ['c77fe2b7-af09-46d6-90c7-8fe542704ea8'],
                logKeys: [],
                units: [],
                timeout: 0
              }
            }
          ],
          unitProgresses: [],
          progressData: null,
          delegateInfoList: [],
          interruptHistories: [
            {
              interruptId: 'jmJg3kMDRXKDgpb1d5PMsA',
              tookEffectAt: 1668765060478,
              interruptType: 'MARK_SUCCESS',
              interruptConfig: {
                issuedBy: {
                  issueTime: 1668765060000,
                  manualIssuer: {
                    email_id: '',
                    user_id: '',
                    type: 'USER',
                    identifier: 'pAISBpOARlafAez0rucSgw'
                  },
                  adviserIssuer: {
                    adviseType: 'UNKNOWN'
                  },
                  timeoutIssuer: {
                    timeoutInstanceId: ''
                  },
                  triggerIssuer: {
                    triggerRef: '',
                    abortPrevConcurrentExecution: false
                  }
                },
                retryInterruptConfig: {
                  retryId: ''
                }
              }
            }
          ],
          stepDetails: null,
          strategyMetadata: null,
          executionInputConfigured: false
        }
      },
      nodeAdjacencyListMap: {
        'aVJf5Ho5TqOez9hSGW-kPg': {
          children: ['puheSER1RsaZYNuRoGrf1g'],
          nextIds: []
        },
        'tA3lID9sQI-keom_dZ69gw': {
          children: ['aVJf5Ho5TqOez9hSGW-kPg'],
          nextIds: []
        },
        puheSER1RsaZYNuRoGrf1g: {
          children: [],
          nextIds: []
        }
      },
      executionMetadata: {
        accountId: 'px7xd_BFRCi-pfWPYXVjvw',
        pipelineIdentifier: 'arkotest1',
        orgIdentifier: 'chaosorganisation',
        projectIdentifier: 'chaosproject',
        planExecutionId: 'SU2ZxJobQHagjTLLDUeKRA'
      },
      representationStrategy: 'camelCase'
    }
  },
  allNodeMap: {
    'aVJf5Ho5TqOez9hSGW-kPg': {
      uuid: 'aVJf5Ho5TqOez9hSGW-kPg',
      setupId: 'eV36pbIkQfqWQxJ0T8kHag',
      name: 'Execution',
      identifier: 'execution',
      baseFqn: 'pipeline.stages.chaos.spec.execution',
      outcomes: {},
      stepParameters: null,
      startTs: 1668764801262,
      endTs: 1668765060696,
      stepType: 'NG_EXECUTION',
      status: 'Success',
      failureInfo: {
        message: '',
        failureTypeList: [],
        responseMessages: []
      },
      skipInfo: null,
      nodeRunInfo: null,
      executableResponses: [
        {
          child: {
            childNodeId: 'eV36pbIkQfqWQxJ0T8kHagsteps',
            logKeys: [],
            units: []
          }
        }
      ],
      unitProgresses: [],
      progressData: null,
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: null,
      executionInputConfigured: false
    },
    'tA3lID9sQI-keom_dZ69gw': {
      uuid: 'tA3lID9sQI-keom_dZ69gw',
      setupId: 'gRHnVsjzRSamO5bpH8J2nA',
      name: 'chaos',
      identifier: 'chaos',
      baseFqn: 'pipeline.stages.chaos',
      outcomes: {},
      stepParameters: {
        uuid: 'gRHnVsjzRSamO5bpH8J2nA',
        identifier: 'chaos',
        name: 'chaos',
        description: '',
        variables: {
          __recast: 'java.util.LinkedHashMap'
        },
        tags: {},
        type: 'Custom',
        specConfig: {
          childNodeID: 'YVTejW5mTF6jfH6IK8uuZA'
        }
      },
      startTs: 1668764801181,
      endTs: 1668765060783,
      stepType: 'CUSTOM_STAGE',
      status: 'Success',
      failureInfo: {
        message: '',
        failureTypeList: [],
        responseMessages: []
      },
      skipInfo: null,
      nodeRunInfo: {
        whenCondition: '<+OnPipelineSuccess>',
        evaluatedCondition: true,
        expressions: [
          {
            expression: 'OnPipelineSuccess',
            expressionValue: 'true',
            count: 1
          }
        ]
      },
      executableResponses: [
        {
          child: {
            childNodeId: 'YVTejW5mTF6jfH6IK8uuZA',
            logKeys: [],
            units: []
          }
        }
      ],
      unitProgresses: [],
      progressData: null,
      delegateInfoList: [],
      interruptHistories: [],
      stepDetails: null,
      strategyMetadata: null,
      executionInputConfigured: false
    },
    puheSER1RsaZYNuRoGrf1g: {
      uuid: 'puheSER1RsaZYNuRoGrf1g',
      setupId: 'ZlWVJnr4RCmXQaJjdmOEdA',
      name: 'chaos-step',
      identifier: 'chaosstep',
      baseFqn: 'pipeline.stages.chaos.spec.execution.steps.chaosstep',
      outcomes: {
        output: {
          phase: 'Completed',
          experimentRunId: '8509eae6-753e-46c6-9029-1806e6b35bf6',
          resiliencyScore: 100,
          faultsPassed: 1,
          faultsFailed: 0,
          faultsAwaited: 0,
          faultsStopped: 0,
          faultsNa: 0,
          totalFaults: 0
        }
      },
      stepParameters: {
        uuid: 'ZlWVJnr4RCmXQaJjdmOEdA',
        identifier: 'chaosstep',
        name: 'chaos-step',
        timeout: '10h',
        failureStrategies: [
          {
            onFailure: {
              errors: ['ALL_ERRORS'],
              action: {
                type: 'MANUAL_INTERVENTION',
                specConfig: {
                  timeout: {
                    __recast: 'io.harness.yaml.core.timeout.Timeout',
                    timeoutString: '1h 40m',
                    timeoutInMillis: 6000000
                  },
                  onTimeout: {
                    action: {
                      type: 'IGNORE'
                    }
                  }
                }
              }
            }
          }
        ],
        type: 'Chaos',
        spec: {
          experimentRef: '8712c467-ba86-4630-b98a-24518d28fde4',
          expectedResilienceScore: 100,
          assertion: 'faultsFailed > 0'
        },
        rollbackParameters: {
          strategy: 'UNKNOWN',
          strategyToUuid: {
            STAGE_ROLLBACK: 'gRHnVsjzRSamO5bpH8J2nA_combinedRollback',
            PIPELINE_ROLLBACK: 'gRHnVsjzRSamO5bpH8J2nA_rollbackStage'
          },
          applicableFailureTypes: []
        }
      },
      startTs: 1668764801383,
      endTs: 1668765060572,
      stepType: 'Chaos',
      status: 'Success',
      failureInfo: {
        message: '',
        failureTypeList: [],
        responseMessages: [
          {
            code: 'GENERAL_ERROR',
            level: 'ERROR',
            message: 'Assertion failed',
            exception: null,
            failureTypes: ['APPLICATION_ERROR']
          }
        ]
      },
      skipInfo: null,
      nodeRunInfo: {
        whenCondition: '<+OnStageSuccess>',
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
            callbackIds: ['c77fe2b7-af09-46d6-90c7-8fe542704ea8'],
            logKeys: [],
            units: [],
            timeout: 0
          }
        }
      ],
      unitProgresses: [],
      progressData: null,
      delegateInfoList: [],
      interruptHistories: [
        {
          interruptId: 'jmJg3kMDRXKDgpb1d5PMsA',
          tookEffectAt: 1668765060478,
          interruptType: 'MARK_SUCCESS',
          interruptConfig: {
            issuedBy: {
              issueTime: 1668765060000,
              manualIssuer: {
                email_id: '',
                user_id: '',
                type: 'USER',
                identifier: 'pAISBpOARlafAez0rucSgw'
              },
              adviserIssuer: {
                adviseType: 'UNKNOWN'
              },
              timeoutIssuer: {
                timeoutInstanceId: ''
              },
              triggerIssuer: {
                triggerRef: '',
                abortPrevConcurrentExecution: false
              }
            },
            retryInterruptConfig: {
              retryId: ''
            }
          }
        }
      ],
      stepDetails: null,
      strategyMetadata: null,
      executionInputConfigured: false
    }
  },
  pipelineStagesMap: new Map([
    [
      'gRHnVsjzRSamO5bpH8J2nA',
      {
        nodeType: 'Custom',
        nodeGroup: 'STAGE',
        nodeIdentifier: 'chaos',
        name: 'chaos',
        nodeUuid: 'gRHnVsjzRSamO5bpH8J2nA',
        status: 'Success',
        module: 'pms',
        moduleInfo: {
          pms: {}
        },
        startTs: 1668764801181,
        endTs: 1668765060783,
        edgeLayoutList: {
          currentNodeChildren: [],
          nextIds: []
        },
        nodeRunInfo: {
          whenCondition: '<+OnPipelineSuccess>',
          evaluatedCondition: true,
          expressions: [
            {
              expression: 'OnPipelineSuccess',
              expressionValue: 'true',
              count: 1
            }
          ]
        },
        failureInfo: {
          message: ''
        },
        failureInfoDTO: {
          message: '',
          failureTypeList: [],
          responseMessages: []
        },
        nodeExecutionId: 'tA3lID9sQI-keom_dZ69gw',
        executionInputConfigured: false,
        isRollbackStageNode: false
      }
    ]
  ]),
  isPipelineInvalid: false,
  selectedStageId: 'gRHnVsjzRSamO5bpH8J2nA',
  selectedStepId: 'puheSER1RsaZYNuRoGrf1g',
  selectedStageExecutionId: '',
  loading: false,
  isDataLoadedForSelectedStage: true,
  queryParams: {
    storeType: 'INLINE'
  },
  logsToken: '',
  stepsGraphCanvasState: {
    offsetX: 5,
    offsetY: 0,
    zoom: 100
  }
}
