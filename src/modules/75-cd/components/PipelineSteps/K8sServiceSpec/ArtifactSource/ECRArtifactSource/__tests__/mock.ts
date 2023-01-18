/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceSpec } from 'services/cd-ng'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

export const tagsListData = {
  status: 'SUCCESS',
  data: {
    buildDetailsList: [{ tag: '0.0.1' }, { tag: '0.0.2' }, { tag: '0.0.3' }]
  },
  metaData: null,
  correlationId: '631fb63d-b587-42fd-983f-9cbeba3df618'
}

export const primaryArtifact = {
  primary: {
    spec: {
      connectorRef: '<+input>',
      region: '<+input>',
      imagePath: '<+input>',
      tag: '<+input>'
    },
    type: ENABLED_ARTIFACT_TYPES.Ecr
  }
}

export const templateECRArtifactWithoutConnectorRef: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        region: '<+input>',
        imagePath: '<+input>',
        tag: '<+input>'
      },
      type: ENABLED_ARTIFACT_TYPES.Ecr
    }
  }
}

export const templateECRArtifact: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        region: '<+input>',
        imagePath: '<+input>',
        tag: '<+input>'
      },
      type: ENABLED_ARTIFACT_TYPES.Ecr
    }
  }
}

export const templateECRArtifactWithTagRegex: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        region: '<+input>',
        imagePath: '<+input>',
        tagRegex: '<+input>'
      },
      type: ENABLED_ARTIFACT_TYPES.Ecr
    }
  }
}

export const commonFormikInitialValues = {
  pipeline: {
    name: 'Pipeline 1',
    identifier: 'Pipeline_1',
    projectIdentifier: 'testProject',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 'Stage 1',
          identifier: 'Stage_1',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceRef: 's1',
              serviceDefinition: {
                spec: {
                  variables: [],
                  artifacts: {
                    primary: {
                      spec: {
                        connectorRef: '<+input>',
                        region: '<+input>',
                        imagePath: '<+input>',
                        tag: '<+input>'
                      },
                      type: ENABLED_ARTIFACT_TYPES.Ecr
                    },
                    sidecars: [
                      {
                        sidecar: {
                          spec: {
                            connectorRef: '<+input>',
                            region: '<+input>',
                            imagePath: '<+input>',
                            tag: '<+input>'
                          },
                          identifier: 'sidecar_runtime_id',
                          type: ENABLED_ARTIFACT_TYPES.Ecr
                        }
                      }
                    ]
                  }
                },
                type: ServiceDeploymentType.Kubernetes
              }
            },
            infrastructure: {
              environmentRef: 'e1',
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  connectorRef: 'c1',
                  namespace: 'ns',
                  releaseName: 'release-<+INFRA_KEY>'
                }
              },
              allowSimultaneousDeployments: false
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'ShellScript',
                    name: 'Step 1',
                    identifier: 'Step_1',
                    spec: {
                      shell: 'Bash',
                      onDelegate: true,
                      source: {
                        type: 'Inline',
                        spec: {
                          script: "echo 'Amazon S3 pipeline step'"
                        }
                      },
                      environmentVariables: [],
                      outputVariables: [],
                      executionTarget: {}
                    },
                    timeout: '10m'
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
      }
    ]
  }
}

export const awsRegionsData = {
  metaData: {},
  resource: [
    {
      name: 'GovCloud (US-West)',
      value: 'us-gov-west-1',
      valueType: null
    },
    {
      name: 'GovCloud (US-East)',
      value: 'us-gov-east-1',
      valueType: null
    },
    {
      name: 'US East (N. Virginia)',
      value: 'us-east-1',
      valueType: null
    },
    {
      name: 'US East (Ohio)',
      value: 'us-east-2',
      valueType: null
    },
    {
      name: 'US West (N. California)',
      value: 'us-west-1',
      valueType: null
    },
    {
      name: 'US West (Oregon)',
      value: 'us-west-2',
      valueType: null
    }
  ],
  responseMessages: []
}
