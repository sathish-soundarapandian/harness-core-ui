/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText, fireEvent, waitFor, act } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import { HarnessConfigStep } from '../HarnessConfigStep'

jest.useFakeTimers()

const handleSubmit = jest.fn()

const defaultProps = {
  stepName: 'Config File Details',
  prevStepData: {
    fileType: 'fileStore',
    files: ['account:/vit'],
    identifier: 'test1',
    store: 'Harness'
  },
  previousStep: jest.fn(),
  isEditMode: false,
  handleSubmit,
  listOfConfigFiles: [],
  configFileIndex: 0
}

function WrapperComponent(props: any): JSX.Element {
  const { initialErrors } = props || {}
  return (
    <TestWrapper>
      <Formik
        initialErrors={initialErrors}
        initialValues={{ valuesPath: ['account:/vit', 'account:/vit1'] }}
        onSubmit={() => undefined}
        formName="TestWrapper"
      >
        {formikProps => (
          <FormikForm>
            <HarnessConfigStep {...formikProps} {...props} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Define Harness config step', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render harness config step', async () => {
    const props = { ...defaultProps }

    const { container } = render(<WrapperComponent {...props} />)
    const identifierField = container.querySelector('input[name="identifier"]') as HTMLInputElement
    fireEvent.change(identifierField, { target: { value: 'testTemp' } })
    expect(identifierField).toHaveValue('testTemp')
    fireEvent.change(identifierField, { target: { value: 'test1' } })
    expect(identifierField).toHaveValue('test1')
    expect(container).toBeDefined()
  })
  test('should submit form data', async () => {
    const props = { ...defaultProps, stepName: undefined }

    const { container } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText(container, 'submit')
    act(() => {
      fireEvent.click(submitBtn)
    })

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
  })
  test('should submit encrypted case', async () => {
    const props = {
      ...defaultProps,
      prevStepData: {
        ...defaultProps.prevStepData,
        fileType: 'encrypted'
      },
      isEditMode: true
    }

    const { container } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText(container, 'submit')
    act(() => {
      fireEvent.click(submitBtn)
    })

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
  })
})
