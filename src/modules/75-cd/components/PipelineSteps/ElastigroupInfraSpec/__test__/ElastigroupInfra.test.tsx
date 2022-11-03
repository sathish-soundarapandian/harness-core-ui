/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { ElastigroupInfrastructure } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { StringsMap } from 'framework/strings/StringsContext'

import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { findDialogContainer, queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ElastigroupInfrastructureSpec } from '../ElastigroupInfraSpec'
import { getYaml, invalidYaml, spotConnector } from './ElastigroupTestHelper'

const fetchConnector = jest.fn().mockReturnValue({ data: spotConnector.data?.content?.[1] })
export const findStepWizardContainer = (): HTMLElement | null => document.querySelector('.StepWizard--main')

const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined) => {
  return vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
}

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: () => Promise.resolve(spotConnector),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(spotConnector)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: spotConnector.data?.content?.[0] }, refetch: fetchConnector, loading: false }
  })
}))

const initialValuesWithSecretFiles = {
  connectorRef: 'spotConnector',
  configuration: {
    store: {
      spec: {
        secretFiles: ['accountTest']
      },
      type: 'Harness'
    }
  },
  allowSimultaneousDeployments: true
}

const initialValuesWithFiles = {
  connectorRef: 'spotConnector1',
  configuration: {
    store: {
      spec: {
        files: ['accountTest']
      },
      type: 'Harness'
    }
  },
  allowSimultaneousDeployments: false
}

const initValueForVariable = {
  infrastructureDefinition: {
    spec: {
      connectorRef: 'spotConnector',
      configuration: {
        store: {
          spec: {
            secretFiles: ['accountTest']
          },
          type: 'Harness'
        }
      },
      allowSimultaneousDeployments: true
    }
  }
}

const emptyInitialValues = {
  connectorRef: '',
  configuration: {
    store: {
      spec: {},
      type: 'Harness'
    }
  }
}

const templateValuesWithSecretFiles = {
  configuration: {
    store: {
      spec: {
        secretFiles: RUNTIME_INPUT_VALUE
      },
      type: 'Harness'
    }
  }
}

const templateValuesWithFiles = {
  connectorRef: RUNTIME_INPUT_VALUE,
  configuration: {
    store: {
      spec: {
        files: RUNTIME_INPUT_VALUE
      },
      type: 'Harness'
    }
  }
}

const customProp = (initValue: any) => {
  return {
    stageIdentifier: 'qaStage',
    variablesData: initValue,
    metadataMap: {
      spotConnector: {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.spec.Elastigrp.connectorRef',
          localName: 'spec.Elastigrp.connectorRef'
        }
      },
      accountTest: {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.spec.Elastigrp.configuration.store.spec.secretFiles.0',
          localName: 'spec.Elastigrp.configuration.store.spec.secretFiles.0'
        }
      }
    }
  }
}

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

const onUpdate = jest.fn()
const onChange = jest.fn()
factory.registerStep(new ElastigroupInfrastructureSpec())

