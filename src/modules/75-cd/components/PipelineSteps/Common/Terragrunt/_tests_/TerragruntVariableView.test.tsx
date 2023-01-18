/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TestWrapper } from '@common/utils/testUtils'
import { TerragruntVariableStep } from '../VariableView/TerragruntVariableView'
import { variableProps } from './TerragruntTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Terragrunt Variable view ', () => {
  test('initial render', () => {
    const { getByText } = render(
      <TerragruntVariableStep
        initialValues={{
          type: 'TerragruntDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        stepType={StepType.TerragruntDestroy}
        onUpdate={() => jest.fn()}
        {...{
          stageIdentifier: 'qaStage',
          metadataMap: variableProps.metadataMap,
          variablesData: variableProps.variablesData
        }}
      />
    )
    expect(getByText('provisionerIdentifier')).toBeInTheDocument()
  })

  test('should render with inline config', () => {
    const { getByText } = render(
      <TestWrapper>
        <TerragruntVariableStep {...variableProps} />
      </TestWrapper>
    )
    expect(getByText('provisionerIdentifier')).toBeInTheDocument()
    expect(getByText('pipelineSteps.configFiles')).toBeInTheDocument()
    expect(getByText('cd.terraformVarFiles')).toBeInTheDocument()
    expect(getByText('pipelineSteps.backendConfig')).toBeInTheDocument()
    expect(getByText('environmentVariables')).toBeInTheDocument()
  })

  test('should render with no config', () => {
    const { getByText } = render(
      <TestWrapper>
        <TerragruntVariableStep
          initialValues={{
            type: 'TerragruntDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: '10m',
            spec: {
              configuration: {
                type: 'Inline'
              },
              provisionerIdentifier: 'test'
            }
          }}
          originalData={{
            type: 'TerragruntDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: '10m',
            spec: {
              configuration: {
                type: 'Inline'
              },
              provisionerIdentifier: 'test'
            }
          }}
          variablesData={{
            type: 'TerragruntDestroy',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',
            spec: {
              provisionerIdentifier: 'step-provisionerIdentifier',
              configuration: { type: 'Inline' }
            }
          }}
          metadataMap={{
            'step-provisionerIdentifier': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.provisionerIdentifier',
                localName: 'execution.steps.terragruntDestroy.provisionerIdentifier'
              }
            }
          }}
        />
      </TestWrapper>
    )
    expect(getByText('provisionerIdentifier')).toBeInTheDocument()
  })
})
