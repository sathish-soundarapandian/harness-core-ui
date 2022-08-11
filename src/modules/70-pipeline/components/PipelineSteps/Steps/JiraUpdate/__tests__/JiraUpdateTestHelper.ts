/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  JiraFieldSchemaNG,
  ResponseConnectorResponse,
  ResponseJiraIssueCreateMetadataNG,
  ResponseListJiraProjectBasicNG,
  ResponseListJiraStatusNG,
  ResponsePageConnectorResponse
} from 'services/cd-ng'
import type { JiraUpdateDeploymentModeProps, JiraUpdateStepModeProps } from '../types'

export const getJiraUpdateEditModeProps = (): JiraUpdateStepModeProps => ({
  initialValues: {
    name: '',
    type: 'JiraUpdate',
    identifier: '',
    timeout: '5s',
    spec: {
      connectorRef: '',
      issueKey: '',
      transitionTo: {
        status: '',
        transitionName: ''
      },
      fields: []
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepViewType: StepViewType.Edit
})

export const getJiraUpdateEditModePropsWithConnectorId = (): JiraUpdateStepModeProps => ({
  initialValues: {
    name: '',
    type: 'JiraUpdate',
    identifier: '',
    timeout: '5s',
    spec: {
      connectorRef: 'cid',
      issueKey: '',
      transitionTo: {
        status: '',
        transitionName: ''
      },
      fields: []
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepViewType: StepViewType.Edit
})

export const getJiraUpdateEditModePropsWithValues = (): JiraUpdateStepModeProps => ({
  initialValues: {
    timeout: '1d',
    name: '',
    type: 'JiraUpdate',
    identifier: '',
    spec: {
      connectorRef: 'c1d1',
      issueKey: '<+issueKey>',
      transitionTo: {
        status: 'Done',
        transitionName: ''
      },
      fields: [
        { name: 'f21', value: 'value1' },
        { name: 'f2', value: 2233 },
        { name: 'date', value: '23-march' }
      ]
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepViewType: StepViewType.Edit
})

export const getJiraUpdateDeploymentModeProps = (): JiraUpdateDeploymentModeProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    name: '',
    type: 'JiraUpdate',
    identifier: '',
    spec: {
      connectorRef: '',
      issueKey: '',
      transitionTo: {
        status: '',
        transitionName: ''
      },
      fields: []
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      name: '',
      type: 'JiraUpdate',
      identifier: '',
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        issueKey: RUNTIME_INPUT_VALUE,
        transitionTo: {
          status: RUNTIME_INPUT_VALUE,
          transitionName: RUNTIME_INPUT_VALUE
        },
        fields: []
      }
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
})

export const getJiraUpdateInputVariableModeProps = () => ({
  initialValues: {
    spec: {}
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.name',
          localName: 'step.approval.name'
        }
      },
      'step-identifier': {
        yamlExtraProperties: {
          properties: [
            {
              fqn: 'pipeline.stages.qaStage.execution.steps.approval.identifier',
              localName: 'step.approval.identifier',
              variableName: 'identifier'
            }
          ]
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.timeout',
          localName: 'step.approval.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.connectorRef',
          localName: 'step.approval.spec.connectorRef'
        }
      },
      'step-issueKey': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.issueKey',
          localName: 'step.approval.spec.issueKey'
        }
      }
    },
    variablesData: {
      type: StepType.JiraUpdate,
      __uuid: 'step-identifier',
      identifier: 'jira_update',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        issueKey: 'step-issueKey'
      }
    }
  },
  onUpdate: jest.fn()
})

export const mockConnectorResponse: UseGetMockData<ResponseConnectorResponse> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      connector: { name: 'c1', identifier: 'cid1', type: 'Jira', spec: {} }
    }
  }
}

export const mockConnectorsResponse: ResponsePageConnectorResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    content: [
      { connector: { name: 'c1', identifier: 'cid1', type: 'Jira', spec: {} } },
      { connector: { name: 'c2', identifier: 'cid2', type: 'Jira', spec: {} } }
    ]
  }
}

export const mockStatusResponse: ResponseListJiraStatusNG = {
  correlationId: 'someid',
  status: 'SUCCESS',
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  metaData: null as unknown as undefined,
  data: [
    { name: 'Done', id: 'Done' },
    { name: 'ToDo', id: 'ToDo' }
  ]
}

export const mockStatusErrorResponse: ResponseListJiraStatusNG = {
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  error: {
    message: 'Failed to fetch: 400 Bad Request',
    data: {
      code: 'INVALID_REQUEST',
      correlationId: '',
      status: 'ERROR',
      metaData: null,
      message: 'mockMessage',
      responseMessages: [
        {
          code: 'INVALID_REQUEST',
          level: 'ERROR',
          message: 'mockMessage',
          exception: null,
          failureTypes: []
        }
      ]
    },
    status: '400'
  }
}

export const mockProjectsResponse: UseGetMockData<ResponseListJiraProjectBasicNG> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: [
      {
        id: 'pid1',
        key: 'pid1',
        name: 'p1'
      },
      {
        id: 'pid2',
        key: 'pid2',
        name: 'p2'
      },
      {
        id: 'pid3',
        key: 'pid3',
        name: 'p3'
      }
    ]
  }
}

export const mockProjectMetadataResponse: UseGetMockData<ResponseJiraIssueCreateMetadataNG> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      projects: {
        pid1: {
          id: 'pid1',
          key: 'pid1',
          name: 'p1',
          // eslint-disable-next-line
          // @ts-ignore
          issuetypes: [
            {
              id: 'itd1',
              name: 'it1',
              statuses: [
                {
                  name: 'todo',
                  id: 'todo'
                },
                {
                  name: 'Done',
                  id: 'Done'
                }
              ],
              fields: {
                field1: {
                  key: 'f1',
                  name: 'f1',
                  allowedValues: [],
                  schema: {
                    type: 'string' as JiraFieldSchemaNG['type'],
                    typeStr: ''
                  }
                },
                field2: {
                  key: 'f2',
                  name: 'f2',
                  allowedValues: [
                    {
                      id: 'av1',
                      name: 'av1',
                      value: 'av1'
                    },
                    {
                      id: 'av2',
                      name: 'av2'
                    }
                  ],
                  schema: {
                    type: 'string' as JiraFieldSchemaNG['type'],
                    typeStr: ''
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
