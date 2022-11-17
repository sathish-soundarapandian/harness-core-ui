/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { Formik, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import TerraformInputStep from '../TerraformInputStep'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const initialValues = {
  timeout: '10m',
  spec: {
    provisionerIdentifier: 'test',
    configuration: {
      type: 'Inline',
      spec: {
        workspace: 'test',
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: 'Branch',
              branch: 'test',
              folderPath: 'folder',
              connectorRef: 'test'
            }
          }
        }
      }
    },

    targets: ['target-1', 'target-2']
  }
}

const template: any = {
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    configuration: {
      type: 'Inline',
      spec: {
        workspace: RUNTIME_INPUT_VALUE,
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              folderPath: RUNTIME_INPUT_VALUE,
              connectorRef: 'test'
            }
          }
        },
        backendConfig: {
          type: 'Inline',
          spec: {
            content: RUNTIME_INPUT_VALUE
          }
        },
        targets: RUNTIME_INPUT_VALUE,
        varFiles: [
          {
            varFile: {
              type: 'Inline',
              identifier: 'file_id_1',
              spec: {
                type: 'inline_type_spec',
                content: RUNTIME_INPUT_VALUE
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
          },
          {
            varFile: {
              identifier: 'file_id_3',
              spec: {
                type: 'remote_type_spec'
              }
            }
          }
        ]
      }
    },

    targets: RUNTIME_INPUT_VALUE
  }
}

describe('Test terraform input set', () => {
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
          <FormikForm>
            <TerraformInputStep
              initialValues={initialValues as any}
              stepType={StepType.TerraformDestroy}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
              path="test"
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render backend config when it is Remote type', () => {
    const beConfigInitialVallues = {
      ...initialValues,
      spec: {
        configuration: {
          backendConfig: {
            spec: {
              store: {
                spec: {
                  branch: RUNTIME_INPUT_VALUE,
                  folderPath: RUNTIME_INPUT_VALUE,
                  connectorRef: {
                    label: 'test',
                    Scope: 'Account',
                    value: 'test',
                    connector: {
                      type: 'GIT',
                      spec: {
                        val: 'test'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const { getByText } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
          <FormikForm>
            <TerraformInputStep
              initialValues={beConfigInitialVallues as any}
              stepType={StepType.TerraformApply}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
              path="test"
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )

    expect(getByText('pipelineSteps.backendConfig')).toBeInTheDocument()
  })
})
