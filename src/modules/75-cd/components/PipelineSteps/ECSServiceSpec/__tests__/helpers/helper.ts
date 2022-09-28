/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'

export const updateStageArgEcsTaskDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.EcsTaskDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgEcsServiceDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.EcsServiceDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgEcsScallingPolicyDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.EcsScalingPolicyDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgEcsScalableTargetDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.EcsScalableTargetDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgEcsTaskDefinitionManifestUpdate = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.EcsTaskDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ServiceDefinition_Manifest',
                type: 'EcsServiceDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/servicedef.json'],
                      branch: 'service_definition'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScallingPolicy_Manifest',
                type: 'EcsScalingPolicyDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalingpolicy.json'],
                      branch: 'scalling_policy'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScalableTarget_Manifest',
                type: 'EcsScalableTargetDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalabletarget.json'],
                      branch: 'scalable_target'
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
}

export const updateStageArgManifestUpdateForPropagatedStage = {
  name: 'Stage 2',
  identifier: 'Stage_2',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      useFromStage: {
        stage: 'Stage_1'
      },
      stageOverrides: {
        artifacts: { sidecars: [], primary: null },
        manifests: [
          {
            manifest: {
              identifier: 'testidentifier',
              type: ManifestDataType.EcsTaskDefinition,
              spec: {
                store: {
                  spec: {
                    branch: 'testBranch',
                    connectorRef: 'Git_CTR',
                    gitFetchType: 'Branch',
                    paths: ['test-path']
                  },
                  type: 'Git'
                }
              }
            }
          }
        ]
      }
    }
  }
}

export const updateStageArgEcsTaskDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'ServiceDefinition_Manifest',
                type: 'EcsServiceDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/servicedef.json'],
                      branch: 'service_definition'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScallingPolicy_Manifest',
                type: 'EcsScalingPolicyDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalingpolicy.json'],
                      branch: 'scalling_policy'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScalableTarget_Manifest',
                type: 'EcsScalableTargetDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalabletarget.json'],
                      branch: 'scalable_target'
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
}

export const updateStageArgEcsServiceDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'TaskDefinition_Manifest',
                type: ManifestDataType.EcsTaskDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'task_definition',
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/taskdef.json']
                    },
                    type: 'Git'
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScallingPolicy_Manifest',
                type: 'EcsScalingPolicyDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalingpolicy.json'],
                      branch: 'scalling_policy'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScalableTarget_Manifest',
                type: 'EcsScalableTargetDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalabletarget.json'],
                      branch: 'scalable_target'
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
}

export const updateStageArgEcsScallingPolicyManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'TaskDefinition_Manifest',
                type: ManifestDataType.EcsTaskDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'task_definition',
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/taskdef.json']
                    },
                    type: 'Git'
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ServiceDefinition_Manifest',
                type: 'EcsServiceDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/servicedef.json'],
                      branch: 'service_definition'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScalableTarget_Manifest',
                type: 'EcsScalableTargetDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalabletarget.json'],
                      branch: 'scalable_target'
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
}

export const updateStageArgEcsScalableTargetManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Service_1',
        name: 'Service 1',
        description: ''
      },
      serviceDefinition: {
        type: 'ECS',
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'TaskDefinition_Manifest',
                type: ManifestDataType.EcsTaskDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'task_definition',
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/taskdef.json']
                    },
                    type: 'Git'
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ServiceDefinition_Manifest',
                type: 'EcsServiceDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/servicedef.json'],
                      branch: 'service_definition'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'ScallingPolicy_Manifest',
                type: 'EcsScalingPolicyDefinition',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['ecs/scalingpolicy.json'],
                      branch: 'scalling_policy'
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
}

export const getYaml = () => `
pipeline:
    name: testK8s
    identifier: testK8s
    allowStageExecutions: false
    projectIdentifier: Kapil
    orgIdentifier: default
    tags: {}
    stages:
        - stage:
              name: K8sTest
              identifier: K8sTest
              description: ""
              type: Deployment
              spec:
                  serviceConfig:
                      serviceRef: dascxzcsad
                      serviceDefinition:
                          type: Kubernetes
                          spec:
                              variables: []
                              manifests:
                                  - manifest:
                                        identifier: qcq
                                        type: K8sManifest
                                        spec:
                                            store:
                                                type: Git
                                                spec:
                                                    connectorRef: sdf
                                                    gitFetchType: Branch
                                                    paths:
                                                        - wce
                                                    repoName: wce
                                                    branch: wc
                                            skipResourceVersioning: false
                              artifacts:
                                  primary:
                                      spec:
                                          connectorRef: harnessImage
                                          imagePath: ew
                                          tag: tag
                                      type: DockerRegistry
                                  sidecars:
                                      - sidecar:
                                            spec:
                                                connectorRef: asdasd
                                                imagePath: " fqew"
                                                tag: latestTag
                                            identifier: asc
                                            type: ArtifactoryRegistry
                                      - sidecar:
                                            spec:
                                                connectorRef: AWS_IRSA
                                                imagePath: ev
                                                tag: latestTag
                                                region: us-gov-west-1
                                            identifier: vc3rv
                                            type: Ecr
                                      - sidecar:
                                            spec:
                                                connectorRef: harnessImage
                                                imagePath: erv
                                                tag: latestTag
                                            identifier: verv
                                            type: Nexus3Registry
                  infrastructure: {}
              tags: {}`

export const mockBuildList = {
  status: 'SUCCESS',
  data: {
    buildDetailsList: [
      {
        tag: 'latesttag'
      },
      {
        tag: 'tagNew'
      }
    ]
  }
}

export const initialManifestRuntimeValues = {
  manifests: [
    {
      manifest: {
        identifier: 'TaskDefinition_Manifest',
        type: ManifestDataType.EcsTaskDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: '',
              branch: '',
              paths: ''
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'ServiceDefinition_Manifest',
        type: ManifestDataType.EcsServiceDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: '',
              branch: '',
              paths: ''
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'ScallingPolicy_Manifest',
        type: ManifestDataType.EcsScalingPolicyDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: '',
              branch: '',
              paths: ''
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'ScalableTarget_Manifest',
        type: ManifestDataType.EcsScalableTargetDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: '',
              branch: '',
              paths: ''
            }
          }
        }
      }
    }
  ]
}

export const ecsManifestTemplate = {
  manifests: [
    {
      manifest: {
        identifier: 'TaskDefinition_Manifest',
        type: ManifestDataType.EcsTaskDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'ServiceDefinition_Manifest',
        type: ManifestDataType.EcsServiceDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'ScallingPolicy_Manifest',
        type: ManifestDataType.EcsScalingPolicyDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'ScalableTarget_Manifest',
        type: ManifestDataType.EcsScalableTargetDefinition,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    }
  ]
}
