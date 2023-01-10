/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'

export const GITOPS_STAGE = {
  id: 'CKzYPtriSYCntiwJj8PrOw',
  identifier: 'Stage',
  type: 'MATRIX',
  name: 'Stage',
  icon: 'circle-cross' as IconName,
  data: {
    nodeType: 'MATRIX',
    nodeGroup: 'STRATEGY',
    nodeIdentifier: 'Stage',
    name: 'Stage',
    nodeUuid: 'CKzYPtriSYCntiwJj8PrOw',
    status: 'Success',
    moduleInfo: {
      stepParameters: {
        __recast: 'io.harness.cdng.pipeline.beans.MultiDeploymentStepParameters',
        services: {
          __recast: 'io.harness.cdng.service.beans.Services',
          uuid: 'AaoV5KL4TXq_PQiwzOLiMg',
          values: {
            __recast: 'parameterField',
            __encodedValue: {
              __recast: 'io.harness.pms.yaml.ParameterDocumentField',
              expressionValue: null,
              expression: false,
              valueDoc: {
                __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                value: [
                  {
                    __recast: 'io.harness.cdng.service.beans.ServiceYamlV2',
                    uuid: 'Z1tmosJYQlSas_uQvlkbiw',
                    serviceRef: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: 'vaibhav_service'
                        },
                        valueClass: 'java.lang.String',
                        typeString: true,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    },
                    serviceInputs: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: {
                            serviceDefinition: {
                              type: 'Kubernetes',
                              spec: {
                                variables: [
                                  {
                                    name: 'var1',
                                    type: 'String',
                                    value: 'val3',
                                    __uuid: 'evVyIQThR52hKvgGMQWycg'
                                  }
                                ],
                                __uuid: '_fAgn46VTfa_7_vihk01jQ'
                              },
                              __uuid: 'ogeVR9PpScuIbo9fgpUYSw'
                            },
                            __uuid: 'QGPiWfGHRqeXcErry2qVyQ'
                          }
                        },
                        valueClass: 'java.util.Map',
                        typeString: false,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    }
                  },
                  {
                    __recast: 'io.harness.cdng.service.beans.ServiceYamlV2',
                    uuid: 'NZlVGKCIRYqcZAaX4D_J5g',
                    serviceRef: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: 'ishant'
                        },
                        valueClass: 'java.lang.String',
                        typeString: true,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    },
                    serviceInputs: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: {
                            serviceDefinition: {
                              type: 'Kubernetes',
                              spec: {
                                variables: [
                                  {
                                    name: 'var1',
                                    type: 'String',
                                    value: 'val3',
                                    __uuid: 'KdoKof6jQyO4zM1Z20vOnw'
                                  }
                                ],
                                __uuid: 'JikCFxqSRx-xBfeKsvtW4g'
                              },
                              __uuid: 'YNDckhUUQNevvrizTV0FJw'
                            },
                            __uuid: 'eVYbXIaCSL29te3JJS0Q5g'
                          }
                        },
                        valueClass: 'java.util.Map',
                        typeString: false,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    }
                  }
                ]
              },
              valueClass: 'java.util.List',
              typeString: false,
              skipAutoEvaluation: false,
              jsonResponseField: false,
              responseField: null
            }
          },
          servicesMetadata: {
            __recast: 'io.harness.cdng.service.beans.ServicesMetadata',
            uuid: 'U92_wltcSRCiA5qsmEeoTA',
            parallel: true
          }
        },
        childNodeId: 'AaoV5KL4TXq_PQiwzOLiMg',
        maxConcurrency: {
          __recast: 'parameterField',
          __encodedValue: {
            __recast: 'io.harness.pms.yaml.ParameterDocumentField',
            expressionValue: null,
            expression: false,
            valueDoc: {
              __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper'
            },
            valueClass: 'java.lang.Integer',
            typeString: false,
            skipAutoEvaluation: false,
            jsonResponseField: false,
            responseField: null
          }
        },
        strategyType: 'MATRIX',
        subType: 'MULTI_SERVICE_DEPLOYMENT'
      },
      maxConcurrency: {
        value: 0
      }
    },
    edgeLayoutList: {
      currentNodeChildren: ['JjF-jHHyRICC_aoZqFbOhw', 'soZMmOPWRCaxl6HMv6Ns-w'],
      nextIds: []
    },
    isRollbackStageNode: false,
    children: [
      {
        id: 'JjF-jHHyRICC_aoZqFbOhw',
        stageNodeId: 'AaoV5KL4TXq_PQiwzOLiMg',
        identifier: 'Stage_0',
        type: 'Deployment',
        name: 'Stage_0',
        icon: 'circle-cross' as IconName,
        data: {
          nodeType: 'Deployment',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'Stage_0',
          name: 'Stage_0',
          nodeUuid: 'AaoV5KL4TXq_PQiwzOLiMg',
          status: 'Success',
          module: 'cd',
          moduleInfo: {
            cd: {
              __recast: 'io.harness.cdng.pipeline.executions.beans.CDStageModuleInfo',
              rollbackDuration: 0,
              serviceInfo: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
                identifier: 'vaibhav_service',
                displayName: 'vaibhav servcie',
                deploymentType: 'Kubernetes',
                gitOpsEnabled: true,
                artifacts: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
                  sidecars: []
                }
              },
              gitopsExecutionSummary: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary',
                environments: [
                  {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary$Environment',
                    name: 'dev',
                    identifier: 'dev'
                  }
                ],
                clusters: [
                  {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary$Cluster',
                    envId: 'Prod',
                    envName: 'Prod',
                    clusterId: 'cluster11',
                    clusterName: 'cluster11'
                  },
                  {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary$Cluster',
                    envId: 'Prod',
                    envName: 'Prod',
                    clusterId: 'cluster22',
                    clusterName: 'cluster22'
                  }
                ]
              },
              infraExecutionSummary: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
                identifier: 'Prod',
                name: 'Prod'
              },
              gitOpsAppSummary: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsAppSummary',
                applications: [
                  {
                    __recast: 'io.harness.gitops.models.Application',
                    name: 'my-service-app-cluster22',
                    agentIdentifier: 'sanityagent',
                    url: 'https://qa.harness.io/ng/#/account/1bvyLackQK-Hapk25-Ry4w/cd/orgs/default/projects/SanityPr/gitops/applications/my-service-app-cluster22?agentId=sanityagent'
                  },
                  {
                    __recast: 'io.harness.gitops.models.Application',
                    name: 'my-service-app-cluster11',
                    agentIdentifier: 'sanityagent',
                    url: 'https://qa.harness.io/ng/#/account/1bvyLackQK-Hapk25-Ry4w/cd/orgs/default/projects/SanityPr/gitops/applications/my-service-app-cluster11?agentId=sanityagent'
                  }
                ]
              }
            }
          },
          startTs: 1672394836296,
          endTs: 1672394842514,
          edgeLayoutList: {
            currentNodeChildren: [],
            nextIds: []
          },
          nodeRunInfo: {
            whenCondition: '<+OnPipelineSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnPipelineSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          failureInfo: {
            message: ''
          },
          failureInfoDTO: {
            message: '',
            failureTypeList: [],
            responseMessages: []
          },
          nodeExecutionId: 'JjF-jHHyRICC_aoZqFbOhw',
          strategyMetadata: {
            currentiteration: 0,
            totaliterations: 2,
            matrixmetadata: {
              matrixvalues: {
                serviceRef: 'vaibhav_service',
                serviceInputs:
                  '{"__uuid":"QGPiWfGHRqeXcErry2qVyQ","serviceDefinition":{"__uuid":"ogeVR9PpScuIbo9fgpUYSw","type":"Kubernetes","spec":{"variables":[{"name":"var1","type":"String","value":"val3","__uuid":"evVyIQThR52hKvgGMQWycg"}],"__uuid":"_fAgn46VTfa_7_vihk01jQ"}}}'
              },
              matrixcombination: [],
              subtype: 'MULTI_SERVICE_DEPLOYMENT'
            }
          },
          executionInputConfigured: false,
          isRollbackStageNode: false,
          graphType: 'STAGE_GRAPH',
          matrixNodeName: {
            serviceRef: 'vaibhav_service',
            serviceInputs:
              '{"__uuid":"QGPiWfGHRqeXcErry2qVyQ","serviceDefinition":{"__uuid":"ogeVR9PpScuIbo9fgpUYSw","type":"Kubernetes","spec":{"variables":[{"name":"var1","type":"String","value":"val3","__uuid":"evVyIQThR52hKvgGMQWycg"}],"__uuid":"_fAgn46VTfa_7_vihk01jQ"}}}'
          }
        },
        children: []
      },
      {
        id: 'soZMmOPWRCaxl6HMv6Ns-w',
        stageNodeId: 'AaoV5KL4TXq_PQiwzOLiMg',
        identifier: 'Stage_1',
        type: 'Deployment',
        name: 'Stage_1',
        icon: 'circle-cross' as IconName,
        data: {
          nodeType: 'Deployment',
          nodeGroup: 'STAGE',
          nodeIdentifier: 'Stage_1',
          name: 'Stage_1',
          nodeUuid: 'AaoV5KL4TXq_PQiwzOLiMg',
          status: 'Success',
          module: 'cd',
          moduleInfo: {
            cd: {
              __recast: 'io.harness.cdng.pipeline.executions.beans.CDStageModuleInfo',
              rollbackDuration: 0,
              serviceInfo: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
                identifier: 'ishant',
                displayName: 'ishant servcie',
                deploymentType: 'Kubernetes',
                gitOpsEnabled: true,
                artifacts: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
                  sidecars: []
                }
              },
              gitopsExecutionSummary: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary',
                environments: [
                  {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary$Environment',
                    name: 'Prod',
                    identifier: 'Prod'
                  }
                ],
                clusters: [
                  {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary$Cluster',
                    envId: 'Prod',
                    envName: 'Prod',
                    clusterId: 'cluster11',
                    clusterName: 'cluster11'
                  },
                  {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsExecutionSummary$Cluster',
                    envId: 'Prod',
                    envName: 'Prod',
                    clusterId: 'cluster22',
                    clusterName: 'cluster22'
                  }
                ]
              },
              infraExecutionSummary: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
                identifier: 'Prod',
                name: 'Prod'
              },
              gitOpsAppSummary: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.GitOpsAppSummary',
                applications: [
                  {
                    __recast: 'io.harness.gitops.models.Application',
                    name: 'my-service-app-cluster22',
                    agentIdentifier: 'sanityagent',
                    url: 'https://qa.harness.io/ng/#/account/1bvyLackQK-Hapk25-Ry4w/cd/orgs/default/projects/SanityPr/gitops/applications/my-service-app-cluster22?agentId=sanityagent'
                  },
                  {
                    __recast: 'io.harness.gitops.models.Application',
                    name: 'my-service-app-cluster11',
                    agentIdentifier: 'sanityagent',
                    url: 'https://qa.harness.io/ng/#/account/1bvyLackQK-Hapk25-Ry4w/cd/orgs/default/projects/SanityPr/gitops/applications/my-service-app-cluster11?agentId=sanityagent'
                  }
                ]
              }
            }
          },
          startTs: 1672394836282,
          endTs: 1672394842497,
          edgeLayoutList: {
            currentNodeChildren: [],
            nextIds: []
          },
          nodeRunInfo: {
            whenCondition: '<+OnPipelineSuccess>',
            evaluatedCondition: true,
            expressions: [
              {
                expression: 'OnPipelineSuccess',
                expressionValue: 'true',
                count: 1
              }
            ]
          },
          failureInfo: {
            message: ''
          },
          failureInfoDTO: {
            message: '',
            failureTypeList: [],
            responseMessages: []
          },
          nodeExecutionId: 'soZMmOPWRCaxl6HMv6Ns-w',
          strategyMetadata: {
            currentiteration: 1,
            totaliterations: 2,
            matrixmetadata: {
              matrixvalues: {
                serviceRef: 'ishant',
                serviceInputs:
                  '{"__uuid":"eVYbXIaCSL29te3JJS0Q5g","serviceDefinition":{"__uuid":"YNDckhUUQNevvrizTV0FJw","type":"Kubernetes","spec":{"variables":[{"name":"var1","type":"String","value":"val3","__uuid":"KdoKof6jQyO4zM1Z20vOnw"}],"__uuid":"JikCFxqSRx-xBfeKsvtW4g"}}}'
              },
              matrixcombination: [],
              subtype: 'MULTI_SERVICE_DEPLOYMENT'
            }
          },
          executionInputConfigured: false,
          isRollbackStageNode: false,
          graphType: 'STAGE_GRAPH',
          matrixNodeName: {
            serviceRef: 'ishant',
            serviceInputs:
              '{"__uuid":"eVYbXIaCSL29te3JJS0Q5g","serviceDefinition":{"__uuid":"YNDckhUUQNevvrizTV0FJw","type":"Kubernetes","spec":{"variables":[{"name":"var1","type":"String","value":"val3","__uuid":"KdoKof6jQyO4zM1Z20vOnw"}],"__uuid":"JikCFxqSRx-xBfeKsvtW4g"}}}'
          }
        },
        children: []
      }
    ],
    graphType: 'STAGE_GRAPH',
    id: 'CKzYPtriSYCntiwJj8PrOw',
    maxParallelism: 0
  }
}

