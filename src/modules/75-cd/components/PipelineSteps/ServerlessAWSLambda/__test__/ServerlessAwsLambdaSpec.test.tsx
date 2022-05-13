/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ServerlessAwsLambdaSpec } from '../ServerlessAwsLambdaSpec'
import {
  getConnectorResponse,
  getConnectorsResponseMultiple
} from '../../ServerlessInfraSpec/mocks/ConnectorResponse.mock'

const ConnectorResponse = getConnectorResponse('ServerlessAwsLambda')
const MultipleConnectorsResponse = getConnectorsResponseMultiple('Aws')

// jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(MultipleConnectorsResponse.data))
}))

const getRuntimeInputsValues = () => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  region: RUNTIME_INPUT_VALUE,
  stage: RUNTIME_INPUT_VALUE
})

const getConnectorRuntimeInputValue = () => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  region: 'region',
  stage: 'stage'
})

const getRegionRuntimeInputValue = () => ({
  connectorRef: 'connectorRef',
  region: RUNTIME_INPUT_VALUE,
  stage: 'stage'
})

const getStageRuntimeInputValue = () => ({
  connectorRef: 'connectorRef',
  region: 'region',
  stage: RUNTIME_INPUT_VALUE
})

const getInitialValues = () => ({
  connectorRef: 'connectorRef',
  stage: 'stage',
  region: 'region'
})

const getEmptyInitialValues = () => ({
  connectorRef: '',
  stage: '',
  region: ''
})

const getInvalidYaml = () => `p ipe<>line:
sta ges:
   - st<>[]age:
              s pe<> c: <> sad-~`

const getYaml = () => `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: ServerlessAwsLambda
                          spec:
                              connectorRef: account.connectorRef
                              stage: stage
                              region: region`

const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

const customStepProps = {
  hasRegion: true,
  formInfo: {
    formName: 'serverlessAWSInfra',
    type: 'Aws',
    header: '',
    tooltipIds: {
      connector: 'awsInfraConnector',
      region: 'awsRegion',
      stage: 'awsStage'
    }
  }
}

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'

describe('Test ServerlessAwsLambdaSpec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new ServerlessAwsLambdaSpec())
  })

  test('should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={{}}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view with values ', () => {
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getInitialValues()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view with runtime values ', () => {
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getRuntimeInputsValues()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view for inputset view', () => {
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test ServerlessAwsLambdaSpec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new ServerlessAwsLambdaSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })

  test('should render configureOptions when connector as runtime', async () => {
    const onUpdateHandler = jest.fn()
    const { findByText, container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getConnectorRuntimeInputValue()}
        template={getConnectorRuntimeInputValue()}
        allValues={getConnectorRuntimeInputValue()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
      />
    )

    const settingsIcon = container.querySelector('[data-icon="cog"]')
    expect(settingsIcon).toBeInTheDocument()
    if (settingsIcon) {
      act(() => {
        fireEvent.click(settingsIcon)
      })
    }
    const cancelButton = await findByText('cancel')
    expect(cancelButton).toBeTruthy()
    act(() => {
      fireEvent.click(cancelButton)
    })
  })
  test('should render configureOptions when stage as runtime', async () => {
    const onUpdateHandler = jest.fn()
    const { container, findByText } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getStageRuntimeInputValue()}
        template={getStageRuntimeInputValue()}
        allValues={getStageRuntimeInputValue()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
      />
    )

    const settingsIcon = container.querySelector('[data-icon="cog"]')
    expect(settingsIcon).toBeInTheDocument()
    if (settingsIcon) {
      act(() => {
        fireEvent.click(settingsIcon)
      })
    }
    const cancelButton = await findByText('cancel')
    expect(cancelButton).toBeTruthy()
    act(() => {
      fireEvent.click(cancelButton)
    })
  })
  test('should render configureOptions when region as runtime', async () => {
    const onUpdateHandler = jest.fn()
    const { container, findByText } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getRegionRuntimeInputValue()}
        template={getRegionRuntimeInputValue()}
        allValues={getRegionRuntimeInputValue()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
      />
    )

    const settingsIcon = container.querySelector('[data-icon="cog"]')
    expect(settingsIcon).toBeInTheDocument()
    if (settingsIcon) {
      act(() => {
        fireEvent.click(settingsIcon)
      })
    }
    const cancelButton = await findByText('cancel')
    expect(cancelButton).toBeTruthy()
    act(() => {
      fireEvent.click(cancelButton)
    })
  })

  test('should call yaml onUpdate if valid values entered - edit view', async () => {
    const onUpdateHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessAwsInfra}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
        ref={ref}
      />
    )

    await act(async () => {
      const stageInput = container.querySelector('[placeholder="cd.steps.serverless.stagePlaceholder"]')
      await fireEvent.change(stageInput!, { target: { value: 'stage changed' } })

      const regionInput = container.querySelector('[placeholder="cd.steps.serverless.regionPlaceholder"]')
      fireEvent.change(regionInput!, { target: { value: 'region changed' } })
    })

    await waitFor(() =>
      expect(onUpdateHandler).toHaveBeenCalledWith({
        ...getInitialValues(),
        ...{ region: 'region changed', stage: 'stage changed' }
      })
    )
  })
})

describe('Test ServerlessAwsLambdaSpec autocomplete', () => {
  test('Test connector autocomplete', async () => {
    const step = new ServerlessAwsLambdaSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('Aws')

    list = await step.getConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)
    list = await step.getConnectorsListForYaml(connectorRefPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
