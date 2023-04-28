/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText, fireEvent, act } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceHooksMap } from '@pipeline/components/ServiceHooks/ServiceHooksHelper'
import ServiceHooksStore from '../ServiceHooksStore'

const handleSubmit = jest.fn()
const nextStep = jest.fn()

const defaultProps = {
  stepName: 'Service Hooks Store',
  prevStepData: {
    identifier: 'serviceHook',
    storeType: ServiceHooksMap.Inline,
    hookType: 'preHook',
    actions: ['FetchFiles'],
    store: {
      content: 'echo string'
    }
  },
  previousStep: jest.fn(),
  isReadonly: false,
  nextStep,
  handleSubmit,
  listOfServiceHooks: [],
  configFileIndex: 0,
  serviceHooksStoreTypes: ['Inline'],
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
            <ServiceHooksStore {...formikProps} {...props} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Initialise Service Hooks store step', () => {
  test('should render service hooks store step', async () => {
    const { container } = render(<WrapperComponent {...defaultProps} />)
    const option1 = container.querySelectorAll('.bp3-card')[0]
    await act(async () => {
      const inlineStoreBtn = await findByText(container, 'inline')
      fireEvent.click(inlineStoreBtn)
    })
    expect(option1).toHaveClass('Card--selected')
    const submitBtn = await findByText(container, 'continue')
    act(() => {
      fireEvent.click(submitBtn)
    })
    expect(container).toBeDefined()
  })
})
