/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { Form } from 'formik'

import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { ShellScriptFormData } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import { OptionalConfigurationWithRef } from '../OptionalConfigurations'

const initialValues = {
  identifier: 'id',
  name: 'name',
  type: '',
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
const initialValuesWithData = {
  identifier: 'id',
  name: 'name',
  type: '',
  spec: {
    executionTarget: {},
    onDelegate: 'delegate',
    shell: 'Bash',
    source: {
      spec: {
        type: 'Inline',
        script: 'echo test'
      }
    }
  }
}

describe('Test OptionalConfigurations', () => {
  test('should match snapshot for OptionalConfigurations without initial values ', async () => {
    const { container } = render(
      <TestWrapper>
        <OptionalConfigurationWithRef initialValues={initialValues} allowableTypes={[]} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for OptionalConfigurations with initial values ', async () => {
    const { container } = render(
      <TestWrapper>
        <OptionalConfigurationWithRef initialValues={initialValuesWithData} allowableTypes={[]} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for OptionalConfigurations without initial values ', async () => {
    let formikCopy: any
    const onChangeMock = jest.fn()
    const updateTemplateMock = jest.fn()
    const { container, getByTestId } = render(
      <TestWrapper>
        <Formik<ShellScriptFormData> formName="test-form" initialValues={initialValues} onSubmit={jest.fn()}>
          {formik => {
            if (formik) {
              formikCopy = formik
            }

            return (
              <Form>
                <OptionalConfigurationWithRef
                  initialValues={initialValues}
                  allowableTypes={[]}
                  ref={formik as any}
                  onChange={onChangeMock}
                  updateTemplate={updateTemplateMock}
                />
              </Form>
            )
          }}
        </Formik>
      </TestWrapper>
    )
    const addEnvVars = getByTestId('add-environmentVar')
    act(() => {
      fireEvent.click(addEnvVars)
    })
    const envVar = container.querySelector('input[name="spec.environmentVariables[0].value"]')
    await waitFor(() => expect(envVar).toBeDefined())
    act(() => {
      fireEvent.change(container.querySelector('input[name="spec.environmentVariables[0].value"]')!, {
        target: { value: 'hello' }
      })
    })
    expect(onChangeMock).toBeCalled()
    act(() => {
      formikCopy.submitForm()
    })
    expect(onChangeMock).toBeCalled()

    expect(container).toMatchSnapshot()
  })
})
