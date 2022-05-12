/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { ServerlessGCPSpec } from '../ServerlessGCPSpec'
import {
  getConnectorResponse,
  getConnectorsResponseMultiple
} from '../../ServerlessInfraSpec/mocks/ConnectorResponse.mock'

const ConnectorResponse = getConnectorResponse('ServerlessGCP')
const MultipleConnectorsResponse = getConnectorsResponseMultiple('GCP')

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(MultipleConnectorsResponse.data))
}))

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'

const getRuntimeInputsValues = () => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  stage: RUNTIME_INPUT_VALUE
})

const getInitialValues = () => ({
  connectorRef: 'connectorRef',
  stage: 'stage'
})

const getEmptyInitialValues = () => ({
  connectorRef: '',
  stage: ''
})

const customStepProps = {
  formInfo: {
    formName: 'serverlessGCPInfra',
    type: 'Gcp',
    header: '',
    tooltipIds: {
      connector: 'gcpInfraConnector',
      region: 'gcpRegion',
      stage: 'gcpStage'
    }
  }
}

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
                          type: ServerlessGCP
                          spec:
                              connectorRef: account.connectorRef
                              stage: stage`

const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('Test ServerlessGCPSpec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new ServerlessGCPSpec())
  })

  test('should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={{}}
        type={StepType.ServerlessGCP}
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
        type={StepType.ServerlessGCP}
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
        type={StepType.ServerlessGCP}
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
        type={StepType.ServerlessGCP}
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
        type={StepType.ServerlessGCP}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test ServerlessGCPSpec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new ServerlessGCPSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessGCP}
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
        type={StepType.ServerlessGCP}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })

  test('should call onUpdate if valid values entered - edit view', async () => {
    const onUpdateHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        customStepProps={customStepProps}
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.ServerlessGCP}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
        ref={ref}
      />
    )
    await act(async () => {
      const stageInput = container.querySelector('[placeholder="cd.steps.serverless.stagePlaceholder"]')
      fireEvent.change(stageInput!, { target: { value: 'stage changed' } })
    })

    await waitFor(() =>
      expect(onUpdateHandler).toHaveBeenCalledWith({ ...getInitialValues(), ...{ stage: 'stage changed' } })
    )
  })

  describe('Test GcpInfrastructureSpec autocomplete', () => {
    test('Test connector autocomplete', async () => {
      const step = new ServerlessGCPSpec() as any
      let list: CompletionItemInterface[]

      list = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
      expect(list).toHaveLength(2)
      expect(list[0].insertText).toBe('GCP')

      list = await step.getConnectorsListForYaml('invalid path', getYaml(), getParams())
      expect(list).toHaveLength(0)
      list = await step.getConnectorsListForYaml(connectorRefPath, getInvalidYaml(), getParams())
      expect(list).toHaveLength(0)
    })
  })
})
