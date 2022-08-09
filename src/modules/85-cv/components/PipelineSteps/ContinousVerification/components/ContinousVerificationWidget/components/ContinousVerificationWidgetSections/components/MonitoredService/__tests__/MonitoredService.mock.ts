/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockedSelectedDerivedStage = {
  stage: {
    name: 'Test-new',
    identifier: 'Testnew',
    description: '',
    type: 'Deployment',
    spec: {
      serviceConfig: {
        useFromStage: {
          stage: 'Stagedemo'
        }
      },
      infrastructure: {
        environmentRef: 'env550',
        infrastructureDefinition: {
          type: 'KubernetesDirect',
          spec: {
            connectorRef: 'test',
            namespace: 'test',
            releaseName: 'release-<+INFRA_KEY>'
          }
        },
        allowSimultaneousDeployments: false
      },
      execution: {
        steps: [
          {
            step: {
              type: 'Verify',
              name: 'Verify',
              identifier: 'a75bdd45-dfdb-5de3-9d10-5d7d2c38b940',
              spec: {}
            }
          }
        ],
        rollbackSteps: [
          {
            step: {
              name: 'Rollback Rollout Deployment',
              identifier: 'rollbackRolloutDeployment',
              type: 'K8sRollingRollback',
              timeout: '10m',
              spec: {}
            }
          }
        ]
      },
      serviceDependencies: []
    },
    tags: {},
    failureStrategies: [
      {
        onFailure: {
          errors: ['AllErrors'],
          action: {
            type: 'StageRollback'
          }
        }
      }
    ]
  }
}

export const mockedSelectedStageNewDesign = {
  stage: {
    name: 'stage-1',
    identifier: 'stage1',
    description: '',
    type: 'Deployment',
    spec: {
      deploymentType: 'Kubernetes',
      service: {
        serviceRef: 'service1'
      },
      environment: {
        environmentRef: 'env1',
        deployToAll: false,
        infrastructureDefinitions: [
          {
            identifier: 'infra1'
          }
        ]
      },
      execution: {
        steps: [
          {
            step: {
              type: 'Verify',
              name: 'Test',
              identifier: 'Test',
              spec: {
                type: 'Rolling',
                monitoredService: {
                  type: 'Default',
                  spec: {}
                },
                spec: {
                  sensitivity: 'HIGH',
                  duration: '5m',
                  deploymentTag: '<+serviceConfig.artifacts.primary.tag>'
                }
              },
              timeout: '2h',
              failureStrategies: [
                {
                  onFailure: {
                    errors: ['Verification'],
                    action: {
                      type: 'ManualIntervention',
                      spec: {
                        timeout: '2h',
                        onTimeout: {
                          action: {
                            type: 'StageRollback'
                          }
                        }
                      }
                    }
                  }
                },
                {
                  onFailure: {
                    errors: ['Unknown'],
                    action: {
                      type: 'ManualIntervention',
                      spec: {
                        timeout: '2h',
                        onTimeout: {
                          action: {
                            type: 'Ignore'
                          }
                        }
                      }
                    }
                  }
                }
              ]
            }
          }
        ],
        rollbackSteps: [
          {
            step: {
              name: 'Rollback Rollout Deployment',
              identifier: 'rollbackRolloutDeployment',
              type: 'K8sRollingRollback',
              timeout: '10m',
              spec: {}
            }
          }
        ]
      }
    },
    tags: {},
    failureStrategies: [
      {
        onFailure: {
          errors: ['AllErrors'],
          action: {
            type: 'StageRollback'
          }
        }
      }
    ]
  }
}

export const mockedPipeline = {
  name: 'Pipeline-demo',
  identifier: 'Pipelinedemo',
  projectIdentifier: 'Harshil',
  orgIdentifier: 'CV',
  tags: {},
  stages: [
    {
      stage: {
        name: 'Stage-demo',
        identifier: 'Stagedemo',
        description: '',
        type: 'Deployment',
        spec: {
          serviceConfig: {
            serviceRef: 'Newserviceharshil',
            serviceDefinition: {
              type: 'Kubernetes',
              spec: {
                variables: []
              }
            }
          },
          infrastructure: {
            environmentRef: 'newenvharshil',
            infrastructureDefinition: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'Testkube',
                namespace: 'test',
                releaseName: 'release-<+INFRA_KEY>'
              }
            },
            allowSimultaneousDeployments: false
          },
          execution: {
            steps: [
              {
                step: {
                  type: 'Verify',
                  name: 'Verify-demo',
                  identifier: 'Verifydemo',
                  spec: {
                    type: 'Canary',
                    spec: {
                      sensitivity: 'HIGH',
                      duration: '5m',
                      deploymentTag: 'test'
                    }
                  },
                  timeout: '2h',
                  failureStrategies: [
                    {
                      onFailure: {
                        errors: ['Verification'],
                        action: {
                          type: 'ManualIntervention',
                          spec: {
                            timeout: '2h',
                            onTimeout: {
                              action: {
                                type: 'StageRollback'
                              }
                            }
                          }
                        }
                      }
                    },
                    {
                      onFailure: {
                        errors: ['Unknown'],
                        action: {
                          type: 'ManualIntervention',
                          spec: {
                            timeout: '2h',
                            onTimeout: {
                              action: {
                                type: 'Ignore'
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            ],
            rollbackSteps: []
          }
        },
        tags: {},
        failureStrategies: [
          {
            onFailure: {
              errors: ['AllErrors'],
              action: {
                type: 'StageRollback'
              }
            }
          }
        ]
      }
    },
    {
      stage: {
        name: 'Test-new',
        identifier: 'Testnew',
        description: '',
        type: 'Deployment',
        spec: {
          serviceConfig: {
            useFromStage: {
              stage: 'Stagedemo'
            }
          },
          infrastructure: {
            environmentRef: 'env550',
            infrastructureDefinition: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'test',
                namespace: 'test',
                releaseName: 'release-<+INFRA_KEY>'
              }
            },
            allowSimultaneousDeployments: false
          },
          execution: {
            steps: [
              {
                step: {
                  type: 'Verify',
                  name: 'Verify',
                  identifier: 'a75bdd45-dfdb-5de3-9d10-5d7d2c38b940',
                  spec: {}
                }
              }
            ],
            rollbackSteps: [
              {
                step: {
                  name: 'Rollback Rollout Deployment',
                  identifier: 'rollbackRolloutDeployment',
                  type: 'K8sRollingRollback',
                  timeout: '10m',
                  spec: {}
                }
              }
            ]
          },
          serviceDependencies: []
        },
        tags: {},
        failureStrategies: [
          {
            onFailure: {
              errors: ['AllErrors'],
              action: {
                type: 'StageRollback'
              }
            }
          }
        ]
      }
    }
  ]
}
