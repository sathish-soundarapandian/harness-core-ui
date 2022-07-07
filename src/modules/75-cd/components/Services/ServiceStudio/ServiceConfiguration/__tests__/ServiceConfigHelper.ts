/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const pipelineContext = {
  state: {
    pipeline: {
      name: 'Service 1',
      identifier: 'Service_1',
      tags: {},
      gitOpsEnabled: false,
      stages: [
        {
          stage: {
            name: 'Stage Name',
            identifier: 'stage_id',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  spec: {}
                },
                serviceRef: 'Service_1'
              }
            }
          }
        }
      ]
    },
    pipelineView: {
      isSplitViewOpen: false,
      isDrawerOpened: false,
      isYamlEditable: false,
      splitViewData: {},
      drawerData: {
        type: 'AddCommand'
      }
    },
    selectionState: {
      selectedStageId: 'stage_id'
    }
  },
  allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'],
  isReadOnly: false
}
export const serviceContextData = {
  isServiceEntityModalView: false,
  isServiceCreateModalView: false,
  selectedDeploymentType: '',
  gitOpsEnabled: false
}

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

export const serviceConfigProps = {
  service: {
    name: 'Service 1',
    identifier: 'Service_1',
    tags: {},
    serviceDefinition: {
      spec: {}
    }
  }
} as any