describe('ElastigroupInfraSpec tests', () => {
  test('render elastigroupInfra with empty initial values', async () => {
    const ref = React.createRef<StepFormikRef<ElastigroupInfrastructure>>()

    const { container } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={emptyInitialValues}
        allValues={emptyInitialValues}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.Elastigroup}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    expect(container).toMatchSnapshot()
  })

  test('render elastigroupInfra with harness file type', async () => {
    const ref = React.createRef<StepFormikRef<ElastigroupInfrastructure>>()

    const { getByTestId, container, getByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialValuesWithFiles}
        allValues={initialValuesWithFiles}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.Elastigroup}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Change connectorRef
    const connnectorRefInput = getByTestId(/connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)

    const dialogs = document.getElementsByClassName('bp3-dialog')
    await waitFor(() => expect(dialogs).toHaveLength(1))
    const connectorSelectorDialog = dialogs[0] as HTMLElement
    const spotConnector1 = await findByText(connectorSelectorDialog, 'common.ID: spotConnector')
    await waitFor(() => expect(spotConnector1).toBeInTheDocument())
    userEvent.click(spotConnector1)

    const applySelected = getByText('entityReference.apply')
    userEvent.click(applySelected)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))

    // check Allow simultaneous deployments on the same infrastructure checkbox
    const allowSimultaneousDeploymentsCheckbox = queryByNameAttribute('allowSimultaneousDeployments', container)
    userEvent.click(allowSimultaneousDeploymentsCheckbox!)
    expect(allowSimultaneousDeploymentsCheckbox).toBeChecked()

    //submit form and verify
    ref.current?.submitForm()
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        allowSimultaneousDeployments: true,
        configuration: { store: { spec: { files: ['accountTest'] }, type: 'Harness' } },
        connectorRef: 'spotConnector'
      })
    )
  })

  test('render elastigroupInfra with secretFile type', async () => {
    const ref = React.createRef<StepFormikRef<ElastigroupInfrastructure>>()

    const { container, getByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialValuesWithSecretFiles}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.Elastigroup}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    const editButton = container.querySelector('[data-icon="Edit"]')
    expect(editButton).toBeDefined()
    fireEvent.click(editButton as HTMLElement)
    const stepWizard = findDialogContainer()
    expect(stepWizard).toBeTruthy()

    //assertions
    expect(getByText('pipeline.configFiles.selectFileType')).toBeTruthy()
    const secretOption = stepWizard!.querySelectorAll('input[type="radio"]')
    expect((secretOption[0] as HTMLInputElement).value).toBe('fileStore')
    expect((secretOption[1] as HTMLInputElement).value).toBe('encrypted')
    expect(secretOption[1] as HTMLInputElement).toBeChecked()

    //go Back to stepOne
    const backBtn = await findByText(stepWizard!, 'back')
    expect(backBtn).toBeTruthy()
    fireEvent.click(backBtn)

    //stepOne assertion
    const thumbnail = stepWizard!.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(thumbnail.value).toBe('harness')
    expect(thumbnail).toBeChecked()

    //go forward to stepTwo
    const continueBtn = await findByText(stepWizard!, 'continue')
    expect(continueBtn).toBeTruthy()
    fireEvent.click(continueBtn)

    //submit
    const submitWizard = await findByText(stepWizard!, 'submit')
    expect(submitWizard).toBeTruthy()
    fireEvent.click(submitWizard)

    //wizard closed
    await waitFor(() => {
      const ftn = findDialogContainer()
      expect(ftn).toBeNull()
    })
  })

  test('delete existing config', async () => {
    const ref = React.createRef<StepFormikRef<ElastigroupInfrastructure>>()
    const initValueChanged = initialValuesWithFiles
    initValueChanged.connectorRef = '<+input>'

    const { container, getByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initValueChanged}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.Elastigroup}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    const editButton = container.querySelector('[data-icon="Edit"]')
    expect(editButton).toBeDefined()
    fireEvent.click(editButton as HTMLElement)
    const stepWizard = findDialogContainer()
    expect(stepWizard).toBeTruthy()

    //submit
    const submitWizard = await findByText(stepWizard!, 'submit')
    expect(submitWizard).toBeTruthy()
    fireEvent.click(submitWizard)

    //wizard closed
    await waitFor(() => {
      const ftn = findDialogContainer()
      expect(ftn).toBeNull()
    })

    //delete config
    const deleteBtn = container.querySelector('[data-icon="main-trash"]')
    expect(deleteBtn).toBeTruthy()
    fireEvent.click(deleteBtn as HTMLButtonElement)

    //deleted
    expect(getByText('common.addName')).toBeTruthy()
    fireEvent.click(getByText('common.addName'))

    const crossIcon = stepWizard!.querySelector('span[icon="cross"]')
    expect(crossIcon).toBeTruthy()
    fireEvent.click(crossIcon as HTMLButtonElement)
  })
})

