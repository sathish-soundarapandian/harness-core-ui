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
import {
  AzureWebAppSelectionProps,
  ConnectorTypes,
  ModalViewOption,
  WizardStepNames
} from '../AzureWebAppServiceConfig.types'
import AzureWebAppServiceStepTwo from '../AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceStepTwo'

export const props: AzureWebAppSelectionProps = {
  isPropagating: true,
  deploymentType: 'AzureWebApp' as any, //todo after swagger integration
  isReadonlyServiceMode: false,
  readonly: false
}
export const getLabelProp = (): WizardStepNames => {
  return {
    wizardName: 'pipeline.appServiceConfig.applicationSettings.scriptFile',
    firstStepName: 'pipeline.appServiceConfig.applicationSettings.scriptFileSource',
    secondStepName: 'pipeline.appServiceConfig.applicationSettings.scriptFileDetails',
    firstStepTitle: 'pipeline.appServiceConfig.applicationSettings.fileSource',
    firstStepSubtitle: 'pipeline.appServiceConfig.applicationSettings.subtitle',
    secondStepTitle: 'pipeline.appServiceConfig.applicationSettings.fileDetails',
    pathPlaceholder: 'pipeline.appServiceConfig.applicationSettings.filePath'
  }
}

export const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
export const mockErrorHandler = jest.fn()
export const onSubmit = jest.fn()
export const onBack = jest.fn()
export const onUpdate = jest.fn()
const labels = getLabelProp()

export const applicationSettings = {
  type: 'Github',
  spec: {
    connectorRef: 'Github2',
    gitFetchType: 'Branch',
    paths: ['filePath'],
    branch: 'branch'
  }
}
export const connectionStrings = {
  type: 'Github',
  spec: {
    connectorRef: 'Github2',
    gitFetchType: 'Branch',
    paths: ['filePath'],
    branch: 'branch'
  }
}

export const prevStepData = {
  type: 'Bitbucket',
  spec: {
    connectorRef: 'account.BBsaasAmit',
    gitFetchType: 'Commit',
    paths: 'filePath',
    commitId: 'commitId'
  },
  store: 'Bitbucket',
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
  applicationSettings,
  connectionStrings,
  deploymentType: props.deploymentType,
  selectedOption: ModalViewOption.APPLICATIONSETTING,
  setSelectedOption: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
} as any

export const propStepTwo = {
  key: 'pipeline.applicationSettings.fileDetails',
  name: 'pipeline.applicationSettings.fileDetails',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepName: 'pipeline.applicationSettings.fileDetails',
  initialValues: {
    ...applicationSettings,
    store: applicationSettings?.type,
    connectorRef: applicationSettings?.spec?.connectorRef
  } as any,
  handleSubmit: jest.fn()
}
const manifestDetailStep = <AzureWebAppServiceStepTwo {...propStepTwo} />

export const propStepOne = {
  handleConnectorViewChange: jest.fn(),
  handleStoreChange: jest.fn(),
  stepName: labels.firstStepName,
  title: labels.firstStepName,
  isReadonly: false,
  connectorTypes: ['Git', 'Github', 'GitLab', 'Bitbucket'] as Array<ConnectorTypes>,
  initialValues: {
    ...applicationSettings,
    store: applicationSettings?.type,
    connectorRef: '<+input>'
  } as any,
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  prevStepData: { ...prevStepData },
  nextStep: jest.fn()
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
    ...applicationSettings,
    store: applicationSettings?.type,
    connectorRef: applicationSettings?.spec?.connectorRef
  },
  newConnectorSteps: jest.fn(),
  lastSteps: manifestDetailStep,
  isReadonly: false,
  labels: getLabelProp()
}

export const prevStepDataRuntime = {
  type: 'Bitbucket',
  spec: {
    connectorRef: '<+input>',
    gitFetchType: 'Commit',
    paths: ['<+input>'],
    repoName: '<+input>',
    commitId: '<+input>'
  },
  store: 'Bitbucket',
  connectorRef: '<+input>'
}
