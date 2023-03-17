/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ResponseConnectorResponse, ResponsePageConnectorResponse } from 'services/cd-ng'
// import type { JenkinsStepDeploymentModeProps,  } from '../types'
import type { BambooStepProps } from '../BambooStep'
import type { BambooStepDeploymentModeProps } from '../types'

export const getBambooStepEditModeProps = (): BambooStepProps => ({
  initialValues: {
    timeout: '5s',
    name: '',
    identifier: '',
    type: StepType.BambooBuild,
    spec: {
      connectorRef: '',
      planName: '',
      planParameter: [],
      delegateSelectors: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getBambooStepRunTimeProps = (): BambooStepProps => ({
  initialValues: {
    timeout: '5s',
    name: 'ss',
    identifier: 'ss',
    type: StepType.BambooBuild,
    spec: {
      connectorRef: '<+input>',
      planName: '<+input>',
      planParameter: [],
      delegateSelectors: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getBambooStepEditModePropsWithConnectorId = (): BambooStepProps => ({
  initialValues: {
    timeout: '5s',
    name: '',
    identifier: '',
    type: StepType.BambooBuild,
    spec: {
      connectorRef: 'cid1',
      planName: '',
      planParameter: [],
      delegateSelectors: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getBambooStepEditModePropsWithValues = (): BambooStepProps => ({
  initialValues: {
    type: StepType.BambooBuild,
    name: 'ss',
    identifier: 'ss',
    spec: {
      connectorRef: 'cid1',
      planParameter: [
        {
          name: 'x',
          type: 'String',
          value: '10',
          id: 'f842f927-2ce7-41f5-8753-24f153eb3663'
        }
      ],
      delegateSelectors: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false,
      planName: '<+input>'
    },
    timeout: '10m'
  },
  onUpdate: jest.fn(),
  onChange: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getBambooStepDeploymentModeProps = (): BambooStepDeploymentModeProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    identifier: 'ss',
    type: StepType.BambooBuild,
    spec: {
      planName: '',
      connectorRef: '',
      delegateSelectors: [],
      planParameter: []
    }
  },
  inputSetData: {
    template: {
      identifier: 'ss',
      type: StepType.BambooBuild,
      spec: {
        planName: RUNTIME_INPUT_VALUE,
        connectorRef: '',
        delegateSelectors: [],
        planParameter: []
      }
    },
    allValues: {
      type: StepType.BambooBuild,
      name: 'ss',
      identifier: 'ss',
      spec: {
        connectorRef: 'cid1',
        planParameter: [
          {
            name: 'x',
            type: 'String',
            value: '10',
            id: 'f842f927-2ce7-41f5-8753-24f153eb3663'
          }
        ],
        delegateSelectors: [],
        unstableStatusAsSuccess: false,
        useConnectorUrlForJobExecution: false,
        planName: RUNTIME_INPUT_VALUE
      },
      timeout: '10m'
    },
    path: 'stages[0].stage.spec.execution.steps[0].step'
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getBambooStepInputVariableModeProps = () => ({
  customStepProps: {
    variablesData: {
      type: 'BambooBuild',
      identifier: 'ss',
      name: '2EXRf9wXQ_WL9VaEGz1ziw',
      description: '-mBOU7zZSayg6MphoFJswQ',
      timeout: 'OX8p-G6UTLW9FHeYrwzctw',
      __uuid: 'HT0VrFaASNGWFBsFZX6NYQ',
      spec: {
        __uuid: '8Vgl2WAESmW2UrFeVGmbCw',
        connectorRef: 'b4Ab7Wq-SUKEU1euZu34SA',
        planName: 'UMPJe_osQ1-3rL6PH33K7Q',
        planParameter: [
          {
            name: 'iJeDEVzyQH2E3nNA0lLuRg',
            value: '10'
          }
        ],
        unstableStatusAsSuccess: false,
        useConnectorUrlForJobExecution: false,
        delegateSelectors: []
      }
    },
    metadataMap: {}
  },
  initialValues: {
    type: 'BambooBuild',
    name: 'ss',
    identifier: 'ss',
    spec: {
      connectorRef: 'cid1',
      planParameters: [
        {
          name: 'x',
          type: 'String',
          value: '10',
          id: 'f842f927-2ce7-41f5-8753-24f153eb3663'
        }
      ],
      delegateSelectors: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false,
      planName: '<+input>'
    },
    timeout: '10m'
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
      connector: { name: 'cid1', identifier: 'cid1', type: 'Jenkins', spec: {} }
    }
  }
}

export const mockConnectorsResponse: ResponsePageConnectorResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    content: [
      { connector: { name: 'cid1', identifier: 'cid1', type: 'Jenkins', spec: {} } },
      { connector: { name: 'cid2', identifier: 'cid2', type: 'Jenkins', spec: {} } }
    ]
  }
}

export const mockPlansResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    planKeys: [
      {
        name: 'AW-AW',
        value: 'aws_lambda'
      },
      {
        name: 'TES-HIN',
        value: 'hinger-test'
      },
      {
        name: 'PFP-PT',
        value: 'ppt test'
      },
      {
        name: 'TES-NOD',
        value: 'node-artifact'
      },
      {
        name: 'TES-UJ',
        value: 'ujjwal'
      },
      {
        name: 'TES-AK',
        value: 'akhilesh-cdp'
      },
      {
        name: 'TES-GAR',
        value: 'garvit-test'
      },
      {
        name: 'TEST-TEST',
        value: 'test'
      }
    ]
  }
}
