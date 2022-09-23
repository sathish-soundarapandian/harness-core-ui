/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { TestWrapper } from '@common/utils/testUtils'
import type { RollbackVariableStepProps } from '../AzureArmRollback.types'
import { AzureArmRollbackVariableStep } from '../AzureArmRollbackVariableView'

const props = {
  initialValues: {
    type: StepType.AzureArmRollback,
    name: 'rollback',
    timeout: '10m',
    identifier: 'rollback',
    spec: {
      provisionerIdentifier: 'test_id'
    }
  },
  originalData: {
    type: StepType.AzureArmRollback,
    name: 'rollback',
    timeout: '10m',
    identifier: 'rollback',
    spec: {
      provisionerIdentifier: 'test_id'
    }
  },
  stageIdentifier: 'qaStage',
  onUpdate: jest.fn(),
  metadataMap: {
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.execution.steps.rollback.name',
        localName: 'step.rollback.name'
      }
    },
    'step-timeout': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.execution.steps.rollback.timeout',
        localName: 'step.rollback.timeout'
      }
    },
    'step-provisionerIdentifier': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.execution.steps.rollback.spec.provisionerIdentifier',
        localName: 'step.rollback.spec.provisionerIdentifier'
      }
    }
  },
  stepType: StepType.AzureArmRollback
} as RollbackVariableStepProps

describe('Rollback stack Variable view ', () => {
  test('initial render', () => {
    const { container } = render(
      <AzureArmRollbackVariableStep
        initialValues={{
          type: StepType.AzureArmRollback,
          name: 'rollback',
          identifier: 'rollback',
          timeout: '10m',
          spec: {
            provisionerIdentifier: 'test_id'
          }
        }}
        stepType={StepType.AzureArmRollback}
        {...{
          stageIdentifier: 'qaStage',
          metadataMap: props.metadataMap,
          variablesData: props.variablesData
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('initial render inline with no values', () => {
    const { container } = render(
      <TestWrapper>
        <AzureArmRollbackVariableStep
          initialValues={{
            type: StepType.AzureArmRollback,
            name: '',
            timeout: '10m',
            identifier: '',
            spec: {
              provisionerIdentifier: ''
            }
          }}
          stepType={StepType.AzureArmRollback}
          {...{
            stageIdentifier: 'qaStage',
            metadataMap: props.metadataMap,
            variablesData: props.variablesData
          }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render with inline config', () => {
    const { container } = render(
      <TestWrapper>
        <AzureArmRollbackVariableStep {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
