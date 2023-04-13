/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseListString } from 'services/cd-ng'
import { ConnectorsResponse } from '../../GcpInfrastructureSpec/__tests__/mock/ConnectorsResponse.mock'
import { ConnectorResponse } from '../../GcpInfrastructureSpec/__tests__/mock/ConnectorResponse.mock'
import { K8sAwsInfrastructureSpec } from '../K8sAwsInfrastructureSpec'

const ClusterNamesResponse: UseGetReturnData<ResponseListString> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ['us-west2/abc', 'us-west1-b/def'],
    correlationId: '33715e30-e0cd-408c-ad82-a412161733c2'
  }
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useGetEKSClusterNames: jest.fn(() => ClusterNamesResponse),

  getConnectorListV2Promise: jest.fn(() => Promise.resolve(ConnectorsResponse.data)),
  getEKSClusterNamesPromise: jest.fn(() => Promise.resolve(ClusterNamesResponse.data))
}))

const getRuntimeInputsValues = () => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  cluster: RUNTIME_INPUT_VALUE,
  namespace: RUNTIME_INPUT_VALUE,
  releaseName: RUNTIME_INPUT_VALUE
})

const getInitialValues = () => ({
  connectorRef: 'connectorRef',
  cluster: 'cluster',
  namespace: 'namespace',
  releaseName: 'releasename'
})

const getEmptyInitialValues = () => ({
  connectorRef: '',
  cluster: '',
  namespace: '',
  releaseName: ''
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
                          type: KubernetesAws
                          spec:
                              connectorRef: account.connectorRef
                              cluster: cluster
                              namespace: namespace
                              releaseName: releaseName`

const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'
const clusterPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.cluster'

factory.registerStep(new K8sAwsInfrastructureSpec())
// eslint-disable-next-line jest/no-disabled-tests
describe('Test K8sAwsInfrastructureSpec initialValues', () => {
  test('initial render with empty values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.KubernetesAws} stepViewType={StepViewType.Edit} />
    )
    expect(container.querySelector('span[data-tooltip-id="awsInfraConnector"]')).toBeInTheDocument()
    expect(container.querySelector('span[data-tooltip-id="awsInfraCluster"]')).toBeInTheDocument()
    expect(container.querySelector('span[data-tooltip-id="awsInfraNamespace"]')).toBeInTheDocument()
    expect(container.querySelector('span[data-tooltip-id="awsInfraAllowSimultaneousDeployments"]')).toBeInTheDocument()
  })

  test('render edit values with values ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        type={StepType.KubernetesAws}
        stepViewType={StepViewType.Edit}
      />
    )
    const clusterInput = queryByAttribute('name', container, 'cluster') as HTMLInputElement
    const namespaceInput = queryByAttribute('name', container, 'namespace') as HTMLInputElement
    expect(clusterInput.value).toBe('cluster')
    expect(namespaceInput.value).toBe('namespace')
  })

  test('render edit view with runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getRuntimeInputsValues()}
        type={StepType.KubernetesAws}
        stepViewType={StepViewType.Edit}
      />
    )
    const connectorInput = queryByAttribute('name', container, 'connectorRef') as HTMLInputElement
    const clusterInput = queryByAttribute('name', container, 'cluster') as HTMLInputElement
    const namespaceInput = queryByAttribute('name', container, 'namespace') as HTMLInputElement
    expect(connectorInput.value).toBe('<+input>')
    expect(clusterInput.value).toBe('<+input>')
    expect(namespaceInput.value).toBe('<+input>')
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.KubernetesAws}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test K8sAwsInfrastructureSpec behavior', () => {
  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.KubernetesAws}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should call onUpdate if valid values entered when connector ref is not present- inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          cluster: 'cluster',
          environmentRef: 'environmentRef',
          infrastructureRef: 'infrastructureRef'
        }}
        template={{
          cluster: RUNTIME_INPUT_VALUE
        }}
        allValues={{
          cluster: 'cluster',
          environmentRef: 'environmentRef',
          infrastructureRef: 'infrastructureRef'
        }}
        type={StepType.KubernetesAws}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith({
      cluster: 'cluster',
      environmentRef: 'environmentRef',
      infrastructureRef: 'infrastructureRef'
    })
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.KubernetesAws}
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
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.KubernetesAws}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
        ref={ref}
      />
    )

    await act(async () => {
      const namespaceInput = container.querySelector(
        '[placeholder="pipeline.infraSpecifications.namespacePlaceholder"]'
      )
      fireEvent.change(namespaceInput!, { target: { value: 'namespace changed' } })

      // TODO: add other fields

      await ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdateHandler).toHaveBeenCalledWith({ ...getInitialValues(), ...{ namespace: 'namespace changed' } })
    )
  })
})

describe('Test K8sAwsInfrastructureSpec autocomplete', () => {
  test('Test connector autocomplete', async () => {
    const step = new K8sAwsInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('AWS')

    list = await step.getConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    // TODO: create yaml that cause yaml.parse to throw an error
    // its expected that yaml.parse throw an error but is not happening
    list = await step.getConnectorsListForYaml(connectorRefPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test cluster names autocomplete', async () => {
    const step = new K8sAwsInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getClusterListForYaml(clusterPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('us-west2/abc')

    list = await step.getClusterListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    // TODO: create yaml that cause yaml.parse to throw an error
    // its expected that yaml.parse throw an error but is not happening
    list = await step.getClusterListForYaml(clusterPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
