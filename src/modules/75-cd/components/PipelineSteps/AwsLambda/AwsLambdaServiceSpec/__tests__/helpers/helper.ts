/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

export const updateStageArgAwsLambdaFunctionDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsLambdaFunctionDefinition,
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

export const updateStageArgAwsLambdaFunctionAliasDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
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

export const updateStageArgFunctionDefinitionUpdate = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsLambdaFunctionDefinition,
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
                identifier: 'AwsLambdaFunctionAliasDefinition_Manifest',
                type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsLambda/functionAliasDefinition.json'],
                      branch: 'function_alias_definition'
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

export const updateStageArgAwsLambdaFunctionDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'AwsLambdaFunctionAliasDefinition_Manifest',
                type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsLambda/functionAliasDefinition.json'],
                      branch: 'function_alias_definition'
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

export const updateStageArgAwsLambdaFunctionAliasDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'AwsLambdaFunctionDefinition_Manifest',
                type: ManifestDataType.AwsLambdaFunctionDefinition,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsLambda/functionDefinition.json'],
                      branch: 'function_definition'
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

export const updateStageArgForPropagatedStageWithAwsLambdaFunctionDefinitionManifest = {
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
              type: ManifestDataType.AwsLambdaFunctionDefinition,
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
