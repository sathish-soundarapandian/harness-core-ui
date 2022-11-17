/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, FormikForm, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { FormMultiTypeCheckboxField } from '../MultiTypeCheckbox/MultiTypeCheckbox'
import { FormMultiTypeRadioGroupField } from '../MultiTypeRadioGroup/MultiTypeRadioGroup'
import { FormMultiTypeTextAreaField } from '../MultiTypeTextArea/MultiTypeTextArea'

const onSubmit = jest.fn()

const SampleComponent: React.FC<{
  checkboxValue?: boolean | string
  radioValue?: string
  textAreaValue?: string
}> = props => {
  return (
    <Formik initialValues={props} onSubmit={onSubmit} formName="runtimeInputsTest">
      <FormikForm>
        <FormMultiTypeCheckboxField name="checkboxValue" label="CheckBox" />
        <FormMultiTypeRadioGroupField
          name="radioValue"
          label="RadioGroup"
          options={[
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' }
          ]}
        />
        <FormMultiTypeTextAreaField
          name="textAreaValue"
          label="TextArea"
          multiTypeTextArea={{
            enableConfigureOptions: false
          }}
        />
      </FormikForm>
    </Formik>
  )
}

describe('RuntimeInput Tests for checkbox, RadioGroup and Text Area', () => {
  test('should render without default values', () => {
    const { container } = render(<SampleComponent />)
    expect(container).toMatchSnapshot()
  })
  test('should render with default fixed values', () => {
    const { container } = render(<SampleComponent textAreaValue="Hi" checkboxValue={true} radioValue="option2" />)
    expect(container).toMatchSnapshot()
  })
  test('should render with default runtimeInput values', () => {
    const { container } = render(
      <SampleComponent
        textAreaValue={RUNTIME_INPUT_VALUE}
        checkboxValue={RUNTIME_INPUT_VALUE}
        radioValue={RUNTIME_INPUT_VALUE}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
