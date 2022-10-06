/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { fireEvent, render } from '@testing-library/react'
import { FormikForm, TextInput } from '@wings-software/uicore'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { InputWithDynamicModalForJsonMultiType } from '../InputWithDynamicModalForJsonMultiType'
import type { InputWithDynamicModalForJsonProps } from '../InputWithDynamicModalForJson.types'

function WrapperComponent(props: InputWithDynamicModalForJsonProps): any {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <FormikForm>
          <InputWithDynamicModalForJsonMultiType {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

jest.mock('../InputWithDynamicModalForJson', () => ({
  __esModule: true,
  InputWithDynamicModalForJson: (props: any) => (
    <TextInput name="InputWithDynamicModalForJson" onChange={props?.onChange} />
  )
}))

describe('Unit tests for InputWithDynamicModalForJsonMultiType component', () => {
  const initialProps = {
    onChange: jest.fn(),
    isQueryExecuted: true,
    isDisabled: false,
    sampleRecord: {},
    inputLabel: 'input-label',
    inputName: 'input-name',
    inputPlaceholder: 'input-placeholder',
    noRecordModalHeader: 'norecord-modalheader',
    noRecordInputLabel: 'norecord-inputlabel',
    recordsModalHeader: 'record-modal-header',
    fieldValue: 'field'
  }

  test('Verify that Valid Records state is rendering correctly for InputWithDynamicModalForJsonMultiType with Runtime value ', async () => {
    const submit = jest.fn()
    const { container, getByText } = render(
      <WrapperComponent {...initialProps} onChange={submit} sampleRecord={null} isMultiType />
    )
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'InputWithDynamicModalForJson',
      value: 'metricValue'
    })
    expect(container).toMatchSnapshot()
    const fixedInputIcon = container.querySelector('span[data-icon="fixed-input"]')
    fireEvent.click(fixedInputIcon!)
    const runtimeBtn = await getByText('Runtime input')
    const expressionBtn = await getByText('Expression')
    expect(runtimeBtn).toBeInTheDocument()
    expect(expressionBtn).toBeInTheDocument()
    fireEvent.click(runtimeBtn)
    const runtimeInputIcon = container.querySelector('span[data-icon="runtime-input"]')
    expect(runtimeInputIcon).toBeInTheDocument()
    fireEvent.click(runtimeInputIcon!)

    const fixedBtn = await getByText('Fixed value')
    fireEvent.click(fixedBtn)
  })
})
