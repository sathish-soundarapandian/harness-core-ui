/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import pipelineContextMock from '@pipeline/components/ManifestSelection/__tests__/pipeline_mock.json'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import type { ServiceDefinition } from 'services/cd-ng'
import type { ConnectorTypes, StartupScriptSelectionProps } from '../StartupScriptInterface.types'
import StartupScriptWizardStepTwo from '../StartupScriptWizardStepTwo'

export const props: StartupScriptSelectionProps = {
  isPropagating: true,
  deploymentType: 'AzureWebApp' as any, //todo after swagger integration
  isReadonlyServiceMode: false,
  readonly: false
}
export const startupCommand = {
  store: {
    type: 'Github',
    spec: {
      connectorRef: 'Github2',
      gitFetchType: 'Branch',
      paths: ['filePath'],
      branch: 'branch'
    }
  }
}

export const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
export const mockErrorHandler = jest.fn()
export const onSubmit = jest.fn()
export const onBack = jest.fn()
export const onUpdate = jest.fn()

export const prevStepData = {
  store: {
    type: 'Bitbucket',
    spec: {
      connectorRef: 'account.BBsaasAmit',
      gitFetchType: 'Commit',
      paths: 'filePath',
      commitId: 'commitId'
    }
  },
  selectedStore: 'Bitbucket',
  connectorRef: {
    label: 'BBsaasAmit',
    value: 'account.BBsaasAmit',
    scope: 'account',
    live: true,
    connector: {
      name: 'BBsaasAmit',
      identifier: 'BBsaasAmit',
      description: '',
      orgIdentifier: null,
      projectIdentifier: null,
      tags: {},
      type: 'Bitbucket',
      spec: {
        url: 'https://bitbucket.org/harness-automation/gitx-automation/',
        validationRepo: null,
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernamePassword',
            spec: {
              username: 'harness-automation',
              usernameRef: null,
              passwordRef: 'account.bbsaasAmit'
            }
          }
        },
        apiAccess: {
          type: 'UsernameToken',
          spec: {
            username: 'harness-automation',
            usernameRef: null,
            tokenRef: 'account.bbsaasAmit'
          }
        },
        delegateSelectors: [],
        type: 'Repo'
      }
    }
  }
}

export const propListView = {
  isPropagating: false,
  pipeline: pipelineContextMock.state.pipeline,
  updateStage: onUpdate,
  stage: pipelineContextMock.state.pipeline.stages[0],
  connectors: connectorsData.data,
  refetchConnectors: jest.fn(),
  isReadonly: false,
  startupCommand,
  deploymentType: props.deploymentType,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
} as any

export const propStepTwo = {
  key: 'pipeline.startup.command.fileDetails',
  name: 'pipeline.startup.command.fileDetails',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepName: 'pipeline.startup.command.fileDetails',
  initialValues: {
    ...startupCommand,
    selectedStore: startupCommand?.store?.type,
    connectorRef: startupCommand?.store?.spec?.connectorRef
  } as any,
  handleSubmit: jest.fn()
}

const detailStep = <StartupScriptWizardStepTwo {...propStepTwo} />

export const propStepOne = {
  handleConnectorViewChange: jest.fn(),
  handleStoreChange: jest.fn(),
  stepName: 'pipeline.startup.command.fileSource',
  isReadonly: false,
  connectorTypes: ['Git', 'Github', 'GitLab', 'Bitbucket'] as Array<ConnectorTypes>,
  initialValues: {
    ...startupCommand,
    selectedStore: startupCommand?.store?.type,
    connectorRef: '<+input>'
  } as any,
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  prevStepData: { ...prevStepData },
  nextStep: jest.fn(),
  stepSubtitle: 'Spot Elastigroup'
}

export const propWizard = {
  connectorTypes: ['Git', 'Github', 'GitLab', 'Bitbucket'] as Array<ConnectorTypes>,
  newConnectorView: true,
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleConnectorViewChange: jest.fn(),
  handleStoreChange: jest.fn(),
  initialValues: {
    ...startupCommand,
    selectedStore: startupCommand?.store?.type,
    connectorRef: startupCommand?.store?.spec?.connectorRef
  },
  newConnectorSteps: jest.fn(),
  lastSteps: detailStep,
  isReadonly: false,
  deploymentType: 'AzureWebApp' as ServiceDefinition['type']
}

export const prevStepDataRuntime = {
  store: {
    type: 'Bitbucket',
    spec: {
      connectorRef: '<+input>',
      gitFetchType: 'Commit',
      paths: ['<+input>'],
      repoName: '<+input>',
      commitId: '<+input>'
    }
  },
  selectedStore: 'Bitbucket',
  connectorRef: '<+input>'
}
