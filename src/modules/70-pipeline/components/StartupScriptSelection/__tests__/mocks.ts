/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const pipelineContextMock = {
  state: {
    pipeline: {
      name: 'Pipeline 1',
      identifier: 'Pipeline_1',
      description: '',
      tags: {},
      stages: [
        {
          stage: {
            name: 'Deploy Service',
            identifier: 'Deploy_Service',
            description: '',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                service: {
                  identifier: 'Deploy_Stage',
                  name: 'Deploy Stage',
                  description: ''
                },
                serviceDefinition: {
                  type: 'AzureWebApp',
                  spec: {
                    artifacts: { sidecars: [], primary: null },
                    startupCommand: {
                      store: {
                        type: 'Git',
                        spec: {
                          connectorRef: 'GIT2',
                          gitFetchType: 'Branch',
                          paths: '[filePath]',
                          branch: 'branch'
                        }
                      }
                    },
                    applicationSettings: {
                      store: {
                        type: 'Git',
                        spec: {
                          connectorRef: 'GIT2',
                          gitFetchType: 'Branch',
                          paths: '[filePath]',
                          branch: 'branch'
                        }
                      }
                    },
                    connectionStrings: {
                      store: {
                        type: 'Git',
                        spec: {
                          connectorRef: 'GIT2',
                          gitFetchType: 'Branch',
                          paths: '[filePath]',
                          branch: 'branch'
                        }
                      }
                    },
                    artifactOverrideSets: []
                  }
                },
                tags: {}
              },
              infrastructure: {
                environment: {
                  name: 'Infra Stage Env',
                  identifier: 'Infra_Stage_Env',
                  description: '',
                  type: 'PreProduction'
                },
                infrastructureDefinition: {
                  type: 'KubernetesDirect',
                  spec: { connectorRef: 'account.cidelegate', namespace: 'ns1', releaseName: 'release1' }
                }
              },
              execution: {
                steps: [
                  {
                    step: {
                      name: 'Rollout Deployment',
                      identifier: 'rolloutDeployment',
                      type: 'K8sRollingDeploy',
                      spec: { timeout: '10m', skipDryRun: false }
                    }
                  }
                ],
                rollbackSteps: [
                  {
                    step: {
                      name: 'Rollback Rollout Deployment',
                      identifier: 'rollbackRolloutDeployment',
                      type: 'K8sRollingRollback',
                      spec: { timeout: '10m' }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    selectionState: { selectedStageId: 'Deploy' }
  }
}