describe('Elastigroup - variable view, validation and formErrors', () => {
  test('Variables view renders correctly', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={initValueForVariable}
        type={StepType.Elastigroup}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={customProp(initValueForVariable)}
      />
    )
    expect(getByText('connectorRef')).toBeVisible()
    expect(getByText('spotConnector')).toBeVisible()
  })

  test('Variables view should render incorrectly', async () => {
    const { queryByText } = render(
      <TestStepWidget
        initialValues={initValueForVariable.infrastructureDefinition.spec}
        type={StepType.Elastigroup}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={customProp(initValueForVariable.infrastructureDefinition.spec)}
      />
    )

    expect(queryByText('connectorRef')).toBeNull()
    expect(queryByText('spotConnector')).toBeNull()
    expect(queryByText('accountTest')).toBeNull()
  })

  test('check inputset form errors - harness file type ', async () => {
    const step = new ElastigroupInfrastructureSpec() as any
    const errors = await step.validateInputSet({
      data: emptyInitialValues,
      template: {
        connectorRef: RUNTIME_INPUT_VALUE,
        configuration: {
          store: {
            spec: {
              files: RUNTIME_INPUT_VALUE
            },
            type: 'Harness'
          }
        }
      },
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.connectorRef).toBe('common.validation.fieldIsRequired')
    expect(errors.configuration.store.spec.files).toBe('cd.steps.elastigroup.elastigroupConfigReq')
    expect(errors).toBeTruthy()
  })

  test('check inputset form errors - secret type ', async () => {
    const step = new ElastigroupInfrastructureSpec() as any
    const errors = await step.validateInputSet({
      data: emptyInitialValues,
      template: { ...templateValuesWithSecretFiles, connectorRef: RUNTIME_INPUT_VALUE },
      getString,
      viewType: StepViewType.TriggerForm
    })
    expect(errors.connectorRef).toBe('common.validation.fieldIsRequired')
    expect(errors.configuration.store.spec.secretFiles).toBe('cd.steps.elastigroup.elastigroupConfigReq')
    expect(errors).toBeTruthy()
  })
})
describe('Elastigroup - inputSet/runtime view', () => {
  test('Runtime view to render - with initialSnapShot', () => {
    const { container } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialValuesWithFiles}
        allValues={templateValuesWithFiles}
        template={templateValuesWithFiles}
        onUpdate={onUpdate}
        type={StepType.Elastigroup}
        path={'stages[0].stage.spec.environment.infrastructureDefinitions.0.inputs.spec'}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Runtime view to render - with secretFile', () => {
    const { getByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={emptyInitialValues}
        allValues={templateValuesWithSecretFiles}
        readonly={false}
        template={templateValuesWithSecretFiles}
        onUpdate={onUpdate}
        type={StepType.Elastigroup}
        stepViewType={StepViewType.DeploymentForm}
      />
    )
    expect(getByText('secrets.secret.configureSecret')).toBeTruthy()
    expect(getByText('cd.steps.elastigroup.elastigroupConfig')).toBeTruthy()
  })
})

const connectorRefPath = 'pipeline.stages.0.stage.spec.environment.infrastructureDefinitions.0.inputs.spec.connectorRef'

const params = (): PipelinePathProps & ModulePathParams => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('getConnectorsListForYaml test', () => {
  test('when connectorRefPath and yaml both are valid', async () => {
    const step = new ElastigroupInfrastructureSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), params)
    expect(list).toHaveLength(1)
    expect(list[0].insertText).toBe('spotConnector')
  })

  test('when connectorRefPath is invalid and yaml is valid valid', async () => {
    const step = new ElastigroupInfrastructureSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('when connectorRefPath is valid and yaml is invalid valid', async () => {
    const step = new ElastigroupInfrastructureSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml('invalid path', invalidYaml(), params)
    expect(list).toHaveLength(0)
  })
})
