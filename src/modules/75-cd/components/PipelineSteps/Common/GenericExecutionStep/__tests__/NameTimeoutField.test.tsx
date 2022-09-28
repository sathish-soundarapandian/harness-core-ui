/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  getByText as getElementByText
} from '@testing-library/react'
import { Formik } from 'formik'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { NameTimeoutField } from '../NameTimeoutField'

const doConfigureOptionsTesting = async (cogModal: HTMLElement) => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues') as HTMLInputElement
  act(() => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
}

const emptyInitialValues = { name: '', timeout: '' }
const mockSetFieldValue = jest.fn()
const handleSubmit = jest.fn()

describe('NameTimeoutField tests', () => {
  test(`renders fine for empty values`, () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <NameTimeoutField
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            setFieldValue={mockSetFieldValue}
            values={emptyInitialValues}
            readonly={false}
            stepViewType={StepViewType.Edit}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')
  })

  test(`change existing runtime value of timeout using cog`, async () => {
    const initialValues = { name: 'Existing Name', timeout: '<+input>' }

    const { container } = render(
      <TestWrapper>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <NameTimeoutField
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            setFieldValue={mockSetFieldValue}
            values={initialValues}
            isNewStep={true}
            readonly={false}
            stepViewType={StepViewType.Edit}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Existing Name')

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('<+input>')

    const cogTimeout = document.getElementById('configureOptions_step.timeout')
    userEvent.click(cogTimeout!)
    await waitFor(() => expect(modals.length).toBe(1))
    const timeoutCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(timeoutCOGModal)
    await waitFor(() =>
      expect(mockSetFieldValue).toBeCalledWith('timeout', '<+input>.regex(<+input>.includes(/test/))')
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <NameTimeoutField
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            setFieldValue={mockSetFieldValue}
            values={emptyInitialValues}
            isNewStep={false}
            readonly={false}
            stepViewType={StepViewType.Edit}
          />
        </Formik>
      </TestWrapper>
    )
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()
  })
})
