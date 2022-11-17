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

import TfPlanInputStep from '../TfPlanInputStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

const initialValues = {
  type: 'TerraformPlan',
  name: 'Test A',
  identifier: 'Test_A',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    configuration: {
      command: 'Apply',
      workspace: RUNTIME_INPUT_VALUE,
      configFiles: {
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
    },
    targets: RUNTIME_INPUT_VALUE,
    environmentVariables: RUNTIME_INPUT_VALUE
  }
}

const template: any = {
  type: 'TerraformPlan',
  name: 'Test A',
  identifier: 'Test_A',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    configuration: {
      command: 'Apply',
      workspace: RUNTIME_INPUT_VALUE,
      configFiles: {
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
    },
    targets: RUNTIME_INPUT_VALUE,
    environmentVariables: RUNTIME_INPUT_VALUE
  }
}

describe('Test terraform input set', () => {
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
          <FormikForm>
            <TfPlanInputStep
              initialValues={initialValues as any}
              stepType={StepType.TerraformPlan}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
              path={'test'}
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
      <TestWrapper
        defaultAppStoreValues={{
          featureFlags: { TERRAFORM_REMOTE_BACKEND_CONFIG: true }
        }}
      >
        <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
          <FormikForm>
            <TfPlanInputStep
              initialValues={beConfigInitialVallues as any}
              stepType={StepType.TerraformPlan}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
              path={'test'}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(getByText('pipelineSteps.backendConfig')).toBeInTheDocument()
  })
})
