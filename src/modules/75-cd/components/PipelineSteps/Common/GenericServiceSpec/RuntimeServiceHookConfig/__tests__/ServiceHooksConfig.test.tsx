/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { render } from '@testing-library/react'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import serviceHookSourceBaseFactory from '@cd/factory/ServiceHookSourceFactory/ServiceHookSourceFactory'
import { ServiceHooksConfig } from '../ServiceHooksConfig'

export const formik = {
  initialValues: {
    service: 'serviceHooks',
    serviceInputs: {
      serviceHooks: {
        serviceDefinition: {
          type: 'Kubernetes',
          spec: {
            hooks: [
              {
                postHook: {
                  identifier: 'runtimeContent',
                  store: {
                    content: '<+input>'
                  }
                }
              },
              {
                preHook: {
                  identifier: 'runtimeContentWithAllowedValues',
                  store: {
                    content: '<+input>.default(test content).allowedValues(test content)'
                  }
                }
              },
              {
                preHook: {
                  identifier: 'runtimeExecutionInput',
                  store: {
                    content: '<+input>.executionInput()'
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  setValues: jest.fn(),
  setFieldValue: jest.fn()
}
describe('ServiceHooksConfig test', () => {
  test('render ServiceHooksConfig ', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik formName="serviceHooks" initialValues={formik.initialValues} onSubmit={Promise.resolve}>
          <ServiceHooksConfig
            readonly={false}
            serviceHookSourceBaseFactory={serviceHookSourceBaseFactory}
            formik={formik}
            hooks={[
              {
                postHook: {
                  identifier: 'runtimeContent',
                  storeType: 'Inline',
                  actions: ['FetchFiles'],
                  store: {
                    content: 'echo test string'
                  }
                }
              }
            ]}
            path="serviceInputs.['serviceHooks'].serviceDefinition.spec"
            stageIdentifier="stageIdentifier"
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            initialValues={{
              deploymentType: 'Kubernetes'
            }}
            template={{
              hooks: [
                {
                  postHook: {
                    identifier: 'runtimeContent',
                    storeType: 'Inline',
                    store: {
                      content: RUNTIME_INPUT_VALUE
                    }
                  }
                }
              ]
            }}
            stepViewType={StepViewType.DeploymentForm}
          />
        </Formik>
      </TestWrapper>
    )
    expect(container).toBeInTheDocument()
    expect(getByText('runtimeContent')).toBeInTheDocument()
    const contentRuntimeInput = queryByNameAttribute(
      "serviceInputs.['serviceHooks'].serviceDefinition.spec.hooks[0].[postHook].store.content",
      container
    ) as HTMLInputElement
    expect(contentRuntimeInput.value).toEqual('<+input>')
  })
})
