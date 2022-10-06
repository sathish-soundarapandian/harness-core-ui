/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockStageReturnWithoutManifestData = {
  stage: {
    stage: {
      name: 'Stage Name',
      identifier: 'stage_id',
      spec: {
        serviceConfig: {
          serviceDefinition: {
            type: 'Kubernetes',
            spec: {}
          },
          serviceRef: 'Service_1'
        }
      }
    }
  }
}

export const specObjectWithData = {
  manifests: [
    {
      manifest: {
        identifier: 'ferg',
        type: 'K8sManifest',
        spec: {
          store: {
            type: 'Github',
            spec: {
              connectorRef: 'account.WingsSoftware',
              gitFetchType: 'Branch',
              paths: ['fr'],
              repoName: 'rfg',
              branch: 'fr'
            }
          },
          skipResourceVersioning: false
        }
      }
    }
  ]
}

export const mockStageReturnWithManifest = {
  stage: {
    stage: {
      name: 'Stage Name',
      identifier: 'stage_id',
      spec: {
        serviceConfig: {
          serviceDefinition: {
            type: 'Kubernetes',
            spec: {
              manifests: [
                {
                  manifest: {
                    identifier: 'ferg',
                    type: 'K8sManifest',
                    spec: {
                      store: {
                        type: 'Github',
                        spec: {
                          connectorRef: 'account.WingsSoftware',
                          gitFetchType: 'Branch',
                          paths: ['fr'],
                          repoName: 'rfg',
                          branch: 'fr'
                        }
                      },
                      skipResourceVersioning: false
                    }
                  }
                }
              ]
            }
          },
          serviceRef: 'Service_1'
        }
      }
    }
  }
}

export const pipelineMock = {
  state: {
    pipeline: {
      name: 'Service 1',
      identifier: 'Service_1',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'Stage Name',
            identifier: 'stage_id',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {}
                },
                serviceRef: 'Service_1'
              }
            }
          }
        }
      ]
    },
    selectionState: {
      selectedStageId: 'stage_id'
    },
    allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'],
    isReadonly: 'false'
  }
}

export const serviceContextData = {
  isServiceEntityModalView: false,
  isServiceCreateModalView: false,
  selectedDeploymentType: '',
  gitOpsEnabled: false
}
