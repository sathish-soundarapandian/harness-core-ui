/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor, findByText as findElementByText } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { doConfigureOptionsTesting, queryByNameAttribute } from '@common/utils/testUtils'
import { TerraformCloudRun } from '../TerraformCloudRun'
import { connectorResponse, organizationsResponse, spacesResponse } from './mocks'
import { RunTypes } from '../helper'

factory.registerStep(new TerraformCloudRun())

const onUpdate = jest.fn()
const onChange = jest.fn()

const emptyInitialValues = {
  name: 'TerraformCloudRun_step1',
  identifier: 'TerraformCloudRun_step1',
  timeout: '',
  spec: {
    runType: RunTypes.PlanOnly,
    runMessage: 'test message',
    spec: {
      connectorRef: '',
      organization: '',
      workspace: '',
      provisionerIdentifier: '',
      planType: 'Apply',
      terraformVersion: '',
      discardPendingRuns: false,
      exportTerraformPlanJson: false,
      targets: []
    }
  }
}

const initialValues = {
  name: 'TerraformCloudRun_step1',
  identifier: 'TerraformCloudRun_step1',
  timeout: '',
  type: StepType.TerraformCloudRun,
  spec: {
    runType: RunTypes.PlanOnly,
    runMessage: 'test message',
    spec: {
      connectorRef: 'connectorRef',
      organization: 'organization',
      workspace: 'workspace',
      provisionerIdentifier: 'pId2',
      planType: 'Apply',
      terraformVersion: 'v2',
      discardPendingRuns: false,
      targets: ['target1', 'target2'],
      variables: [{ name: 'myVar1', type: 'String', value: 'myVar1Value' }]
    }
  }
}

const runtimeValues = {
  name: 'TerraformCloudRun_step1',
  identifier: 'TerraformCloudRun_step1',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    runType: RunTypes.PlanOnly,
    runMessage: RUNTIME_INPUT_VALUE,
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      organization: RUNTIME_INPUT_VALUE,
      workspace: RUNTIME_INPUT_VALUE,
      provisionerIdentifier: RUNTIME_INPUT_VALUE,
      planType: 'Apply',
      terraformVersion: RUNTIME_INPUT_VALUE,
      discardPendingRuns: RUNTIME_INPUT_VALUE,
      exportTerraformPlanJson: RUNTIME_INPUT_VALUE,
      targets: RUNTIME_INPUT_VALUE
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => connectorResponse),
  useGetTerraformCloudOrganizations: jest.fn(() => organizationsResponse),
  useGetTerraformCloudWorkspaces: jest.fn(() => spacesResponse)
}))

