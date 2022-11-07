/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const pipelineMock = {
  state: {
    pipeline: {
      name: 't4',
      identifier: 't4',
      gitOpsEnabled: false,
      stages: [
        {
          stage: {
            name: 'Stage Name',
            identifier: 'stage_id',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  type: 'Ssh',
                  spec: {
                    configFiles: [
                      {
                        configFile: {
                          identifier: 'e2',
                          spec: {
                            store: {
                              type: 'Harness',
                              spec: {
                                files: ['account:/test99']
                              }
                            }
                          }
                        }
                      }
                    ],
                    artifacts: {
                      primary: {
                        primaryArtifactRef: '<+input>',
                        sources: [
                          {
                            spec: {
                              connectorRef: '<+input>',
                              artifactDirectory: 'a',
                              artifactPath: '<+input>',
                              repository: '<+input>',
                              repositoryFormat: 'generic'
                            },
                            identifier: 'a',
                            type: 'ArtifactoryRegistry'
                          }
                        ]
                      }
                    }
                  }
                },
                serviceRef: 't4'
              }
            }
          }
        }
      ]
    },
    originalPipeline: {
      name: 't4',
      identifier: 't4',
      gitOpsEnabled: false,
      stages: [
        {
          stage: {
            name: 'Stage Name',
            identifier: 'stage_id',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  type: 'Ssh',
                  spec: {
                    configFiles: [
                      {
                        configFile: {
                          identifier: 'e2',
                          spec: {
                            store: {
                              type: 'Harness',
                              spec: {
                                files: ['account:/test99']
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                },
                serviceRef: 't4'
              }
            }
          }
        }
      ]
    },
    pipelineIdentifier: '-1',
    pipelineView: {
      isSplitViewOpen: false,
      isDrawerOpened: false,
      isYamlEditable: false,
      splitViewData: {},
      drawerData: {
        type: 'AddCommand'
      }
    },
    schemaErrors: false,
    storeMetadata: {},
    gitDetails: {},
    entityValidityDetails: {},
    templateTypes: {},
    templateServiceData: {},
    resolvedCustomDeploymentDetailsByRef: {},
    isLoading: false,
    isIntermittentLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: false,
    isUpdated: true,
    modules: [],
    isInitialized: true,
    selectionState: {
      selectedStageId: 'stage_id'
    },
    error: ''
  }
}
