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
import type { TerraformVariableStepProps } from '../TerraformInterfaces'
import { TerraformVariableStep } from '../TerraformVariableView'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const props = {
  initialValues: {
    type: 'TerraformDestroy',
    name: 'sdec',
    identifier: 'sdec',
    spec: {
      provisionerIdentifier: 'igh',
      configuration: {
        type: 'Inline',
        spec: {
          backendConfig: {
            type: 'Inline',
            spec: {
              content: 'test'
            }
          },
          targets: ['test1', 'test2'],
          environmentVariables: [
            { key: 'test', value: 'abc' },
            { key: 'test2', value: 'abc2' }
          ],
          varFiles: [
            {
              varFile: {
                type: 'Inline',
                identifier: 'file_id_1',
                spec: {
                  type: 'inline_type_spec'
                }
              }
            },
            {
              varFile: {
                type: 'Remote',
                identifier: 'file_id_2',
                spec: {
                  type: 'remote_type_spec'
                }
              }
            }
          ]
        }
      }
    }
  },
  originalData: {
    type: 'TerraformDestroy',
    name: 'sdec',
    identifier: 'sdec',
    spec: {
      provisionerIdentifier: 'igh',
      configuration: {
        type: 'Inline',
        spec: {
          backendConfig: {
            type: 'Inline',
            spec: {
              content: 'test'
            }
          },
          targets: ['test1', 'test2'],
          environmentVariables: [
            { key: 'test', value: 'abc' },
            { key: 'test2', value: 'abc2' }
          ]
        }
      }
    }
  },
  stageIdentifier: 'qaStage',
  onUpdate: jest.fn(),
  metadataMap: {
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.name',
        localName: 'step.terraformDestroy.name'
      }
    },

    'step-timeout': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.timeout',
        localName: 'step.terraformDestroy.timeout'
      }
    },
    'step-delegateSelectors': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.delegateSelectors',
        localName: 'step.terraformDestroy.delegateSelectors'
      }
    },
    'step-provisionerIdentifier': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.provisionerIdentifier',
        localName: 'step.terraformDestroy.provisionerIdentifier'
      }
    }
  },
  variablesData: {
    type: 'TerraformDestroy',
    name: 'step-name',
    identifier: 'Test_A',
    timeout: 'step-timeout',

    spec: {
      provisionerIdentifier: 'step-provisionerIdentifier',
      configuration: {
        type: 'Inline',
        spec: {
          backendConfig: {
            type: 'Inline',
            spec: {
              content: 'test'
            }
          },
          targets: ['test1', 'test2'],
          environmentVariables: [
            { key: 'test', value: 'abc' },
            { key: 'test2', value: 'abc2' }
          ],
          varFiles: [
            {
              varFile: {
                type: 'Inline',
                identifier: 'file_id_1',
                spec: {
                  type: 'inline_type_spec'
                }
              }
            },
            {
              varFile: {
                type: 'Remote',
                identifier: 'file_id_2',
                spec: {
                  type: 'remote_type_spec'
                }
              }
            }
          ]
        }
      }
    }
  },
  stepType: StepType.TerraformDestroy
} as TerraformVariableStepProps

describe('Terraform Variable view ', () => {
  test('initial render', () => {
    const { container } = render(
      <TerraformVariableStep
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          // delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              type: 'InheritFromPlan'
            }
          }
        }}
        stepType={StepType.TerraformDestroy}
        onUpdate={() => jest.fn()}
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
        <TerraformVariableStep
          initialValues={{
            type: 'TerraformDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: '10m',
            spec: {
              provisionerIdentifier: RUNTIME_INPUT_VALUE,
              configuration: {
                type: 'Inline'
              }
            }
          }}
          stepType={StepType.TerraformDestroy}
          onUpdate={() => jest.fn()}
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
        <TerraformVariableStep {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('should render with no config', () => {
    const { container } = render(
      <TestWrapper>
        <TerraformVariableStep
          {...props}
          initialValues={{
            type: 'TerraformDestroy',
            name: 'Test A',
            identifier: 'Test_A',
            timeout: '10m'
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
