/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText, fireEvent, act } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import ConfigFileStore from '../ConfigFilesStore'

jest.useFakeTimers()

const handleSubmit = jest.fn()
const nextStep = jest.fn()

const defaultProps = {
  stepName: 'Config File Source',
  prevStepData: {
    fileType: 'fileStore',
    files: ['account:/vit'],
    identifier: 'test1',
    store: 'Harness'
  },
  previousStep: jest.fn(),
  isReadonly: false,
  nextStep,
  handleSubmit,
  listOfConfigFiles: [],
  configFileIndex: 0,
  configFilesStoreTypes: ['Harness', 'Git'],
  expressions: ['org.identifier'],
  allowableTypes: ['FIXED'],
  handleStoreChange: jest.fn()
}

function WrapperComponent(props: any): JSX.Element {
  const { initialErrors, initialValues } = props || {}
  return (
    <TestWrapper>
      <Formik
        initialErrors={initialErrors}
        initialValues={initialValues}
        onSubmit={() => undefined}
        formName="TestWrapper"
      >
        {formikProps => (
          <FormikForm>
            <ConfigFileStore {...formikProps} {...props} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Define File store step', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render harness config step', async () => {
    const props = {
      ...defaultProps,
      initialValues: {
        store: 'Harness',
        connectorRef: '<+input>'
      }
    }

    const { container } = render(<WrapperComponent {...props} />)
    const option2 = container.querySelectorAll('.bp3-card')[0]
    const option1 = container.querySelectorAll('.bp3-card')[0]
    fireEvent.click(option2)
    fireEvent.click(option1)
    const submitBtn = await findByText(container, 'continue')
    act(() => {
      fireEvent.click(submitBtn)
    })

    expect(container).toBeDefined()
  })

  test('should submit git store', async () => {
    const props = {
      ...defaultProps,
      prevStepData: {
        ...defaultProps.prevStepData,
        store: 'Git'
      },
      initialValues: {
        store: 'Git'
      }
    }

    const { container } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText(container, 'continue')
    act(() => {
      fireEvent.click(submitBtn)
    })
    expect(container).toBeDefined()
  })
})
