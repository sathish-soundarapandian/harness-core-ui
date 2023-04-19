/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse, ResponseListEnvironmentResponse } from 'services/cd-ng'

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'test',
        identifier: 'test',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        tags: {},
        type: 'Github',
        spec: {
          url: 'github.com/account',
          authentication: {
            type: 'Http',
            spec: {
              type: 'UsernamePassword',
              spec: {
                username: 'username',
                usernameRef: null,
                passwordRef: 'HARNESS_IMAGE_PASSWORD'
              }
            }
          },
          apiAccess: null,
          delegateSelectors: [],
          type: 'Account'
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const GetEnvironmentList: UseGetReturnData<ResponseListEnvironmentResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: [
      {
        environment: {
          accountId: 'accountId',
          orgIdentifier: 'default',
          projectIdentifier: 'p1',
          identifier: 'prod',
          name: 'prod',
          description: null as unknown as undefined,
          color: '#0063F7',
          type: 'Production',
          deleted: false,
          tags: {}
        }
      }
    ],
    correlationId: 'dbc7238c-380f-4fe0-b160-a29510cfe0c8'
  }
}

export const originalPipeline = {
  version: 1,
  name: 'Yaml Simp Inline',
  inputs: {
    image: {
      type: 'string',
      desc: 'image name',
      default: 'golang',
      required: true
    },
    repo: {
      type: 'string',
      desc: 'repository name',
      required: true,
      prompt: true
    }
  },
  repository: '{connector: "gitconnector", name: "<+inputs.repo>"}',
  stages: '[{…}]'
}

export const getTriggerConfigInitialValues = ({
  sourceRepo
}: {
  sourceRepo?: string
}): {
  identifier: string
  sourceRepo: string
  triggerType: string
  originalPipeline: any
} => ({
  identifier: '',
  sourceRepo: sourceRepo || 'Github',
  triggerType: 'Webhook',
  originalPipeline
})

export const pipelineInputInitialValues = {
  identifier: '',
  originalPipeline: originalPipeline,
  resolvedPipeline: originalPipeline,
  pipeline: originalPipeline,
  sourceRepo: 'GITHUB',
  triggerType: 'Webhook'
}

export const getTriggerConfigDefaultProps = ({ isEdit = false }: { isEdit?: boolean }) => ({
  isEdit,
  formikProps: {
    values: {
      triggerType: 'Artifact',
      identifier: 'sdf',
      tags: {},
      artifactType: 'DockerRegistry',
      pipeline: {
        identifier: 'SampleTestArtifactsshaurya',
        stages: [
          {
            stage: {
              identifier: 's1',
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
                            tag: '<+trigger.artifact.build>'
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
                      namespace: 'sdfsdf'
                    }
                  }
                }
              }
            }
          }
        ]
      },
      originalPipeline: originalPipeline,
      resolvedPipeline: originalPipeline,
      inputSetTemplateYamlObj: {
        pipeline: {
          identifier: 'SampleTestArtifactsshaurya',
          stages: [
            {
              stage: {
                identifier: 's1',
                type: 'Deployment',
                spec: {
                  serviceConfig: {
                    serviceDefinition: {
                      spec: {
                        artifacts: {
                          primary: {
                            type: 'DockerRegistry',
                            spec: {
                              tag: '<+input>'
                            }
                          },
                          sidecars: []
                        }
                      }
                    }
                  },
                  infrastructure: {
                    infrastructureDefinition: {
                      type: 'KubernetesDirect',
                      spec: {
                        namespace: '<+input>'
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      },
      selectedArtifact: {
        type: 'DockerRegistry',
        spec: {
          tag: '<+trigger.artifact.build>'
        }
      },
      name: 'sdf',
      stageId: 's1',
      stages: [
        {
          stage: {
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  spec: {
                    artifacts: {
                      primary: {
                        type: 'DockerRegistry',
                        spec: {
                          tag: '<+trigger.artifact.build>'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  }
})
