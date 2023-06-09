/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { findByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import routes from '@common/RouteDefinitions'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { GoogleCloudFunctionInfraSpec, GoogleCloudFunctionInfrastructure } from '../GoogleCloudFunctionInfraSpec'
import { getGcfYaml, invalidGcfYaml, testConnectorRefChangeForGcp } from './helper'
import { gcfTypeRegions, gcpConnectorListResponse, gcpProjectListResponse } from './mocks'

const fetchConnector = jest.fn().mockReturnValue({ data: gcpConnectorListResponse.data?.content?.[1] })

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: () => Promise.resolve(gcpConnectorListResponse),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(gcpConnectorListResponse)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: gcpConnectorListResponse.data?.content?.[1] }, refetch: fetchConnector, loading: false }
  }),
  useGetRegionsForGoogleArtifactRegistry: jest.fn().mockImplementation(() => {
    return { data: gcfTypeRegions, loading: false }
  }),
  useGetProjects: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return Promise.resolve(gcpProjectListResponse)
      })
    }
  })
}))

const existingInitialValues = {
  infrastructureDefinition: {
    spec: {
      connectorRef: 'gcpConnector',
      region: 'asia-south2'
    }
  }
}

const emptyInitialValues = {
  connectorRef: '',
  region: '',
  project: ''
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
factory.registerStep(new GoogleCloudFunctionInfraSpec())

describe('GoogleCloudFunctionInfraSpec tests', () => {
  test('check infra tab for empty initial values', async () => {
    const ref = React.createRef<StepFormikRef<GoogleCloudFunctionInfrastructure>>()

    const { getByTestId, container } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={emptyInitialValues}
        allValues={emptyInitialValues}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.GoogleCloudFunctionsInfra}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    const allDropDownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Choose connectorRef
    const connnectorRefInput = getByTestId(/connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)
    await testConnectorRefChangeForGcp()

    // Choose project
    const projectDropdownIcon = allDropDownIcons[1]
    userEvent.click(projectDropdownIcon!)
    expect(portalDivs.length).toBe(2)
    const projectPortalDiv = portalDivs[1]
    const projectListMenu = projectPortalDiv.querySelector('.bp3-menu')
    const qaTargetProject = await findByText(projectListMenu as HTMLElement, 'qa-target')
    expect(qaTargetProject).not.toBeNull()
    userEvent.click(qaTargetProject)

    // Choose region
    const regionDropdownIcon = allDropDownIcons[2]
    userEvent.click(regionDropdownIcon!)
    expect(portalDivs.length).toBe(3)
    const regionDropdownPortalDiv = portalDivs[2]
    const regionSelectListMenu = regionDropdownPortalDiv.querySelector('.bp3-menu')
    const regionOption = await findByText(regionSelectListMenu as HTMLElement, 'asia-south2')
    expect(regionOption).not.toBeNull()
    userEvent.click(regionOption)

    // check Allow simultaneous deployments on the same infrastructure checkbox
    const allowSimultaneousDeploymentsCheckbox = queryByNameAttribute('allowSimultaneousDeployments', container)
    userEvent.click(allowSimultaneousDeploymentsCheckbox!)
    expect(allowSimultaneousDeploymentsCheckbox).toBeChecked()
    // submit form and verify
    ref.current?.submitForm()
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        connectorRef: 'gcpConnector',
        region: 'asia-south2',
        project: 'qa-target',
        allowSimultaneousDeployments: true
      })
    )
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.GoogleCloudFunctionsInfra}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            gcpConnector: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.GoogleCloudFunctionsInfra.connectorRef',
                localName: 'spec.GoogleCloudFunctionsInfra.connectorRef'
              }
            },
            'asia-south2': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.GoogleCloudFunctionsInfra.region',
                localName: 'spec.GoogleCloudFunctionsInfra.region'
              }
            }
          }
        }}
      />
    )

    expect(getByText('connectorRef')).toBeVisible()
    expect(getByText('gcpConnector')).toBeVisible()
    expect(getByText('region')).toBeVisible()
    expect(getByText('asia-south2')).toBeVisible()
  })

  test('Variables view should not render fine if variablesData is not sent properly', async () => {
    const wrongInitialValues = {
      connectorRef: 'gcpConnector',
      region: 'asia-south2',
      project: 'qa-target'
    }
    const { queryByText } = render(
      <TestStepWidget
        initialValues={wrongInitialValues}
        type={StepType.GoogleCloudFunctionsInfra}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: wrongInitialValues,
          metadataMap: {
            gcpConnector: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.GoogleCloudFunctionsInfra.connectorRef',
                localName: 'spec.GoogleCloudFunctionsInfra.connectorRef'
              }
            },
            'asia-south2': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.infrastructure.infrastructureDefinition.spec.GoogleCloudFunctionsInfra.region',
                localName: 'spec.GoogleCloudFunctionsInfra.region'
              }
            }
          }
        }}
      />
    )

    expect(queryByText('connectorRef')).toBeNull()
    expect(queryByText('gcpConnector')).toBeNull()
    expect(queryByText('region')).toBeNull()
    expect(queryByText('asia-south2')).toBeNull()
  })
})

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'

const params = (): PipelinePathProps & ModulePathParams => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('getConnectorsListForYaml test', () => {
  test('when connectorRefPath and yaml both are valid', async () => {
    const step = new GoogleCloudFunctionInfraSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml(connectorRefPath, getGcfYaml(), params)
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('gcpConnector')
  })

  test('when connectorRefPath is invalid and yaml is valid valid', async () => {
    const step = new GoogleCloudFunctionInfraSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml('invalid path', getGcfYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('when connectorRefPath is valid and yaml is invalid valid', async () => {
    const step = new GoogleCloudFunctionInfraSpec() as any
    const list: CompletionItemInterface[] = await step.getConnectorsListForYaml(
      'invalid path',
      invalidGcfYaml(),
      params
    )
    expect(list).toHaveLength(0)
  })
})
