/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const executionContextMock = {
  selectedCollapsedNodeId: 'I8se3fHaSViLI3mZi0SuNQ',
  pipelineExecutionDetail: {
    executionGraph: {
      rootNodeId: 'SNNdmUfJTZuMeSXeI-ebQg',
      nodeMap: {
        I8se3fHaSViLI3mZi0SuNQ: {
          uuid: 'I8se3fHaSViLI3mZi0SuNQ',
          setupId: 'r5BETgmdSwu6A4JmWDZq9A',
          name: 'Shell Script_1',
          identifier: 'ShellScript_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps',
          outcomes: {},
          stepParameters: {
            strategyConfig: {
              uuid: 'dfqZyd0dQ8K7MnrPMH4WCA',
              matrixConfig: {
                uuid: 'dNBHSYIjSjGRsZBzuKrfnw',
                axes: {
                  service: {
                    axisValue: ['svc1', 'svc2', 'svc3']
                  },
                  env: {
                    axisValue: ['env1', 'env2', 'env3']
                  }
                },
                expressionAxes: {},
                maxConcurrency: 5
              }
            },
            childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
            maxConcurrency: 5,
            strategyType: 'MATRIX',
            shouldProceedIfFailed: true
          },
          startTs: 1673549407211,
          endTs: 1673549421803,
          stepType: 'STRATEGY',
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
              children: {
                children: [
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 0,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env1',
                          service: 'svc1'
                        },
                        matrixCombination: [0, 0],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 1,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env2',
                          service: 'svc1'
                        },
                        matrixCombination: [0, 1],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 2,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env3',
                          service: 'svc1'
                        },
                        matrixCombination: [0, 2],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 3,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env1',
                          service: 'svc2'
                        },
                        matrixCombination: [1, 0],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 4,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env2',
                          service: 'svc2'
                        },
                        matrixCombination: [1, 1],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 5,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env3',
                          service: 'svc2'
                        },
                        matrixCombination: [1, 2],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 6,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env1',
                          service: 'svc3'
                        },
                        matrixCombination: [2, 0],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 7,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env2',
                          service: 'svc3'
                        },
                        matrixCombination: [2, 1],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                    strategyMetadata: {
                      currentIteration: 8,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env3',
                          service: 'svc3'
                        },
                        matrixCombination: [2, 2],
                        subType: ''
                      }
                    }
                  }
                ],
                maxConcurrency: '5',
                logKeys: [],
                shouldProceedIfFailed: true
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
        '1siQbuqySYC_YbqpQafdYQ': {
          uuid: '1siQbuqySYC_YbqpQafdYQ',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_1_2',
          identifier: 'ShellScript_1_1_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_1_2',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_1_2',
            name: 'Shell Script_1_1_2',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549411467,
          endTs: 1673549413975,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'nq7GX-QEQzqtwHnQc77uUg',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_1_2-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549411934',
              endTime: '1673549411940'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'nq7GX-QEQzqtwHnQc77uUg',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 5,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env3',
                service: 'svc2'
              },
              matrixcombination: [1, 2],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'zc2yR-3bT56WOfD2nwNa8w': {
          uuid: 'zc2yR-3bT56WOfD2nwNa8w',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_0_0',
          identifier: 'ShellScript_2_0_0',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_0_0',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_0_0',
            name: 'Shell Script_2_0_0',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549422076,
          endTs: 1673549425222,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'wyhsmtDBRgWLWY527sGySQ',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_0_0-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549422551',
              endTime: '1673549422555'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'wyhsmtDBRgWLWY527sGySQ',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 0,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env1',
                service: 'svc1'
              },
              matrixcombination: [0, 0],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'WKv04c0ETYW9KSktS0zq-Q': {
          uuid: 'WKv04c0ETYW9KSktS0zq-Q',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_1_1',
          identifier: 'ShellScript_2_1_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_1_1',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_1_1',
            name: 'Shell Script_2_1_1',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549425388,
          endTs: 1673549427791,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'lCLfEC6pQk6foJoGjvKNYw',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_1_1-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549425861',
              endTime: '1673549425865'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'lCLfEC6pQk6foJoGjvKNYw',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 4,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env2',
                service: 'svc2'
              },
              matrixcombination: [1, 1],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'Fs0K-YdcTlS8Q1-x2lPd3g': {
          uuid: 'Fs0K-YdcTlS8Q1-x2lPd3g',
          setupId: 'sYtWpLu_TYW1uJ_pVHDS_w',
          name: 'Execution',
          identifier: 'execution',
          baseFqn: 'pipeline.stages.s1.spec.execution',
          outcomes: {},
          stepParameters: {
            childNodeId: 'sYtWpLu_TYW1uJ_pVHDS_wsteps',
            logMessage: 'Execution Element'
          },
          startTs: 1673549407087,
          endTs: 1673549431382,
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
                childNodeId: 'sYtWpLu_TYW1uJ_pVHDS_wsteps',
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
        'vh-kjsQMT5qXNNq7Uh_geg': {
          uuid: 'vh-kjsQMT5qXNNq7Uh_geg',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_2_1',
          identifier: 'ShellScript_2_2_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_2_1',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_2_1',
            name: 'Shell Script_2_2_1',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549425903,
          endTs: 1673549429258,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'PRcIR0jFRDu3K5yczsZqFQ',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_2_1-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549426380',
              endTime: '1673549426567'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'PRcIR0jFRDu3K5yczsZqFQ',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 7,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env2',
                service: 'svc3'
              },
              matrixcombination: [2, 1],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        StiFIEJOTxmZUWcDu8nuEA: {
          uuid: 'StiFIEJOTxmZUWcDu8nuEA',
          setupId: '-GTG5XAgSZa3oI-bIng7nw',
          name: 'Shell Script_2',
          identifier: 'ShellScript_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps',
          outcomes: {},
          stepParameters: {
            strategyConfig: {
              uuid: 'GMIn4tH3SJys3sVw2xHJdQ',
              matrixConfig: {
                uuid: 'GUs6U_FlQ8-8xMqTTr0dWw',
                axes: {
                  service: {
                    axisValue: ['svc1', 'svc2', 'svc3']
                  },
                  env: {
                    axisValue: ['env1', 'env2', 'env3']
                  }
                },
                expressionAxes: {},
                maxConcurrency: 4
              }
            },
            childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
            maxConcurrency: 4,
            strategyType: 'MATRIX',
            shouldProceedIfFailed: true
          },
          startTs: 1673549421874,
          endTs: 1673549431310,
          stepType: 'STRATEGY',
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
              children: {
                children: [
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 0,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env1',
                          service: 'svc1'
                        },
                        matrixCombination: [0, 0],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 1,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env2',
                          service: 'svc1'
                        },
                        matrixCombination: [0, 1],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 2,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env3',
                          service: 'svc1'
                        },
                        matrixCombination: [0, 2],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 3,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env1',
                          service: 'svc2'
                        },
                        matrixCombination: [1, 0],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 4,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env2',
                          service: 'svc2'
                        },
                        matrixCombination: [1, 1],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 5,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env3',
                          service: 'svc2'
                        },
                        matrixCombination: [1, 2],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 6,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env1',
                          service: 'svc3'
                        },
                        matrixCombination: [2, 0],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 7,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env2',
                          service: 'svc3'
                        },
                        matrixCombination: [2, 1],
                        subType: ''
                      }
                    }
                  },
                  {
                    childNodeId: 'GMIn4tH3SJys3sVw2xHJdQ',
                    strategyMetadata: {
                      currentIteration: 8,
                      totalIterations: 9,
                      matrixMetadata: {
                        matrixValues: {
                          env: 'env3',
                          service: 'svc3'
                        },
                        matrixCombination: [2, 2],
                        subType: ''
                      }
                    }
                  }
                ],
                maxConcurrency: '4',
                logKeys: [],
                shouldProceedIfFailed: true
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
        '89uc5gIRQXSAns538lJ4XA': {
          uuid: '89uc5gIRQXSAns538lJ4XA',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_1_0',
          identifier: 'ShellScript_2_1_0',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_1_0',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_1_0',
            name: 'Shell Script_2_1_0',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549422084,
          endTs: 1673549425241,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'ePaDGve-QhCQkYNhvScVOg',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_1_0-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549422561',
              endTime: '1673549422569'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'ePaDGve-QhCQkYNhvScVOg',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 3,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env1',
                service: 'svc2'
              },
              matrixcombination: [1, 0],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        '4HerwO2DTS2KNg79uyVGWw': {
          uuid: '4HerwO2DTS2KNg79uyVGWw',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_2_1',
          identifier: 'ShellScript_1_2_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_2_1',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_2_1',
            name: 'Shell Script_1_2_1',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549411812,
          endTs: 1673549421746,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'K0Dt0RmqSD2kqIlbEX_46A',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_2_1-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549412292',
              endTime: '1673549412308'
            }
          ],
          progressData: {
            unitProgresses: [
              {
                unitName: 'Execute',
                status: 'SUCCESS',
                startTime: '1673549412292',
                endTime: '1673549412308'
              }
            ]
          },
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'K0Dt0RmqSD2kqIlbEX_46A',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 7,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env2',
                service: 'svc3'
              },
              matrixcombination: [2, 1],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        tOpvaIpQRUWa46OMoeoAdA: {
          uuid: 'tOpvaIpQRUWa46OMoeoAdA',
          setupId: 'QNYNyHmxRs674Simh8XH1gparallel',
          name: 'parallel',
          identifier: 'parallelQNYNyHmxRs674Simh8XH1gparallel',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps',
          outcomes: {},
          stepParameters: {
            parallelNodeIds: ['r5BETgmdSwu6A4JmWDZq9A', 'rB05UB1AT-eii8doecUwsg']
          },
          startTs: 1673549407168,
          endTs: 1673549421852,
          stepType: 'NG_FORK',
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
              children: {
                children: [
                  {
                    childNodeId: 'r5BETgmdSwu6A4JmWDZq9A'
                  },
                  {
                    childNodeId: 'rB05UB1AT-eii8doecUwsg'
                  }
                ],
                maxConcurrency: '0',
                logKeys: [],
                shouldProceedIfFailed: false
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
        'kkGtVI86SiSIkOny-lsHhg': {
          uuid: 'kkGtVI86SiSIkOny-lsHhg',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_8',
          identifier: 'ShellScript_3_8',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_8',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_8',
            name: 'Shell Script_3_8',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407554,
          endTs: 1673549411334,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: '9JRTHzRvQPuya42QyMzuRw',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_8-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408289',
              endTime: '1673549408913'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: '9JRTHzRvQPuya42QyMzuRw',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 8,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        'P762w0yOSHKCWXNQ9-PscQ': {
          uuid: 'P762w0yOSHKCWXNQ9-PscQ',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_1_0',
          identifier: 'ShellScript_1_1_0',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_1_0',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_1_0',
            name: 'Shell Script_1_1_0',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407547,
          endTs: 1673549411284,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'ZbNgPggBR7eLMoxBi8MMpg',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_1_0-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408289',
              endTime: '1673549408928'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'ZbNgPggBR7eLMoxBi8MMpg',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 3,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env1',
                service: 'svc2'
              },
              matrixcombination: [1, 0],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'SNNdmUfJTZuMeSXeI-ebQg': {
          uuid: 'SNNdmUfJTZuMeSXeI-ebQg',
          setupId: 'qGUE5NnvSyG_IRLWhPFtOA',
          name: 's1',
          identifier: 's1',
          baseFqn: 'pipeline.stages.s1',
          outcomes: {},
          stepParameters: {
            uuid: 'qGUE5NnvSyG_IRLWhPFtOA',
            identifier: 's1',
            name: 's1',
            description: '',
            variables: {
              __recast: 'java.util.LinkedHashMap'
            },
            tags: {},
            type: 'Custom',
            specConfig: {
              childNodeID: '3uJQ0qdmQ92K28-3cr1ZAw'
            }
          },
          startTs: 1673549407008,
          endTs: 1673549431450,
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
                childNodeId: '3uJQ0qdmQ92K28-3cr1ZAw',
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
        wj85tPXcS6SF_w0rRhAfRw: {
          uuid: 'wj85tPXcS6SF_w0rRhAfRw',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_7',
          identifier: 'ShellScript_3_7',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_7',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_7',
            name: 'Shell Script_3_7',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407656,
          endTs: 1673549411268,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'vq3ias1uTXejVfkUb2amBQ',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_7-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408291',
              endTime: '1673549408387'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'vq3ias1uTXejVfkUb2amBQ',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 7,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        ickxKQz2Q4qYgmam0f1gYQ: {
          uuid: 'ickxKQz2Q4qYgmam0f1gYQ',
          setupId: 'rB05UB1AT-eii8doecUwsg',
          name: 'Shell Script_3',
          identifier: 'ShellScript_3',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps',
          outcomes: {},
          stepParameters: {
            strategyConfig: {
              uuid: 'OHOY0T5uT1aQgtaaut_PXw',
              parallelism: 10
            },
            childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
            strategyType: 'PARALLELISM',
            shouldProceedIfFailed: true
          },
          startTs: 1673549407211,
          endTs: 1673549411374,
          stepType: 'STRATEGY',
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
              children: {
                children: [
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 0,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 1,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 2,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 3,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 4,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 5,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 6,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 7,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 8,
                      totalIterations: 10
                    }
                  },
                  {
                    childNodeId: 'OHOY0T5uT1aQgtaaut_PXw',
                    strategyMetadata: {
                      currentIteration: 9,
                      totalIterations: 10
                    }
                  }
                ],
                maxConcurrency: '10',
                logKeys: [],
                shouldProceedIfFailed: true
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
        wIR3kCvdTDCzEXEAHahJ5Q: {
          uuid: 'wIR3kCvdTDCzEXEAHahJ5Q',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_2_2',
          identifier: 'ShellScript_1_2_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_2_2',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_2_2',
            name: 'Shell Script_1_2_2',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549414140,
          endTs: 1673549417171,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'qsreiosKRreUgkhfXtQm0Q',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_2_2-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549414605',
              endTime: '1673549414609'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'qsreiosKRreUgkhfXtQm0Q',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 8,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env3',
                service: 'svc3'
              },
              matrixcombination: [2, 2],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        SUFjznWkSlSp6MubUT4ZfA: {
          uuid: 'SUFjznWkSlSp6MubUT4ZfA',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_1',
          identifier: 'ShellScript_3_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_1',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_1',
            name: 'Shell Script_3_1',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407502,
          endTs: 1673549411226,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: '4KPQw_y3TI-AwU0h7yB2DA',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_1-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408137',
              endTime: '1673549408913'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: '4KPQw_y3TI-AwU0h7yB2DA',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 1,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        tx47O_vURtaLjv_GeLgz1A: {
          uuid: 'tx47O_vURtaLjv_GeLgz1A',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_1_1',
          identifier: 'ShellScript_1_1_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_1_1',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_1_1',
            name: 'Shell Script_1_1_1',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407541,
          endTs: 1673549411311,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'PwP-BrXoQLeAZ2-Lc8-5bQ',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_1_1-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408321',
              endTime: '1673549408914'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'PwP-BrXoQLeAZ2-Lc8-5bQ',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 4,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env2',
                service: 'svc2'
              },
              matrixcombination: [1, 1],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        ud7xe8bzR4KBZz8bWZdetg: {
          uuid: 'ud7xe8bzR4KBZz8bWZdetg',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_9',
          identifier: 'ShellScript_3_9',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_9',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_9',
            name: 'Shell Script_3_9',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407722,
          endTs: 1673549411283,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'F-d62hf2STOpsKwUbCf6nw',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_9-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408224',
              endTime: '1673549408924'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'F-d62hf2STOpsKwUbCf6nw',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 9,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        '5RcSTfCmTaqos1oe71GcTw': {
          uuid: '5RcSTfCmTaqos1oe71GcTw',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_4',
          identifier: 'ShellScript_3_4',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_4',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_4',
            name: 'Shell Script_3_4',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407696,
          endTs: 1673549411282,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: '4F3O5Hr_TgmmpNTxiwSZzg',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_4-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408182',
              endTime: '1673549408919'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: '4F3O5Hr_TgmmpNTxiwSZzg',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 4,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        EmvcL4UrSfWAQKUKzxewFQ: {
          uuid: 'EmvcL4UrSfWAQKUKzxewFQ',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_6',
          identifier: 'ShellScript_3_6',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_6',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_6',
            name: 'Shell Script_3_6',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407558,
          endTs: 1673549411251,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'dIqtWMf_QimsAYC-Zbco0g',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_6-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408157',
              endTime: '1673549408913'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'dIqtWMf_QimsAYC-Zbco0g',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 6,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        '5CidrplaTBqfB1jE4hG5VA': {
          uuid: '5CidrplaTBqfB1jE4hG5VA',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_2_0',
          identifier: 'ShellScript_2_2_0',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_2_0',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_2_0',
            name: 'Shell Script_2_2_0',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549425686,
          endTs: 1673549429256,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'ofHrA_FbQdGlc6MLd1DvNA',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_2_0-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549426167',
              endTime: '1673549426171'
            }
          ],
          progressData: {
            unitProgresses: [
              {
                unitName: 'Execute',
                status: 'SUCCESS',
                startTime: '1673549426167',
                endTime: '1673549426171'
              }
            ]
          },
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'ofHrA_FbQdGlc6MLd1DvNA',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 6,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env1',
                service: 'svc3'
              },
              matrixcombination: [2, 0],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'kdygXfs-S0-lSf9xCQOVQQ': {
          uuid: 'kdygXfs-S0-lSf9xCQOVQQ',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_0_1',
          identifier: 'ShellScript_2_0_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_0_1',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_0_1',
            name: 'Shell Script_2_0_1',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549422079,
          endTs: 1673549425227,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'ANpkqlXGRLiE8e56Ejf8uw',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_0_1-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549422561',
              endTime: '1673549422565'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'ANpkqlXGRLiE8e56Ejf8uw',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 1,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env2',
                service: 'svc1'
              },
              matrixcombination: [0, 1],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        hqonkt6SRLiWn6cuKQXWxQ: {
          uuid: 'hqonkt6SRLiWn6cuKQXWxQ',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_0_2',
          identifier: 'ShellScript_1_0_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_0_2',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_0_2',
            name: 'Shell Script_1_0_2',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407616,
          endTs: 1673549411297,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'AOshCr2iSqCSUoeCohg-_w',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_0_2-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408337',
              endTime: '1673549409128'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'AOshCr2iSqCSUoeCohg-_w',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 2,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env3',
                service: 'svc1'
              },
              matrixcombination: [0, 2],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        jqxhfib_ROaQovirk31nIQ: {
          uuid: 'jqxhfib_ROaQovirk31nIQ',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_5',
          identifier: 'ShellScript_3_5',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_5',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_5',
            name: 'Shell Script_3_5',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407684,
          endTs: 1673549411270,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'T4C4vK6IT9Ki3-0rlnHLfw',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_5-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408169',
              endTime: '1673549408925'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'T4C4vK6IT9Ki3-0rlnHLfw',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 5,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        aNqZfUNASJ2YO3Y2jRNnrg: {
          uuid: 'aNqZfUNASJ2YO3Y2jRNnrg',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_0_2',
          identifier: 'ShellScript_2_0_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_0_2',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_0_2',
            name: 'Shell Script_2_0_2',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549422095,
          endTs: 1673549425241,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'Ab-oQuPJQQizEI26at-F-w',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_0_2-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549422599',
              endTime: '1673549422603'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'Ab-oQuPJQQizEI26at-F-w',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 2,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env3',
                service: 'svc1'
              },
              matrixcombination: [0, 2],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'xgT-byN5TASmrO4ZKjifNA': {
          uuid: 'xgT-byN5TASmrO4ZKjifNA',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_0_0',
          identifier: 'ShellScript_1_0_0',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_0_0',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_0_0',
            name: 'Shell Script_1_0_0',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407599,
          endTs: 1673549411302,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'kZkVH5T7Q7qVDWO1KXczUg',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_0_0-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408308',
              endTime: '1673549408911'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'kZkVH5T7Q7qVDWO1KXczUg',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 0,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env1',
                service: 'svc1'
              },
              matrixcombination: [0, 0],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'IcE0_Hw3Td-kjrF8wfO98Q': {
          uuid: 'IcE0_Hw3Td-kjrF8wfO98Q',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_0_1',
          identifier: 'ShellScript_1_0_1',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_0_1',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_0_1',
            name: 'Shell Script_1_0_1',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407522,
          endTs: 1673549418432,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'gEQFVPf8SRWL6YMyYKh2cA',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_0_1-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408157',
              endTime: '1673549408936'
            }
          ],
          progressData: {
            unitProgresses: [
              {
                unitName: 'Execute',
                status: 'SUCCESS',
                startTime: '1673549408157',
                endTime: '1673549408936'
              }
            ]
          },
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'gEQFVPf8SRWL6YMyYKh2cA',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 1,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env2',
                service: 'svc1'
              },
              matrixcombination: [0, 1],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        PxtLdQSwQ3akJsRRHwuvVg: {
          uuid: 'PxtLdQSwQ3akJsRRHwuvVg',
          setupId: 'dfqZyd0dQ8K7MnrPMH4WCA',
          name: 'Shell Script_1_2_0',
          identifier: 'ShellScript_1_2_0',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_1_2_0',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_1_2_0',
            name: 'Shell Script_1_2_0',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'DN49D-N9RrW_LE9rzpf9jQ',
                type: 'Inline',
                spec: {
                  script: 'echo 1'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549411644,
          endTs: 1673549413976,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: '9a5DU6JPTc6Utp2KH9QvnA',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_1/level8:ShellScript_1_2_0-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549412125',
              endTime: '1673549412128'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: '9a5DU6JPTc6Utp2KH9QvnA',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 6,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env1',
                service: 'svc3'
              },
              matrixcombination: [2, 0],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        '_XMw7WP4Qhq-sjm5zAxZTg': {
          uuid: '_XMw7WP4Qhq-sjm5zAxZTg',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_3',
          identifier: 'ShellScript_3_3',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_3',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_3',
            name: 'Shell Script_3_3',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407522,
          endTs: 1673549411234,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'D3txwhVYQumj2CTasBh-Fw',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_3-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408134',
              endTime: '1673549408924'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'D3txwhVYQumj2CTasBh-Fw',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 3,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        '8e66AUSpQDu_ROUVvF1Vog': {
          uuid: '8e66AUSpQDu_ROUVvF1Vog',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_1_2',
          identifier: 'ShellScript_2_1_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_1_2',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_1_2',
            name: 'Shell Script_2_1_2',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549425536,
          endTs: 1673549427795,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'HAwZ3NLVTmWrrxttTiFG7w',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_1_2-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549426009',
              endTime: '1673549426013'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'HAwZ3NLVTmWrrxttTiFG7w',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 5,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env3',
                service: 'svc2'
              },
              matrixcombination: [1, 2],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        RrEHs_Z0R12feYdBbMfSwg: {
          uuid: 'RrEHs_Z0R12feYdBbMfSwg',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_0',
          identifier: 'ShellScript_3_0',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_0',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_0',
            name: 'Shell Script_3_0',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407501,
          endTs: 1673549411221,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'ZU_3GSM-SvSlcb9ShB_gsA',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_0-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408134',
              endTime: '1673549408912'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'ZU_3GSM-SvSlcb9ShB_gsA',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 0,
            totaliterations: 10
          },
          executionInputConfigured: false
        },
        'wuDbZ8ilQX-SDNp7HhEqpA': {
          uuid: 'wuDbZ8ilQX-SDNp7HhEqpA',
          setupId: 'GMIn4tH3SJys3sVw2xHJdQ',
          name: 'Shell Script_2_2_2',
          identifier: 'ShellScript_2_2_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_2_2_2',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_2_2_2',
            name: 'Shell Script_2_2_2',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'Xy4CVk0zSBKOHH0eIa-u9A',
                type: 'Inline',
                spec: {
                  script: 'echo 2'
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549427956,
          endTs: 1673549431269,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: 'lwo2x--eQbiewqhURqVvZw',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:ShellScript_2/level7:ShellScript_2_2_2-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549428429',
              endTime: '1673549428432'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: 'lwo2x--eQbiewqhURqVvZw',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 8,
            totaliterations: 9,
            matrixmetadata: {
              matrixvalues: {
                env: 'env3',
                service: 'svc3'
              },
              matrixcombination: [2, 2],
              subtype: ''
            }
          },
          executionInputConfigured: false
        },
        'gw8qE-08RxS2S1jZnq15bQ': {
          uuid: 'gw8qE-08RxS2S1jZnq15bQ',
          setupId: 'OHOY0T5uT1aQgtaaut_PXw',
          name: 'Shell Script_3_2',
          identifier: 'ShellScript_3_2',
          baseFqn: 'pipeline.stages.s1.spec.execution.steps.ShellScript_3_2',
          outcomes: {
            output: {
              outputVariables: {}
            }
          },
          stepParameters: {
            identifier: 'ShellScript_3_2',
            name: 'Shell Script_3_2',
            timeout: '10m',
            failureStrategies: [],
            type: 'ShellScript',
            spec: {
              outputVariables: {},
              environmentVariables: {},
              shell: 'Bash',
              source: {
                uuid: 'WaJlQGrRRG6HsCCYl5CbYw',
                type: 'Inline',
                spec: {
                  script: "echo 'asdadsd'"
                }
              },
              onDelegate: true
            }
          },
          startTs: 1673549407542,
          endTs: 1673549411245,
          stepType: 'ShellScript',
          status: 'Success',
          failureInfo: {
            message: '',
            failureTypeList: [],
            responseMessages: []
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
              task: {
                taskId: '4x04codBSlqAlKGsmFu2hg',
                taskCategory: 'DELEGATE_TASK_V2',
                logKeys: [
                  'accountId:px7xd_BFRCi-pfWPYXVjvw/orgId:default/projectId:testrr18/pipelineId:looping_strategies/runSequence:34/level0:pipeline/level1:stages/level2:s1/level3:spec/level4:execution/level5:steps/level6:parallelQNYNyHmxRs674Simh8XH1gparallel/level7:ShellScript_3/level8:ShellScript_3_2-commandUnit:Execute'
                ],
                units: [],
                taskName: 'SHELL_SCRIPT_TASK_NG'
              }
            }
          ],
          unitProgresses: [
            {
              unitName: 'Execute',
              status: 'SUCCESS',
              startTime: '1673549408153',
              endTime: '1673549408915'
            }
          ],
          progressData: null,
          delegateInfoList: [
            {
              id: null,
              name: null,
              taskId: '4x04codBSlqAlKGsmFu2hg',
              taskName: 'SHELL_SCRIPT_TASK_NG'
            }
          ],
          interruptHistories: [],
          stepDetails: null,
          strategyMetadata: {
            currentiteration: 2,
            totaliterations: 10
          },
          executionInputConfigured: false
        }
      },
      nodeAdjacencyListMap: {
        I8se3fHaSViLI3mZi0SuNQ: {
          children: [
            'IcE0_Hw3Td-kjrF8wfO98Q',
            'xgT-byN5TASmrO4ZKjifNA',
            'hqonkt6SRLiWn6cuKQXWxQ',
            'P762w0yOSHKCWXNQ9-PscQ',
            'tx47O_vURtaLjv_GeLgz1A',
            '1siQbuqySYC_YbqpQafdYQ',
            'PxtLdQSwQ3akJsRRHwuvVg',
            '4HerwO2DTS2KNg79uyVGWw',
            'wIR3kCvdTDCzEXEAHahJ5Q'
          ],
          nextIds: []
        },
        '1siQbuqySYC_YbqpQafdYQ': {
          children: [],
          nextIds: []
        },
        'zc2yR-3bT56WOfD2nwNa8w': {
          children: [],
          nextIds: []
        },
        'WKv04c0ETYW9KSktS0zq-Q': {
          children: [],
          nextIds: []
        },
        'Fs0K-YdcTlS8Q1-x2lPd3g': {
          children: ['tOpvaIpQRUWa46OMoeoAdA'],
          nextIds: []
        },
        'vh-kjsQMT5qXNNq7Uh_geg': {
          children: [],
          nextIds: []
        },
        StiFIEJOTxmZUWcDu8nuEA: {
          children: [
            'zc2yR-3bT56WOfD2nwNa8w',
            'kdygXfs-S0-lSf9xCQOVQQ',
            'aNqZfUNASJ2YO3Y2jRNnrg',
            'WKv04c0ETYW9KSktS0zq-Q',
            '89uc5gIRQXSAns538lJ4XA',
            '8e66AUSpQDu_ROUVvF1Vog',
            '5CidrplaTBqfB1jE4hG5VA',
            'vh-kjsQMT5qXNNq7Uh_geg',
            'wuDbZ8ilQX-SDNp7HhEqpA'
          ],
          nextIds: []
        },
        '89uc5gIRQXSAns538lJ4XA': {
          children: [],
          nextIds: []
        },
        '4HerwO2DTS2KNg79uyVGWw': {
          children: [],
          nextIds: []
        },
        tOpvaIpQRUWa46OMoeoAdA: {
          children: ['I8se3fHaSViLI3mZi0SuNQ', 'ickxKQz2Q4qYgmam0f1gYQ'],
          nextIds: ['StiFIEJOTxmZUWcDu8nuEA']
        },
        'kkGtVI86SiSIkOny-lsHhg': {
          children: [],
          nextIds: []
        },
        'P762w0yOSHKCWXNQ9-PscQ': {
          children: [],
          nextIds: []
        },
        'SNNdmUfJTZuMeSXeI-ebQg': {
          children: ['Fs0K-YdcTlS8Q1-x2lPd3g'],
          nextIds: []
        },
        wj85tPXcS6SF_w0rRhAfRw: {
          children: [],
          nextIds: []
        },
        ickxKQz2Q4qYgmam0f1gYQ: {
          children: [
            'RrEHs_Z0R12feYdBbMfSwg',
            'SUFjznWkSlSp6MubUT4ZfA',
            'gw8qE-08RxS2S1jZnq15bQ',
            '_XMw7WP4Qhq-sjm5zAxZTg',
            '5RcSTfCmTaqos1oe71GcTw',
            'jqxhfib_ROaQovirk31nIQ',
            'EmvcL4UrSfWAQKUKzxewFQ',
            'wj85tPXcS6SF_w0rRhAfRw',
            'ud7xe8bzR4KBZz8bWZdetg',
            'kkGtVI86SiSIkOny-lsHhg'
          ],
          nextIds: []
        },
        wIR3kCvdTDCzEXEAHahJ5Q: {
          children: [],
          nextIds: []
        },
        SUFjznWkSlSp6MubUT4ZfA: {
          children: [],
          nextIds: []
        },
        tx47O_vURtaLjv_GeLgz1A: {
          children: [],
          nextIds: []
        },
        ud7xe8bzR4KBZz8bWZdetg: {
          children: [],
          nextIds: []
        },
        '5RcSTfCmTaqos1oe71GcTw': {
          children: [],
          nextIds: []
        },
        EmvcL4UrSfWAQKUKzxewFQ: {
          children: [],
          nextIds: []
        },
        '5CidrplaTBqfB1jE4hG5VA': {
          children: [],
          nextIds: []
        },
        'kdygXfs-S0-lSf9xCQOVQQ': {
          children: [],
          nextIds: []
        },
        hqonkt6SRLiWn6cuKQXWxQ: {
          children: [],
          nextIds: []
        },
        jqxhfib_ROaQovirk31nIQ: {
          children: [],
          nextIds: []
        },
        aNqZfUNASJ2YO3Y2jRNnrg: {
          children: [],
          nextIds: []
        },
        'xgT-byN5TASmrO4ZKjifNA': {
          children: [],
          nextIds: []
        },
        'IcE0_Hw3Td-kjrF8wfO98Q': {
          children: [],
          nextIds: []
        },
        PxtLdQSwQ3akJsRRHwuvVg: {
          children: [],
          nextIds: []
        },
        '_XMw7WP4Qhq-sjm5zAxZTg': {
          children: [],
          nextIds: []
        },
        '8e66AUSpQDu_ROUVvF1Vog': {
          children: [],
          nextIds: []
        },
        RrEHs_Z0R12feYdBbMfSwg: {
          children: [],
          nextIds: []
        },
        'wuDbZ8ilQX-SDNp7HhEqpA': {
          children: [],
          nextIds: []
        },
        'gw8qE-08RxS2S1jZnq15bQ': {
          children: [],
          nextIds: []
        }
      },
      executionMetadata: {
        accountId: 'px7xd_BFRCi-pfWPYXVjvw',
        pipelineIdentifier: 'looping_strategies',
        orgIdentifier: 'default',
        projectIdentifier: 'testrr18',
        planExecutionId: 'Q3H5xfo3TWGOQYJX04q4dQ'
      },
      representationStrategy: 'camelCase'
    }
  },
  allNodeMap: {
    I8se3fHaSViLI3mZi0SuNQ: {
      uuid: 'I8se3fHaSViLI3mZi0SuNQ',
      setupId: 'r5BETgmdSwu6A4JmWDZq9A',
      name: 'Shell Script_1',
      identifier: 'ShellScript_1',
      baseFqn: 'pipeline.stages.s1.spec.execution.steps',
      outcomes: {},
      stepParameters: {
        strategyConfig: {
          uuid: 'dfqZyd0dQ8K7MnrPMH4WCA',
          matrixConfig: {
            uuid: 'dNBHSYIjSjGRsZBzuKrfnw',
            axes: {
              service: {
                axisValue: ['svc1', 'svc2', 'svc3']
              },
              env: {
                axisValue: ['env1', 'env2', 'env3']
              }
            },
            expressionAxes: {},
            maxConcurrency: 5
          }
        },
        childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
        maxConcurrency: 5,
        strategyType: 'MATRIX',
        shouldProceedIfFailed: true
      },
      startTs: 1673549407211,
      endTs: 1673549421803,
      stepType: 'STRATEGY',
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
          children: {
            children: [
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 0,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env1',
                      service: 'svc1'
                    },
                    matrixCombination: [0, 0],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 1,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env2',
                      service: 'svc1'
                    },
                    matrixCombination: [0, 1],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 2,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env3',
                      service: 'svc1'
                    },
                    matrixCombination: [0, 2],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 3,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env1',
                      service: 'svc2'
                    },
                    matrixCombination: [1, 0],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 4,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env2',
                      service: 'svc2'
                    },
                    matrixCombination: [1, 1],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 5,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env3',
                      service: 'svc2'
                    },
                    matrixCombination: [1, 2],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 6,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env1',
                      service: 'svc3'
                    },
                    matrixCombination: [2, 0],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 7,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env2',
                      service: 'svc3'
                    },
                    matrixCombination: [2, 1],
                    subType: ''
                  }
                }
              },
              {
                childNodeId: 'dfqZyd0dQ8K7MnrPMH4WCA',
                strategyMetadata: {
                  currentIteration: 8,
                  totalIterations: 9,
                  matrixMetadata: {
                    matrixValues: {
                      env: 'env3',
                      service: 'svc3'
                    },
                    matrixCombination: [2, 2],
                    subType: ''
                  }
                }
              }
            ],
            maxConcurrency: '5',
            logKeys: [],
            shouldProceedIfFailed: true
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
    }
  }
}