describe('Test Terraform Cloud Run Step Edit View', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('Render edit view as edit step', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.TerraformCloudRun}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name', container)!, { target: { value: 'Step1' } })
      fireEvent.change(queryByNameAttribute('timeout', container)!, { target: { value: '20m' } })
      fireEvent.change(queryByNameAttribute('spec.spec.provisionerIdentifier', container)!, {
        target: { value: 'pId2' }
      })
    })

    await userEvent.click(getByText('common.optionalConfig'))
    await expect(getByText('common.variables')).toBeInTheDocument()
    await expect(getByText('pipeline.targets.title')).toBeInTheDocument()

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      type: StepType.TerraformCloudRun,
      timeout: '20m',
      spec: {
        runType: 'PlanOnly',
        runMessage: 'test message',
        spec: {
          connectorRef: 'connectorRef',
          organization: 'organization',
          workspace: 'workspace',
          provisionerIdentifier: 'pId2',
          planType: 'Apply',
          terraformVersion: 'v2',
          discardPendingRuns: false,
          targets: ['target1', 'target2'],
          variables: [{ name: 'myVar1', type: 'String', value: 'myVar1Value' }]
        }
      }
    })
  })

  test('edit view validation test', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={emptyInitialValues}
        type={StepType.TerraformCloudRun}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)

    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(5)
      expect(getByText('validation.timeout10SecMinimum')).toBeTruthy()
      expect(getByText('fieldRequired')).toBeTruthy()
      expect(getByText('common.validation.provisionerIdentifierIsRequired')).toBeTruthy()
    })

    // validate invalid value error for provisioner identifier
    const provIdInput = queryByNameAttribute('spec.spec.provisionerIdentifier', container)!
    fireEvent.input(provIdInput!, {
      target: { value: '$abc' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(getByText('common.validation.provisionerIdentifierPatternIsNotValid')).toBeTruthy()
    })
  })

  test('configure values should work fine when all values are runtime inputs', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.TerraformCloudRun}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    //run Message
    const messageInput = queryByNameAttribute('spec.runMessage', container) as HTMLInputElement
    const cogMessage = document.getElementById('configureOptions_spec.runMessage')
    await userEvent.click(cogMessage!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGMessage = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGMessage, messageInput)

    // connectorRef
    const connectorInput = queryByNameAttribute('spec.spec.connectorRef', container) as HTMLInputElement
    const cogConnectorRef = document.getElementById('configureOptions_spec.spec.connectorRef')
    await userEvent.click(cogConnectorRef!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGConnectorRef = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGConnectorRef, connectorInput)

    //organization
    const organizationInput = queryByNameAttribute('spec.spec.organization', container) as HTMLInputElement
    const cogOrganization = document.getElementById('configureOptions_spec.spec.organization')
    await userEvent.click(cogOrganization!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGOrganization = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGOrganization, organizationInput)

    //workspace
    const workspaceInput = queryByNameAttribute('spec.spec.workspace', container) as HTMLInputElement
    const cogWorkspace = document.getElementById('configureOptions_spec.spec.workspace')
    await userEvent.click(cogWorkspace!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGWorkspace = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGWorkspace, workspaceInput)

    //provisionerIdentifier
    const provisionerInput = queryByNameAttribute('spec.spec.provisionerIdentifier', container) as HTMLInputElement
    const cogProvisioner = document.getElementById('configureOptions_spec.spec.provisionerIdentifier')
    await userEvent.click(cogProvisioner!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGProvisioner = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGProvisioner, provisionerInput)

    //terraformVersion
    const terraformVersionInput = queryByNameAttribute('spec.spec.terraformVersion', container) as HTMLInputElement
    const cogTerraformVersion = document.getElementById('configureOptions_spec.spec.terraformVersion')
    await userEvent.click(cogTerraformVersion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGVersion = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGVersion, terraformVersionInput)

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        name: 'TerraformCloudRun_step1',
        identifier: 'TerraformCloudRun_step1',
        timeout: '<+input>',
        type: StepType.TerraformCloudRun,
        spec: {
          runType: 'PlanOnly',
          runMessage: '<+input>.regex(<+input>.includes(/test/))',
          spec: {
            connectorRef: '<+input>.regex(<+input>.includes(/test/))',
            organization: '<+input>.regex(<+input>.includes(/test/))',
            workspace: '<+input>.regex(<+input>.includes(/test/))',
            provisionerIdentifier: '<+input>.regex(<+input>.includes(/test/))',
            planType: 'Apply',
            terraformVersion: '<+input>.regex(<+input>.includes(/test/))',
            discardPendingRuns: '<+input>',
            exportTerraformPlanJson: '<+input>',
            targets: '<+input>',
            variables: []
          }
        }
      })
    )
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.TerraformCloudRun}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: initialValues,
          metadataMap: {
            'step TerraformCloudRun': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.name',
                localName: 'execution.steps.TerraformCloudRun_1.name'
              }
            },
            'step timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.timeout',
                localName: 'execution.steps.TerraformCloudRun_1.timeout'
              }
            },
            'step workspace': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.spec.workspace',
                localName: 'execution.steps.TerraformCloudRun_1.spec.spec.workspace'
              }
            },
            'step runMessage': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.runMessage',
                localName: 'execution.steps.TerraformCloudRun_1.spec.runMessage'
              }
            },
            'step provId': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.spec.provisionerIdentifier',
                localName: 'execution.steps.TerraformCloudRun_1.spec.spec.provisionerIdentifier'
              }
            },
            'step description': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.description',
                localName: 'execution.steps.TerraformCloudRun_1.description'
              }
            },
            'step connectorref': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.spec.connectorRef',
                localName: 'execution.steps.TerraformCloudRun_1.spec.spec.connectorRef'
              }
            },
            'step organisation': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.spec.organization',
                localName: 'execution.steps.TerraformCloudRun_1.spec.spec.organization'
              }
            },
            'step discardPendingRuns': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.spec.discardPendingRuns',
                localName: 'execution.steps.TerraformCloudRun_1.spec.spec.discardPendingRuns'
              }
            }
          }
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={emptyInitialValues}
        template={runtimeValues}
        type={StepType.TerraformCloudRun}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        inputSetData={{ path: '', readonly: true }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    await userEvent.type(timeoutInput!, '20m')

    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      name: 'TerraformCloudRun_step1',
      identifier: 'TerraformCloudRun_step1',
      timeout: '20m',
      spec: {
        runType: RunTypes.PlanOnly,
        runMessage: 'test message',
        spec: {
          connectorRef: '',
          organization: '',
          workspace: '',
          provisionerIdentifier: '',
          planType: 'Apply',
          terraformVersion: '',
          discardPendingRuns: false,
          exportTerraformPlanJson: false,
          targets: []
        }
      }
    })
  })

  test('Should render edit view for inputset view and fetch dropdowns on focus', async () => {
    const { container, getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.TerraformCloudRun,
          spec: {
            spec: {
              organization: '',
              workspace: ''
            }
          }
        }}
        template={{
          type: StepType.TerraformCloudRun,
          spec: {
            spec: {
              organization: RUNTIME_INPUT_VALUE,
              workspace: RUNTIME_INPUT_VALUE
            }
          }
        }}
        type={StepType.TerraformCloudRun}
        stepViewType={StepViewType.InputSet}
        inputSetData={{ path: '' }}
      />
    )
    const organizationInput = getByPlaceholderText('cd.steps.tasInfra.organizationPlaceholder') as HTMLElement
    organizationInput.focus()
    await waitFor(() => expect(organizationsResponse.refetch).toHaveBeenCalled())

    const portalDivs = document.getElementsByClassName('bp3-portal')
    await expect(portalDivs.length).toBe(1)
    const dropdownPortalDivRegion = portalDivs[0]
    const selectListOrganization = dropdownPortalDivRegion.querySelector('.bp3-menu')
    const selectItemRegion = await findElementByText(selectListOrganization as HTMLElement, 'harness-automation')
    fireEvent.click(selectItemRegion)
    const organizationSelect = queryByNameAttribute('spec.spec.organization', container) as HTMLInputElement
    expect(organizationSelect.value).toBe('harness-automation')

    const spaceInput = getByPlaceholderText('cd.steps.tasInfra.spacePlaceholder') as HTMLElement
    spaceInput.focus()
  })
})