export const serviceSchemaMock = {
  status: 'SUCCESS',
  data: {
    type: 'object',
    properties: {
      metadata: {
        type: 'string'
      },
      service: {
        $ref: '#/definitions/NGServiceV2InfoConfig'
      }
    },
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
      AcrArtifactConfig: {
        allOf: [
          {
            $ref: '#/definitions/ArtifactConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'registry', 'repository', 'subscriptionId'],
            properties: {
              connectorRef: {
                type: 'string'
              },
              registry: {
                type: 'string'
              },
              repository: {
                type: 'string'
              },
              subscriptionId: {
                type: 'string'
              },
              tag: {
                type: 'string'
              },
              tagRegex: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['tagRegex']
              },
              {
                required: ['tag']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ArtifactConfig: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ArtifactListConfig: {
        type: 'object',
        properties: {
          primary: {
            $ref: '#/definitions/PrimaryArtifact'
          },
          sidecars: {
            type: 'array',
            items: {
              $ref: '#/definitions/SidecarArtifactWrapper'
            }
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ArtifactOverrideSetWrapper: {
        type: 'object',
        properties: {
          overrideSet: {
            $ref: '#/definitions/ArtifactOverrideSets'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ArtifactOverrideSets: {
        type: 'object',
        properties: {
          artifacts: {
            $ref: '#/definitions/ArtifactListConfig'
          },
          identifier: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ArtifactoryRegistryArtifactConfig: {
        allOf: [
          {
            $ref: '#/definitions/ArtifactConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'repository', 'repositoryFormat'],
            properties: {
              artifactDirectory: {
                type: 'string'
              },
              artifactPath: {
                type: 'string'
              },
              artifactPathFilter: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              repository: {
                type: 'string'
              },
              repositoryFormat: {
                type: 'string',
                enum: ['docker', 'generic']
              },
              repositoryUrl: {
                type: 'string'
              },
              tag: {
                type: 'string'
              },
              tagRegex: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ArtifactoryStoreConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'repositoryName'],
            properties: {
              artifactPaths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              connectorRef: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              },
              repositoryName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      BitbucketStore: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'gitFetchType'],
            properties: {
              branch: {
                type: 'string'
              },
              commitId: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              folderPath: {
                type: 'string'
              },
              gitFetchType: {
                type: 'string',
                enum: ['Branch', 'Commit']
              },
              paths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              repoName: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['commitId']
              },
              {
                required: ['branch']
              }
            ]
          },
          {
            oneOf: [
              {
                required: ['folderPath']
              },
              {
                required: ['paths']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ConfigFile: {
        type: 'object',
        required: ['identifier', 'spec'],
        properties: {
          identifier: {
            type: 'string'
          },
          spec: {
            $ref: '#/definitions/ConfigFileAttributes'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ConfigFileAttributeStepParameters: {
        type: 'object',
        properties: {
          store: {
            $ref: '#/definitions/StoreConfigWrapperParameters'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ConfigFileAttributes: {
        type: 'object',
        required: ['store'],
        properties: {
          configFileAttributeStepParameters: {
            $ref: '#/definitions/ConfigFileAttributeStepParameters'
          },
          store: {
            $ref: '#/definitions/StoreConfigWrapper'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ConfigFileOverrideSetWrapper: {
        type: 'object',
        properties: {
          overrideSet: {
            $ref: '#/definitions/ConfigFileOverrideSets'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ConfigFileOverrideSets: {
        type: 'object',
        properties: {
          configFiles: {
            type: 'array',
            items: {
              $ref: '#/definitions/ConfigFileWrapper'
            }
          },
          identifier: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ConfigFileWrapper: {
        type: 'object',
        properties: {
          configFile: {
            $ref: '#/definitions/ConfigFile'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      CustomArtifactConfig: {
        allOf: [
          {
            $ref: '#/definitions/ArtifactConfig'
          },
          {
            type: 'object',
            required: ['version'],
            properties: {
              version: {
                oneOf: [
                  {
                    $ref: '#/definitions/ParameterFieldString'
                  },
                  {
                    type: 'string'
                  }
                ]
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      DockerHubArtifactConfig: {
        allOf: [
          {
            $ref: '#/definitions/ArtifactConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'imagePath'],
            properties: {
              connectorRef: {
                type: 'string'
              },
              imagePath: {
                type: 'string'
              },
              tag: {
                type: 'string'
              },
              tagRegex: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['tagRegex']
              },
              {
                required: ['tag']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      EcrArtifactConfig: {
        allOf: [
          {
            $ref: '#/definitions/ArtifactConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'imagePath', 'region'],
            properties: {
              connectorRef: {
                type: 'string'
              },
              imagePath: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              },
              region: {
                type: 'string'
              },
              tag: {
                type: 'string'
              },
              tagRegex: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['tagRegex']
              },
              {
                required: ['tag']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GcrArtifactConfig: {
        allOf: [
          {
            $ref: '#/definitions/ArtifactConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'imagePath', 'registryHostname'],
            properties: {
              connectorRef: {
                type: 'string'
              },
              imagePath: {
                type: 'string'
              },
              registryHostname: {
                type: 'string'
              },
              tag: {
                type: 'string'
              },
              tagRegex: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['tagRegex']
              },
              {
                required: ['tag']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GcsStoreConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            properties: {
              bucketName: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              folderPath: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitLabStore: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'gitFetchType'],
            properties: {
              branch: {
                type: 'string'
              },
              commitId: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              folderPath: {
                type: 'string'
              },
              gitFetchType: {
                type: 'string',
                enum: ['Branch', 'Commit']
              },
              paths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              repoName: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['commitId']
              },
              {
                required: ['branch']
              }
            ]
          },
          {
            oneOf: [
              {
                required: ['folderPath']
              },
              {
                required: ['paths']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitStore: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'gitFetchType'],
            properties: {
              branch: {
                type: 'string'
              },
              commitId: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              folderPath: {
                type: 'string'
              },
              gitFetchType: {
                type: 'string',
                enum: ['Branch', 'Commit']
              },
              paths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              repoName: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['commitId']
              },
              {
                required: ['branch']
              }
            ]
          },
          {
            oneOf: [
              {
                required: ['folderPath']
              },
              {
                required: ['paths']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GithubStore: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'gitFetchType'],
            properties: {
              branch: {
                type: 'string'
              },
              commitId: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              folderPath: {
                type: 'string'
              },
              gitFetchType: {
                type: 'string',
                enum: ['Branch', 'Commit']
              },
              paths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              repoName: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['commitId']
              },
              {
                required: ['branch']
              }
            ]
          },
          {
            oneOf: [
              {
                required: ['folderPath']
              },
              {
                required: ['paths']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      HarnessStore: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            properties: {
              files: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      $ref: '#/definitions/HarnessStoreFile'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              secretFiles: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      HarnessStoreFile: {
        type: 'object',
        required: ['path', 'scope'],
        properties: {
          path: {
            type: 'string'
          },
          scope: {
            type: 'string',
            enum: ['account', 'org', 'project', 'unknown']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      HelmChartManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              chartName: {
                type: 'string'
              },
              chartVersion: {
                type: 'string'
              },
              commandFlags: {
                type: 'array',
                items: {
                  $ref: '#/definitions/HelmManifestCommandFlag'
                }
              },
              helmVersion: {
                type: 'string',
                enum: ['V2', 'V3', 'V380']
              },
              metadata: {
                type: 'string'
              },
              skipResourceVersioning: {
                oneOf: [
                  {
                    type: 'boolean'
                  },
                  {
                    type: 'string'
                  }
                ]
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              },
              valuesPaths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      HelmManifestCommandFlag: {
        type: 'object',
        required: ['commandType'],
        properties: {
          commandType: {
            type: 'string',
            enum: [
              'Fetch',
              'Template',
              'Pull',
              'Install',
              'Upgrade',
              'Rollback',
              'History',
              'Delete',
              'Uninstall',
              'List'
            ]
          },
          flag: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      HttpStoreConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            properties: {
              connectorRef: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      InheritFromManifestStoreConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            properties: {
              paths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      InlineStoreConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            required: ['content'],
            properties: {
              content: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      InputSetValidator: {
        type: 'object',
        properties: {
          parameters: {
            type: 'string'
          },
          validatorType: {
            type: 'string',
            enum: ['ALLOWED_VALUES', 'REGEX']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      K8sManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              metadata: {
                type: 'string'
              },
              skipResourceVersioning: {
                oneOf: [
                  {
                    $ref: '#/definitions/ParameterFieldBoolean'
                  },
                  {
                    type: 'string'
                  },
                  {
                    type: 'boolean'
                  }
                ]
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              },
              valuesPaths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      KubernetesServiceSpec: {
        allOf: [
          {
            $ref: '#/definitions/ServiceSpec'
          },
          {
            type: 'object',
            properties: {}
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      KustomizeManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              metadata: {
                type: 'string'
              },
              patchesPaths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              pluginPath: {
                type: 'string'
              },
              skipResourceVersioning: {
                oneOf: [
                  {
                    $ref: '#/definitions/ParameterFieldBoolean'
                  },
                  {
                    type: 'string'
                  },
                  {
                    type: 'boolean'
                  }
                ]
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      KustomizePatchesManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              metadata: {
                type: 'string'
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ManifestAttributes: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ManifestConfig: {
        type: 'object',
        required: ['identifier', 'spec', 'type'],
        properties: {
          identifier: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: [
              'HelmChart',
              'K8sManifest',
              'Kustomize',
              'KustomizePatches',
              'OpenshiftParam',
              'OpenshiftTemplate',
              'Values',
              'ServerlessAwsLambda',
              'ReleaseRepo'
            ]
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'HelmChart'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/HelmChartManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'K8sManifest'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/K8sManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Kustomize'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/KustomizeManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'KustomizePatches'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/KustomizePatchesManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'OpenshiftParam'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/OpenshiftParamManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'OpenshiftTemplate'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/OpenshiftManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'ReleaseRepo'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ReleaseRepoManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'ServerlessAwsLambda'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ServerlessAwsLambdaManifest'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Values'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ValuesManifest'
                }
              }
            }
          }
        ]
      },
      ManifestConfigWrapper: {
        type: 'object',
        properties: {
          manifest: {
            $ref: '#/definitions/ManifestConfig'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ManifestOverrideSetWrapper: {
        type: 'object',
        properties: {
          overrideSet: {
            $ref: '#/definitions/ManifestOverrideSets'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ManifestOverrideSets: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string'
          },
          manifests: {
            type: 'array',
            items: {
              $ref: '#/definitions/ManifestConfigWrapper'
            }
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGServiceConfig: {
        type: 'object',
        properties: {
          metadata: {
            type: 'string'
          },
          service: {
            $ref: '#/definitions/NGServiceV2InfoConfig'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGServiceV2InfoConfig: {
        type: 'object',
        required: ['identifier', 'name'],
        properties: {
          description: {
            type: 'string'
          },
          gitOpsEnabled: {
            type: 'boolean'
          },
          identifier: {
            type: 'string',
            pattern: '^[a-zA-Z_][0-9a-zA-Z_$]{0,63}$'
          },
          metadata: {
            type: 'string'
          },
          name: {
            type: 'string',
            pattern: '^[a-zA-Z_][-0-9a-zA-Z_\\s]{0,63}$'
          },
          serviceDefinition: {
            $ref: '#/definitions/ServiceDefinition'
          },
          tags: {
            type: 'object',
            additionalProperties: {
              type: 'string'
            }
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGVariable: {
        type: 'object',
        discriminator: 'type',
        properties: {
          description: {
            type: 'string'
          },
          metadata: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          required: {
            type: 'boolean'
          },
          type: {
            type: 'string',
            enum: ['String', 'Number', 'Secret']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGVariableOverrideSetWrapper: {
        type: 'object',
        properties: {
          overrideSet: {
            $ref: '#/definitions/NGVariableOverrideSets'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGVariableOverrideSets: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string'
          },
          variables: {
            type: 'array',
            items: {
              oneOf: [
                {
                  $ref: '#/definitions/NumberNGVariable'
                },
                {
                  $ref: '#/definitions/SecretNGVariable'
                },
                {
                  $ref: '#/definitions/StringNGVariable'
                }
              ]
            }
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NativeHelmServiceSpec: {
        allOf: [
          {
            $ref: '#/definitions/ServiceSpec'
          },
          {
            type: 'object',
            properties: {}
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NexusRegistryArtifactConfig: {
        allOf: [
          {
            $ref: '#/definitions/ArtifactConfig'
          },
          {
            type: 'object',
            required: ['artifactPath', 'connectorRef', 'repository', 'repositoryFormat'],
            properties: {
              artifactPath: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              },
              repository: {
                type: 'string'
              },
              repositoryFormat: {
                type: 'string',
                enum: ['docker']
              },
              repositoryPort: {
                oneOf: [
                  {
                    type: 'string'
                  },
                  {
                    type: 'integer'
                  }
                ]
              },
              repositoryUrl: {
                type: 'string'
              },
              tag: {
                type: 'string'
              },
              tagRegex: {
                type: 'string'
              }
            }
          },
          {
            oneOf: [
              {
                required: ['repositoryPort']
              },
              {
                required: ['repositoryUrl']
              }
            ]
          },
          {
            oneOf: [
              {
                required: ['tagRegex']
              },
              {
                required: ['tag']
              }
            ]
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NumberNGVariable: {
        allOf: [
          {
            $ref: '#/definitions/NGVariable'
          },
          {
            type: 'object',
            required: ['value'],
            properties: {
              default: {
                type: 'number',
                format: 'double'
              },
              name: {
                type: 'string',
                pattern: '^[a-zA-Z_][0-9a-zA-Z_$]{0,63}$'
              },
              type: {
                type: 'string',
                enum: ['Number']
              },
              value: {
                oneOf: [
                  {
                    type: 'number',
                    format: 'double'
                  },
                  {
                    type: 'string'
                  }
                ]
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      OciHelmChartConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            properties: {
              basePath: {
                type: 'string'
              },
              config: {
                $ref: '#/definitions/OciHelmChartStoreConfigWrapper'
              },
              metadata: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      OciHelmChartStoreConfig: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      OciHelmChartStoreConfigWrapper: {
        type: 'object',
        required: ['spec', 'type'],
        properties: {
          metadata: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: ['Generic']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'Generic'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/OciHelmChartStoreGenericConfig'
                }
              }
            }
          }
        ]
      },
      OciHelmChartStoreGenericConfig: {
        allOf: [
          {
            $ref: '#/definitions/OciHelmChartStoreConfig'
          },
          {
            type: 'object',
            properties: {
              connectorRef: {
                oneOf: [
                  {
                    $ref: '#/definitions/ParameterFieldString'
                  },
                  {
                    type: 'string'
                  }
                ]
              },
              metadata: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      OpenshiftManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              metadata: {
                type: 'string'
              },
              paramsPaths: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              },
              skipResourceVersioning: {
                oneOf: [
                  {
                    $ref: '#/definitions/ParameterFieldBoolean'
                  },
                  {
                    type: 'string'
                  },
                  {
                    type: 'boolean'
                  }
                ]
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      OpenshiftParamManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              metadata: {
                type: 'string'
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ParameterField: {
        type: 'object',
        properties: {
          defaultValue: {
            type: 'object'
          },
          executionInput: {
            type: 'boolean'
          },
          expression: {
            type: 'boolean'
          },
          expressionValue: {
            type: 'string'
          },
          inputSetValidator: {
            $ref: '#/definitions/InputSetValidator'
          },
          jsonResponseField: {
            type: 'boolean'
          },
          responseField: {
            type: 'string'
          },
          typeString: {
            type: 'boolean'
          },
          value: {
            type: 'object'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ParameterFieldBoolean: {
        type: 'object',
        properties: {
          defaultValue: {
            type: 'boolean'
          },
          executionInput: {
            type: 'boolean'
          },
          expression: {
            type: 'boolean'
          },
          expressionValue: {
            type: 'string'
          },
          inputSetValidator: {
            $ref: '#/definitions/InputSetValidator'
          },
          jsonResponseField: {
            type: 'boolean'
          },
          responseField: {
            type: 'string'
          },
          typeString: {
            type: 'boolean'
          },
          value: {
            type: 'boolean'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ParameterFieldString: {
        type: 'object',
        properties: {
          defaultValue: {
            type: 'string'
          },
          executionInput: {
            type: 'boolean'
          },
          expression: {
            type: 'boolean'
          },
          expressionValue: {
            type: 'string'
          },
          inputSetValidator: {
            $ref: '#/definitions/InputSetValidator'
          },
          jsonResponseField: {
            type: 'boolean'
          },
          responseField: {
            type: 'string'
          },
          typeString: {
            type: 'boolean'
          },
          value: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      PrimaryArtifact: {
        type: 'object',
        required: ['spec', 'type'],
        properties: {
          type: {
            type: 'string',
            enum: [
              'DockerRegistry',
              'Gcr',
              'Ecr',
              'Nexus3Registry',
              'ArtifactoryRegistry',
              'CustomArtifact',
              'Acr',
              'Jenkins'
            ]
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'Acr'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/AcrArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'ArtifactoryRegistry'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ArtifactoryRegistryArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'CustomArtifact'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/CustomArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'DockerRegistry'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/DockerHubArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Ecr'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/EcrArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Gcr'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GcrArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Nexus3Registry'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/NexusRegistryArtifactConfig'
                }
              }
            }
          }
        ]
      },
      ReleaseRepoManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              metadata: {
                type: 'string'
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      S3StoreConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            properties: {
              bucketName: {
                type: 'string'
              },
              connectorRef: {
                type: 'string'
              },
              folderPath: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              },
              region: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      S3UrlStoreConfig: {
        allOf: [
          {
            $ref: '#/definitions/StoreConfig'
          },
          {
            type: 'object',
            required: ['connectorRef', 'region', 'urls'],
            properties: {
              connectorRef: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              },
              region: {
                type: 'string'
              },
              urls: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  {
                    type: 'string',
                    pattern: '^<\\+input>(\\.(allowedValues|regex)\\(.+?\\))*$',
                    minLength: 1
                  }
                ]
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      SecretNGVariable: {
        allOf: [
          {
            $ref: '#/definitions/NGVariable'
          },
          {
            type: 'object',
            required: ['value'],
            properties: {
              default: {
                type: 'string'
              },
              name: {
                type: 'string',
                pattern: '^[a-zA-Z_][0-9a-zA-Z_$]{0,63}$'
              },
              type: {
                type: 'string',
                enum: ['Secret']
              },
              value: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ServerlessAwsLambdaManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              configOverridePath: {
                type: 'string'
              },
              metadata: {
                type: 'string'
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ServerlessAwsLambdaServiceSpec: {
        allOf: [
          {
            $ref: '#/definitions/ServiceSpec'
          },
          {
            type: 'object',
            properties: {}
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ServiceDefinition: {
        type: 'object',
        required: ['spec', 'type'],
        properties: {
          type: {
            type: 'string',
            enum: ['Kubernetes', 'NativeHelm', 'Ssh', 'WinRm', 'ServerlessAwsLambda']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'Kubernetes'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/KubernetesServiceSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'NativeHelm'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/NativeHelmServiceSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'ServerlessAwsLambda'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ServerlessAwsLambdaServiceSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Ssh'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/SshServiceSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'WinRm'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/WinRmServiceSpec'
                }
              }
            }
          }
        ]
      },
      ServiceSpec: {
        type: 'object',
        discriminator: 'type',
        properties: {
          artifacts: {
            $ref: '#/definitions/ArtifactListConfig'
          },
          configFiles: {
            type: 'array',
            items: {
              $ref: '#/definitions/ConfigFileWrapper'
            }
          },
          manifests: {
            type: 'array',
            items: {
              $ref: '#/definitions/ManifestConfigWrapper'
            }
          },
          variables: {
            type: 'array',
            items: {
              $ref: '#/definitions/NGVariable'
            }
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      SidecarArtifact: {
        type: 'object',
        required: ['identifier', 'spec', 'type'],
        properties: {
          identifier: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: [
              'DockerRegistry',
              'Gcr',
              'Ecr',
              'Nexus3Registry',
              'ArtifactoryRegistry',
              'CustomArtifact',
              'Acr',
              'Jenkins'
            ]
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'Acr'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/AcrArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'ArtifactoryRegistry'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ArtifactoryRegistryArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'CustomArtifact'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/CustomArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'DockerRegistry'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/DockerHubArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Ecr'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/EcrArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Gcr'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GcrArtifactConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Nexus3Registry'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/NexusRegistryArtifactConfig'
                }
              }
            }
          }
        ]
      },
      SidecarArtifactWrapper: {
        type: 'object',
        properties: {
          sidecar: {
            $ref: '#/definitions/SidecarArtifact'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      SshServiceSpec: {
        allOf: [
          {
            $ref: '#/definitions/ServiceSpec'
          },
          {
            type: 'object',
            properties: {}
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      StoreConfig: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      StoreConfigWrapper: {
        type: 'object',
        required: ['spec', 'type'],
        properties: {
          metadata: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: [
              'Git',
              'Github',
              'Bitbucket',
              'GitLab',
              'Http',
              'S3',
              'Gcs',
              'Inline',
              'Artifactory',
              'S3Url',
              'InheritFromManifest',
              'Harness',
              'OciHelmChart'
            ]
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'Artifactory'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ArtifactoryStoreConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Bitbucket'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/BitbucketStore'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Gcs'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GcsStoreConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Git'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GitStore'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'GitLab'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GitLabStore'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Github'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GithubStore'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Harness'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/HarnessStore'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Http'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/HttpStoreConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'InheritFromManifest'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/InheritFromManifestStoreConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Inline'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/InlineStoreConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'OciHelmChart'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/OciHelmChartConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'S3'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/S3StoreConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'S3Url'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/S3UrlStoreConfig'
                }
              }
            }
          }
        ]
      },
      StoreConfigWrapperParameters: {
        type: 'object',
        properties: {
          spec: {
            $ref: '#/definitions/StoreConfig'
          },
          type: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      StringNGVariable: {
        allOf: [
          {
            $ref: '#/definitions/NGVariable'
          },
          {
            type: 'object',
            required: ['value'],
            properties: {
              default: {
                type: 'string'
              },
              name: {
                type: 'string',
                pattern: '^[a-zA-Z_][0-9a-zA-Z_$]{0,63}$'
              },
              type: {
                type: 'string',
                enum: ['String']
              },
              value: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ValuesManifest: {
        allOf: [
          {
            $ref: '#/definitions/ManifestAttributes'
          },
          {
            type: 'object',
            properties: {
              metadata: {
                type: 'string'
              },
              store: {
                $ref: '#/definitions/StoreConfigWrapper'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      WinRmServiceSpec: {
        allOf: [
          {
            $ref: '#/definitions/ServiceSpec'
          },
          {
            type: 'object',
            properties: {
              artifactOverrideSets: {
                type: 'array',
                items: {
                  $ref: '#/definitions/ArtifactOverrideSetWrapper'
                }
              },
              configFileOverrideSets: {
                type: 'array',
                items: {
                  $ref: '#/definitions/ConfigFileOverrideSetWrapper'
                }
              },
              manifestOverrideSets: {
                type: 'array',
                items: {
                  $ref: '#/definitions/ManifestOverrideSetWrapper'
                }
              },
              variableOverrideSets: {
                type: 'array',
                items: {
                  $ref: '#/definitions/NGVariableOverrideSetWrapper'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      }
    }
  },
  metaData: null,
  correlationId: 'f9e8def4-74eb-493d-8ad6-6e35d729fada'
}