export const ENVIRONMENT_GROUP_STAGE = {
  id: 'CKzYPtriSYCntiwJj8PrOw',
  identifier: 'Stage',
  type: 'MATRIX',
  name: 'Stage',
  icon: 'circle-cross' as IconName,
  data: {
    nodeType: 'MATRIX',
    nodeGroup: 'STRATEGY',
    nodeIdentifier: 'Stage',
    name: 'Stage',
    nodeUuid: 'CKzYPtriSYCntiwJj8PrOw',
    status: 'Success',
    moduleInfo: {
      stepParameters: {
        __recast: 'io.harness.cdng.pipeline.beans.MultiDeploymentStepParameters',
        services: {
          __recast: 'io.harness.cdng.service.beans.Services',
          uuid: 'AaoV5KL4TXq_PQiwzOLiMg',
          values: {
            __recast: 'parameterField',
            __encodedValue: {
              __recast: 'io.harness.pms.yaml.ParameterDocumentField',
              expressionValue: null,
              expression: false,
              valueDoc: {
                __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                value: [
                  {
                    __recast: 'io.harness.cdng.service.beans.ServiceYamlV2',
                    uuid: 'Z1tmosJYQlSas_uQvlkbiw',
                    serviceRef: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: 'vaibhav_service'
                        },
                        valueClass: 'java.lang.String',
                        typeString: true,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    },
                    serviceInputs: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: {
                            serviceDefinition: {
                              type: 'Kubernetes',
                              spec: {
                                variables: [
                                  {
                                    name: 'var1',
                                    type: 'String',
                                    value: 'val3',
                                    __uuid: 'evVyIQThR52hKvgGMQWycg'
                                  }
                                ],
                                __uuid: '_fAgn46VTfa_7_vihk01jQ'
                              },
                              __uuid: 'ogeVR9PpScuIbo9fgpUYSw'
                            },
                            __uuid: 'QGPiWfGHRqeXcErry2qVyQ'
                          }
                        },
                        valueClass: 'java.util.Map',
                        typeString: false,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    }
                  },
                  {
                    __recast: 'io.harness.cdng.service.beans.ServiceYamlV2',
                    uuid: 'NZlVGKCIRYqcZAaX4D_J5g',
                    serviceRef: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: 'ishant'
                        },
                        valueClass: 'java.lang.String',
                        typeString: true,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    },
                    serviceInputs: {
                      __recast: 'parameterField',
                      __encodedValue: {
                        __recast: 'io.harness.pms.yaml.ParameterDocumentField',
                        expressionValue: null,
                        expression: false,
                        valueDoc: {
                          __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper',
                          value: {
                            serviceDefinition: {
                              type: 'Kubernetes',
                              spec: {
                                variables: [
                                  {
                                    name: 'var1',
                                    type: 'String',
                                    value: 'val3',
                                    __uuid: 'KdoKof6jQyO4zM1Z20vOnw'
                                  }
                                ],
                                __uuid: 'JikCFxqSRx-xBfeKsvtW4g'
                              },
                              __uuid: 'YNDckhUUQNevvrizTV0FJw'
                            },
                            __uuid: 'eVYbXIaCSL29te3JJS0Q5g'
                          }
                        },
                        valueClass: 'java.util.Map',
                        typeString: false,
                        skipAutoEvaluation: false,
                        jsonResponseField: false,
                        responseField: null
                      }
                    }
                  }
                ]
              },
              valueClass: 'java.util.List',
              typeString: false,
              skipAutoEvaluation: false,
              jsonResponseField: false,
              responseField: null
            }
          },
          servicesMetadata: {
            __recast: 'io.harness.cdng.service.beans.ServicesMetadata',
            uuid: 'U92_wltcSRCiA5qsmEeoTA',
            parallel: true
          }
        },
        childNodeId: 'AaoV5KL4TXq_PQiwzOLiMg',
        maxConcurrency: {
          __recast: 'parameterField',
          __encodedValue: {
            __recast: 'io.harness.pms.yaml.ParameterDocumentField',
            expressionValue: null,
            expression: false,
            valueDoc: {
              __recast: 'io.harness.pms.yaml.ParameterFieldValueWrapper'
            },
            valueClass: 'java.lang.Integer',
            typeString: false,
            skipAutoEvaluation: false,
            jsonResponseField: false,
            responseField: null
          }
        },
        strategyType: 'MATRIX',
        subType: 'MULTI_SERVICE_DEPLOYMENT',
        environmentGroup: {
          environments: {
            __encodedValue: {
              valueDoc: {
                value: [
                  {
                    environmentRef: {
                      __encodedValue: {
                        valueDoc: {
                          value: 'Tooltip_test_envGroup_1'
                        }
                      }
                    }
                  },
                  {
                    environmentRef: {
                      __encodedValue: {
                        valueDoc: {
                          value: 'Tooltip_test_envGroup_2'
                        }
                      }
                    }
                  }
                ]
              }
            }
          },
          envGroupRef: {
            __encodedValue: {
              valueDoc: {
                value: 'TEST_ENV_GrouPP'
              }
            }
          }
        }
      },
      maxConcurrency: {
        value: 0
      }
    },
    edgeLayoutList: {
      currentNodeChildren: ['JjF-jHHyRICC_aoZqFbOhw', 'soZMmOPWRCaxl6HMv6Ns-w'],
      nextIds: []
    },
    isRollbackStageNode: false,
    graphType: 'STAGE_GRAPH',
    id: 'CKzYPtriSYCntiwJj8PrOw',
    maxParallelism: 0
  }
}
