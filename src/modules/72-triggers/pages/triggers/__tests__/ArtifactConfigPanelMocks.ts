/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const iValues = {
  manifestType: 'HelmChart',
  resolvedPipeline: {
    name: 'test-manifest',
    identifier: 'testmanifest',
    projectIdentifier: 'mtran',
    orgIdentifier: 'harness',
    tags: {},
    stages: [
      {
        stage: {
          name: 'stage',
          identifier: 'stage',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceDefinition: {
                type: 'Kubernetes',
                spec: {
                  artifacts: {
                    sidecars: []
                  },
                  variables: [],
                  manifestOverrideSets: [],
                  manifests: [
                    {
                      manifest: {
                        identifier: 's3manifestid',
                        type: 'HelmChart',
                        spec: {
                          store: {
                            type: 'S3',
                            spec: {
                              connectorRef: '<+input>',
                              bucketName: '<+input>',
                              folderPath: 'chartPath',
                              region: '<+input>'
                            }
                          },
                          chartName: '<+input>',
                          chartVersion: '<+input>',
                          helmVersion: 'V2',
                          skipResourceVersioning: false
                        }
                      }
                    }
                  ]
                }
              },
              serviceRef: '<+input>'
            },
            infrastructure: {
              environmentRef: '<+input>',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: '<+input>',
                  namespace: '<+input>',
                  releaseName: '<+input>'
                }
              },
              allowSimultaneousDeployments: false,
              infrastructureKey: '<+input>'
            },
            execution: {
              steps: [
                {
                  step: {
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment',
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: {
                      skipDryRun: false
                    }
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
      },
      {
        stage: {
          name: 'stage2',
          identifier: 'stage2',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceDefinition: {
                type: 'Kubernetes',
                spec: {
                  artifacts: {
                    sidecars: [],
                    primary: {
                      type: 'DockerRegistry',
                      spec: {
                        connectorRef: 'configurableartifact',
                        imagePath: 'imagePath',
                        tag: '<+input>'
                      }
                    }
                  },
                  manifestOverrideSets: [],
                  manifests: [
                    {
                      manifest: {
                        identifier: 'manifestId',
                        type: 'HelmChart',
                        spec: {
                          store: {
                            type: 'S3',
                            spec: {
                              connectorRef: 'account.sdhgjhgdj',
                              bucketName: '<+input>',
                              folderPath: '<+input>',
                              region: 'us-gov-west-1'
                            }
                          },
                          chartName: 'chartName',
                          chartVersion: 'chartVersion',
                          helmVersion: 'V2',
                          skipResourceVersioning: false
                        }
                      }
                    }
                  ],
                  variables: []
                }
              },
              serviceRef: '<+input>'
            },
            infrastructure: {
              environmentRef: '<+input>',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: 'account.builfarm',
                  namespace: 'a',
                  releaseName: 'a'
                }
              },
              allowSimultaneousDeployments: false,
              infrastructureKey: 'a'
            },
            execution: {
              steps: [
                {
                  step: {
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment',
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: {
                      skipDryRun: false
                    }
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
      },
      {
        stage: {
          name: 'manifest-stage',
          identifier: 'manifeststage',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceDefinition: {
                type: 'Kubernetes',
                spec: {
                  artifacts: {
                    sidecars: []
                  },
                  manifestOverrideSets: [],
                  manifests: [
                    {
                      manifest: {
                        identifier: 'manifest',
                        type: 'K8sManifest',
                        spec: {
                          store: {
                            type: 'Github',
                            spec: {
                              connectorRef: 'configurablemanifest',
                              gitFetchType: 'Branch',
                              paths: ['abc'],
                              repoName: 'reponame',
                              branch: '<+input>'
                            }
                          },
                          skipResourceVersioning: false
                        }
                      }
                    }
                  ],
                  variables: []
                }
              },
              serviceRef: '<+input>'
            },
            infrastructure: {
              environmentRef: '<+input>',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: 'account.builfarm',
                  namespace: 'a',
                  releaseName: 'a'
                }
              },
              allowSimultaneousDeployments: false,
              infrastructureKey: 'a'
            },
            execution: {
              steps: [
                {
                  step: {
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment',
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: {
                      skipDryRun: false
                    }
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
    ]
  },
  inputSetTemplateYamlObj: {
    pipeline: {
      identifier: 'testmanifest',
      stages: [
        {
          stage: {
            identifier: 'stage',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    manifests: [
                      {
                        manifest: {
                          identifier: 's3manifestid',
                          type: 'HelmChart',
                          spec: {
                            store: {
                              type: 'S3',
                              spec: {
                                connectorRef: '<+input>',
                                bucketName: '<+input>',
                                region: '<+input>'
                              }
                            },
                            chartName: '<+input>',
                            chartVersion: '<+input>'
                          }
                        }
                      }
                    ]
                  }
                },
                serviceRef: '<+input>'
              },
              infrastructure: {
                environmentRef: '<+input>',
                infrastructureDefinition: {
                  type: 'KubernetesDirect',
                  spec: {
                    connectorRef: '<+input>',
                    namespace: '<+input>',
                    releaseName: '<+input>'
                  }
                },
                infrastructureKey: '<+input>'
              }
            }
          }
        },
        {
          stage: {
            identifier: 'stage2',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        type: 'DockerRegistry',
                        spec: {
                          tag: '<+input>'
                        }
                      }
                    },
                    manifests: [
                      {
                        manifest: {
                          identifier: 'manifestId',
                          type: 'HelmChart',
                          spec: {
                            store: {
                              type: 'S3',
                              spec: {
                                bucketName: '<+input>',
                                folderPath: '<+input>'
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                },
                serviceRef: '<+input>'
              },
              infrastructure: {
                environmentRef: '<+input>'
              }
            }
          }
        },
        {
          stage: {
            identifier: 'manifeststage',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    manifests: [
                      {
                        manifest: {
                          identifier: 'manifest',
                          type: 'K8sManifest',
                          spec: {
                            store: {
                              type: 'Github',
                              spec: {
                                branch: '<+input>'
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                },
                serviceRef: '<+input>'
              },
              infrastructure: {
                environmentRef: '<+input>'
              }
            }
          }
        }
      ]
    }
  },
  tags: {},
  triggerType: 'Manifest'
}

export const errorInitialValuesWithoutRuntime = {
  resolvedPipeline: {
    name: 'pipeline-test',
    identifier: 'pipelinetest',
    projectIdentifier: 'bhavyatest',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 'deploy',
          identifier: 'deploy',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceRef: '<+input>',
              serviceDefinition: {
                spec: {
                  variables: [],
                  manifests: [],
                  artifacts: {
                    sidecars: [],
                    primary: {
                      spec: {
                        connectorRef: 'account.gcp_ramya',
                        imagePath: 'test',
                        tag: 'test1',
                        registryHostname: 'gcr.io'
                      },
                      type: 'Gcr'
                    }
                  }
                },
                type: 'Kubernetes'
              }
            },
            infrastructure: {
              environmentRef: 'env',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: 'account.ccmng750xx',
                  namespace: 'default',
                  releaseName: 'release-<+INFRA_KEY>'
                }
              },
              allowSimultaneousDeployments: false
            },
            execution: {
              steps: [
                {
                  step: {
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment',
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: {
                      skipDryRun: false
                    }
                  }
                },
                {
                  step: {
                    type: 'K8sScale',
                    name: 'rr',
                    identifier: 'rr',
                    spec: {
                      workload: '<+input>',
                      skipSteadyStateCheck: false,
                      instanceSelection: {
                        type: 'Count',
                        spec: {
                          count: '<+input>'
                        }
                      }
                    },
                    timeout: '10m'
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
    ]
  },
  artifactType: 'Gcr',
  manifestType: undefined,
  stageId: undefined,
  inputSetTemplateYamlObj: {
    name: 'pipeline-test',
    identifier: 'pipelinetest',
    projectIdentifier: 'bhavyatest',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 'deploy',
          identifier: 'deploy',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceRef: '<+input>',
              serviceDefinition: {
                spec: {
                  variables: [],
                  manifests: [],
                  artifacts: {
                    sidecars: [],
                    primary: {
                      spec: {
                        connectorRef: 'account.gcp_ramya',
                        imagePath: 'test',
                        tag: 'test1',
                        registryHostname: 'gcr.io'
                      },
                      type: 'Gcr'
                    }
                  }
                },
                type: 'Kubernetes'
              }
            },
            infrastructure: {
              environmentRef: 'env',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: 'account.ccmng750xx',
                  namespace: 'default',
                  releaseName: 'release-<+INFRA_KEY>'
                }
              },
              allowSimultaneousDeployments: false
            },
            execution: {
              steps: [
                {
                  step: {
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment',
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: {
                      skipDryRun: false
                    }
                  }
                },
                {
                  step: {
                    type: 'K8sScale',
                    name: 'rr',
                    identifier: 'rr',
                    spec: {
                      workload: '<+input>',
                      skipSteadyStateCheck: false,
                      instanceSelection: {
                        type: 'Count',
                        spec: {
                          count: '<+input>'
                        }
                      }
                    },
                    timeout: '10m'
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
    ]
  },
  selectedArtifact: {}
}
export const errorIntitialValuesWithoutAnyArtifact = {
  resolvedPipeline: {
    name: 'pipeline-test',
    identifier: 'pipelinetest',
    projectIdentifier: 'bhavyatest',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 'deploy',
          identifier: 'deploy',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceRef: '<+input>',
              serviceDefinition: {
                spec: {
                  variables: [],
                  manifests: [],
                  artifacts: {
                    sidecars: []
                  }
                },
                type: 'Kubernetes'
              }
            },
            infrastructure: {
              environmentRef: 'env',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: 'account.ccmng750xx',
                  namespace: 'default',
                  releaseName: 'release-<+INFRA_KEY>'
                }
              },
              allowSimultaneousDeployments: false
            },
            execution: {
              steps: [
                {
                  step: {
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment',
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: {
                      skipDryRun: false
                    }
                  }
                },
                {
                  step: {
                    type: 'K8sScale',
                    name: 'rr',
                    identifier: 'rr',
                    spec: {
                      workload: '<+input>',
                      skipSteadyStateCheck: false,
                      instanceSelection: {
                        type: 'Count',
                        spec: {
                          count: '<+input>'
                        }
                      }
                    },
                    timeout: '10m'
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
    ]
  },
  artifactType: 'Gcr',
  manifestType: undefined,
  stageId: undefined,
  inputSetTemplateYamlObj: {
    pipeline: {
      identifier: 'pipelinetest',
      stages: [
        {
          stage: {
            identifier: 'deploy',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                serviceRef: '<+input>'
              },
              execution: {
                steps: [
                  {
                    step: {
                      identifier: 'rr',
                      type: 'K8sScale',
                      spec: {
                        workload: '<+input>',
                        instanceSelection: {
                          type: 'Count',
                          spec: {
                            count: '<+input>'
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  },
  selectedArtifact: {}
}
export const errorIntitialValuesWithoutSelectedArtifact = {
  resolvedPipeline: {
    name: 'pipeline-test',
    identifier: 'pipelinetest',
    projectIdentifier: 'bhavyatest',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 'deploy',
          identifier: 'deploy',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceRef: '<+input>',
              serviceDefinition: {
                spec: {
                  variables: [],
                  manifests: [],
                  artifacts: {
                    sidecars: [],
                    primary: {
                      spec: {
                        connectorRef: 'account.gcp_ramya',
                        imagePath: 'test',
                        tag: '<+input>',
                        registryHostname: 'gcr.io'
                      },
                      type: 'Gcr'
                    }
                  }
                },
                type: 'Kubernetes'
              }
            },
            infrastructure: {
              environmentRef: 'env',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: 'account.ccmng750xx',
                  namespace: 'default',
                  releaseName: 'release-<+INFRA_KEY>'
                }
              },
              allowSimultaneousDeployments: false
            },
            execution: {
              steps: [
                {
                  step: {
                    name: 'Rollout Deployment',
                    identifier: 'rolloutDeployment',
                    type: 'K8sRollingDeploy',
                    timeout: '10m',
                    spec: {
                      skipDryRun: false
                    }
                  }
                },
                {
                  step: {
                    type: 'K8sScale',
                    name: 'rr',
                    identifier: 'rr',
                    spec: {
                      workload: '<+input>',
                      skipSteadyStateCheck: false,
                      instanceSelection: {
                        type: 'Count',
                        spec: {
                          count: '<+input>'
                        }
                      }
                    },
                    timeout: '10m'
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
    ]
  },
  artifactType: 'Ecr',
  manifestType: undefined,
  stageId: undefined,
  inputSetTemplateYamlObj: {
    pipeline: {
      identifier: 'pipelinetest',
      stages: [
        {
          stage: {
            identifier: 'deploy',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                serviceRef: '<+input>',
                serviceDefinition: {
                  type: 'Kubernetes',
                  spec: {
                    artifacts: {
                      primary: {
                        type: 'Gcr',
                        spec: {
                          tag: '<+input>'
                        }
                      }
                    }
                  }
                }
              },
              execution: {
                steps: [
                  {
                    step: {
                      identifier: 'rr',
                      type: 'K8sScale',
                      spec: {
                        workload: '<+input>',
                        instanceSelection: {
                          type: 'Count',
                          spec: {
                            count: '<+input>'
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  },
  selectedArtifact: {}
}
