/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import { render, waitFor, act } from '@testing-library/react'
import { Form } from 'formik'
import { Formik } from '@wings-software/uicore'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'

import { TestWrapper } from '@common/utils/testUtils'
import { BaseScriptWithRef } from '../BaseScriptForm'

const defaultInitialValues = {
  identifier: 'id',
  name: 'name',
  type: '',
  spec: {}
}
const defaultInitialValuesCorrect = {
  identifier: 'id',
  name: 'name',
  type: '',
  spec: {
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: undefined
      }
    }
  }
}

const initialValues = {
  ...defaultInitialValues,
  spec: {
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: 'echo test'
      }
    }
  }
}
const initialValuesWithExpressions = {
  ...defaultInitialValues,
  spec: {
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: '<+spec.environmentVariable.var1>'
      }
    }
  }
}

const initialValuesWithRI = {
  ...defaultInitialValues,
  spec: {
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: '<+input>'
      }
    }
  }
}

describe('Test BaseScriptWithRef', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <BaseScriptWithRef initialValues={defaultInitialValues} allowableTypes={[]} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('should match snapshot for BaseScriptWithRef with initial values', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <BaseScriptWithRef initialValues={initialValues} allowableTypes={[MultiTypeInputType.EXPRESSION]} />
      </TestWrapper>
    )
    await waitFor(() => getByText('echo test'))
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for BaseScriptWithRef with initial script values with expressions', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <BaseScriptWithRef
          initialValues={initialValuesWithExpressions}
          allowableTypes={[MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )
    await waitFor(() => getByText('<+spec.environmentVariable.var1>'))
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for BaseScriptWithRef with initial script values with runtimeInput', async () => {
    const { container } = render(
      <TestWrapper>
        <BaseScriptWithRef initialValues={initialValuesWithRI} allowableTypes={[MultiTypeInputType.RUNTIME]} />
      </TestWrapper>
    )
    const configureBtn = container.querySelector('button[id="configureOptions_spec.source.spec.script"]')

    await waitFor(() => expect(configureBtn).toBeDefined())

    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for BaseScriptWithRef without initial values ', async () => {
    const updateTemplateRef = jest.fn()
    const { container } = render(
      <TestWrapper>
        <Formik<any> formName="test-form" initialValues={defaultInitialValuesCorrect} onSubmit={jest.fn()}>
          {formik => {
            return (
              <Form>
                <BaseScriptWithRef
                  initialValues={defaultInitialValuesCorrect}
                  allowableTypes={[]}
                  ref={formik as any}
                  updateTemplate={updateTemplateRef}
                />
              </Form>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    const shell = container.querySelector('input[name="spec.shell"]')
    await waitFor(() => expect(shell).toBeDefined())

    act(() => {
      fillAtForm([
        {
          container,
          fieldId: 'spec.source.spec.script',
          type: InputTypes.TEXTAREA,
          value: 'echo test'
        }
      ])
    })

    expect(updateTemplateRef).toBeCalledWith({
      identifier: 'id',
      name: 'name',
      type: '',
      spec: {
        executionTarget: {
          connectorRef: undefined
        },
        shell: 'Bash',
        source: {
          spec: {
            type: 'Inline',
            script: 'echo test'
          }
        }
      }
    })
  })
})
