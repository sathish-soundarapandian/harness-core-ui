/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ArtifactListConfig, ServiceSpec, SidecarArtifact } from 'services/cd-ng'

export const props = {
  template: {
    artifacts: {
      sidecars: [
        {
          sidecar: {
            identifier: 'Sidecar ECR',
            type: 'Ecr',
            spec: {
              imagePath: '<+input>',
              tag: '<+input>',
              region: '<+input>'
            }
          }
        },
        {
          sidecar: {
            identifier: 'FLSDJF',
            type: 'Ecr',
            spec: {
              connectorRef: '<+input>',
              imagePath: '<+input>',
              tag: '<+input>',
              region: '<+input>'
            }
          }
        }
      ],
      primary: {
        type: 'Gcr',
        spec: {
          connectorRef: '<+input>',
          imagePath: '<+input>',
          tag: '<+input>',
          registryHostname: '<+input>'
        }
      }
    }
  } as ServiceSpec,
  artifacts: {
    sidecars: [
      {
        sidecar: {
          spec: {
            connectorRef: 'AWS_Connector_test',
            imagePath: '<+input>',
            tag: '<+input>',
            region: '<+input>'
          },
          identifier: 'Sidecar ECR',
          type: 'Ecr'
        }
      },
      {
        sidecar: {
          spec: {
            connectorRef: '<+input>',
            imagePath: '<+input>',
            tag: '<+input>',
            region: '<+input>'
          },
          identifier: 'FLSDJF',
          type: 'Ecr'
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: '<+input>',
        imagePath: '<+input>',
        tag: '<+input>',
        registryHostname: '<+input>'
      },
      type: 'Gcr'
    }
  } as ArtifactListConfig,
  stepViewType: 'DeploymentForm' as StepViewType,
  stageIdentifier: 'STG1',
  formik: {
    values: {
      identifier: 'Tamaras_pipeline',
      stages: [
        {
          stage: {
            identifier: 'STG1',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                serviceRef: '',
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      sidecars: [
                        {
                          sidecar: {
                            identifier: 'Sidecar ECR',
                            type: 'Ecr',
                            spec: {
                              imagePath: '',
                              tag: '',
                              region: ''
                            }
                          }
                        },
                        {
                          sidecar: {
                            identifier: 'FLSDJF',
                            type: 'Ecr',
                            spec: {
                              connectorRef: '',
                              imagePath: '',
                              tag: '',
                              region: ''
                            }
                          }
                        },
                        {
                          sidecar: {
                            identifier: 'Sidecar ECR-2',
                            type: 'Ecr',
                            spec: {
                              imagePath: '',
                              tag: '',
                              region: ''
                            }
                          }
                        },
                        {
                          sidecar: {
                            identifier: 'Sidecar ECR-3',
                            type: 'Ecr',
                            spec: {
                              imagePath: '',
                              tag: '',
                              region: '',
                              digest: '<+input>'
                            }
                          }
                        },
                        {
                          sidecar: {
                            identifier: 'Sidecar ECR-4',
                            type: 'Ecr',
                            spec: {
                              imagePath: '',
                              tag: '',
                              region: ''
                            }
                          }
                        },
                        {
                          sidecar: {
                            identifier: 'Sidecar ECR-5',
                            type: 'Ecr',
                            spec: {
                              imagePath: '',
                              tag: '',
                              region: '',
                              digest: '<+input>'
                            }
                          }
                        }
                      ],
                      primary: {
                        type: 'Gcr',
                        spec: {
                          connectorRef: '',
                          imagePath: '',
                          tag: '',
                          registryHostname: ''
                        }
                      }
                    }
                  }
                }
              },
              infrastructure: {
                infrastructureDefinition: {
                  type: 'KubernetesDirect',
                  spec: {
                    connectorRef: ''
                  }
                }
              }
            }
          }
        }
      ]
    },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    dirty: false,
    isValid: false,
    initialValues: {
      identifier: 'Tamaras_pipeline',
      stages: [
        {
          stage: {
            identifier: 'STG1',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                serviceRef: '',
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      sidecars: [
                        {
                          sidecar: {
                            identifier: 'Sidecar ECR',
                            type: 'Ecr',
                            spec: {
                              imagePath: '',
                              tag: '',
                              region: ''
                            }
                          }
                        },
                        {
                          sidecar: {
                            identifier: 'FLSDJF',
                            type: 'Ecr',
                            spec: {
                              connectorRef: '',
                              imagePath: '',
                              tag: '',
                              region: '',
                              digest: '<+input>'
                            }
                          }
                        }
                      ],
                      primary: {
                        type: 'Gcr',
                        spec: {
                          connectorRef: '',
                          imagePath: '',
                          tag: '',
                          registryHostname: ''
                        }
                      }
                    } as ArtifactListConfig
                  }
                }
              },
              infrastructure: {
                infrastructureDefinition: {
                  type: 'KubernetesDirect',
                  spec: {
                    connectorRef: ''
                  }
                }
              }
            }
          }
        }
      ]
    },
    validateOnChange: true,
    validateOnBlur: true,
    disabled: false,
    inline: false
  },
  path: 'stages[0].stage.spec.serviceConfig.serviceDefinition.spec',
  initialValues: {
    artifacts: {
      sidecars: [
        {
          sidecar: {
            identifier: 'Sidecar ECR',
            type: 'Ecr',
            spec: {
              imagePath: '',
              tag: '',
              region: ''
            }
          }
        },
        {
          sidecar: {
            identifier: 'FLSDJF',
            type: 'Ecr',
            spec: {
              connectorRef: '',
              imagePath: '',
              tag: '',
              region: ''
            }
          }
        }
      ],
      primary: {
        type: 'Gcr',
        spec: {
          connectorRef: '',
          imagePath: '',
          tag: '',
          registryHostname: ''
        }
      }
    } as ArtifactListConfig
  },
  readonly: false,
  allowableTypes: ['FIXED', 'EXPRESSION'],
  isArtifactsRuntime: true,
  isPrimaryArtifactsRuntime: true,
  isSidecarRuntime: true,
  projectIdentifier: 'Test_Yunus',
  orgIdentifier: 'default',
  accountId: 'zEaak-FLS425IEO7OLzMUg',
  pipelineIdentifier: 'Tamaras_pipeline',
  artifactPath: 'sidecars[4].sidecar',
  isSidecar: true,
  artifact: {
    spec: {
      connectorRef: '<+input>',
      imagePath: '<+input>',
      tag: '<+input>',
      region: '<+input>'
    },
    identifier: 'FLSDJF',
    type: 'Ecr'
  } as SidecarArtifact
}
