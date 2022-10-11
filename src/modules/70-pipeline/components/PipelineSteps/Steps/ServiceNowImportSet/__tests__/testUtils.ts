/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ResponseConnectorResponse,
  ResponseListServiceNowStagingTable,
  ResponsePageConnectorResponse
} from 'services/cd-ng'
import type { ServiceNowImportSetDeploymentModeProps, ServiceNowImportSetStepModeProps } from '../types'

export const getServiceNowImportSetEditModeProps = (): ServiceNowImportSetStepModeProps => ({
  initialValues: {
    name: '',
    identifier: '',
    type: 'ServiceNowImportSet',
    timeout: '5s',
    spec: {
      connectorRef: '',
      stagingTableName: '',
      importData: {
        type: 'Json',
        spec: {
          jsonBody: ''
        }
      }
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

export const getServiceNowImportSetEditModePropsWithValues = (): ServiceNowImportSetStepModeProps => ({
  initialValues: {
    name: 'sNowImportSet',
    identifier: 'sNowImportSet',
    type: 'ServiceNowImportSet',
    timeout: '1d',
    spec: {
      connectorRef: 'cid1',
      stagingTableName: 'test1',
      importData: {
        type: 'Json',
        spec: {
          jsonBody: '{"val1": "123", "val2": 456}'
        }
      }
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

export const getServiceNowImportSetEditModePropsWithRuntimeValues = (): ServiceNowImportSetStepModeProps => ({
  initialValues: {
    name: '',
    identifier: '',
    type: 'ServiceNowImportSet',
    timeout: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      stagingTableName: RUNTIME_INPUT_VALUE,
      importData: {
        type: 'Json',
        spec: {
          jsonBody: RUNTIME_INPUT_VALUE
        }
      }
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

export const getServiceNowImportSetDeploymentModeProps = (): ServiceNowImportSetDeploymentModeProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    name: '',
    identifier: '',
    type: 'ServiceNowImportSet',
    spec: {
      connectorRef: '',
      stagingTableName: '',
      importData: {
        type: 'Json',
        spec: {
          jsonBody: ''
        }
      }
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      name: '',
      identifier: '',
      type: 'ServiceNowImportSet',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        stagingTableName: RUNTIME_INPUT_VALUE,
        importData: {
          type: 'Json',
          spec: {
            jsonBody: RUNTIME_INPUT_VALUE
          }
        }
      }
    }
  },
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
})

export const getServiceNowImportSetDeploymentModeWithCustomFieldsProps =
  (): ServiceNowImportSetDeploymentModeProps => ({
    stepViewType: StepViewType.InputSet,
    initialValues: {
      name: '',
      identifier: '',
      type: 'ServiceNowImportSet',
      spec: {
        connectorRef: 'cid1',
        stagingTableName: 'test1',
        importData: {
          type: 'Json',
          spec: {
            jsonBody: '{"val1": "123", "val2": 456}'
          }
        }
      }
    },
    inputSetData: {
      path: '/ab/',
      template: {
        name: '',
        identifier: '',
        type: 'ServiceNowImportSet',
        spec: {
          connectorRef: 'cid1',
          stagingTableName: 'test1',
          importData: {
            type: 'Json',
            spec: {
              jsonBody: '{"val1": "123", "val2": 456}'
            }
          }
        }
      }
    },
    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
  })

export const getServiceNowImportSetInputVariableModeProps = () => ({
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
      'step-stagingTable': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.stagingTable',
          localName: 'step.approval.spec.stagingTable'
        }
      }
    },
    variablesData: {
      type: StepType.ServiceNowImportSet,
      __uuid: 'step-identifier',
      identifier: 'serviceNow_importSet',
      name: 'step-name',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        stagingTableName: 'step-stagingTable'
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
      connector: { name: 'c1', identifier: 'cid1', type: 'ServiceNow', spec: {} }
    }
  }
}

export const mockConnectorsResponse: ResponsePageConnectorResponse = {
  correlationId: 'corrId',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    content: [
      { connector: { name: 'c1', identifier: 'cid1', type: 'ServiceNow', spec: {} } },
      { connector: { name: 'c2', identifier: 'cid2', type: 'ServiceNow', spec: {} } }
    ]
  }
}

export const mockStagingTableErrorResponse: ResponseListServiceNowStagingTable = {
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

export const mockStagingTableReponse: UseGetMockData<ResponseListServiceNowStagingTable> = {
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
        label: 'test1',
        name: 'u_test1'
      },
      {
        label: 'test2',
        name: 'u_test2'
      }
    ]
  }
}

export const mockStagingTableLoadingReponse: UseGetMockData<ResponseListServiceNowStagingTable> = {
  loading: true,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: [
      {
        label: 'test1',
        name: 'u_test1'
      },
      {
        label: 'test2',
        name: 'u_test2'
      }
    ]
  }
}
