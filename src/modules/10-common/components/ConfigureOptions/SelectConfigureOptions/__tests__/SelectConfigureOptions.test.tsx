/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, waitFor, getByText as getElementByText, queryByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { GetDataError } from 'restful-react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { Failure } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { SelectConfigureOptions, SelectConfigureOptionsProps } from '../SelectConfigureOptions'

const onChange = jest.fn()
const listOptions = [
  { label: 'test1', value: 'test1' },
  { label: 'test2', value: 'test2' },
  { label: 'test3', value: 'test3' }
]

const props: SelectConfigureOptionsProps = {
  value: RUNTIME_INPUT_VALUE,
  type: 'String',
  variableName: 'repository',
  showRequiredField: false,
  showDefaultField: false,
  showAdvanced: true,
  onChange: onChange,
  isReadonly: false,
  options: listOptions,
  loading: false,
  error: null
}

const doConfigureOptionsTesting = async (cogModal: HTMLElement) => {
  // No popovers should be opened initially
  const popovers = document.getElementsByClassName('bp3-popover')
  expect(popovers.length).toBe(0)
  // Click on Allowed Values radio button and then on Select input
  await waitFor(() => expect(getElementByText(cogModal, 'allowedValues')).toBeInTheDocument())
  const allowedValuesRadio = getElementByText(cogModal, 'allowedValues')
  userEvent.click(allowedValuesRadio)
  await waitFor(() => expect(getElementByText(cogModal, 'advancedTitle')).toBeInTheDocument())
  const allowedValuesSelect = queryByAttribute('name', cogModal, 'allowedValues')
  userEvent.click(allowedValuesSelect!)
  // 1 popover should be opened which displays list of options
  // Click on test1 and test2 options
  await waitFor(() => expect(popovers.length).toBe(1))
  const selectOptionsPopover = popovers[0] as HTMLElement
  const option1 = queryByText(selectOptionsPopover, 'test1')
  await waitFor(() => expect(option1).toBeInTheDocument())
  const option2 = getElementByText(selectOptionsPopover, 'test2')
  expect(option2).toBeInTheDocument()
  userEvent.click(option1!)
  userEvent.click(option2)
  // Click on Submit button and verify onChange call
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
  await waitFor(() => expect(onChange).toBeCalledWith('<+input>.allowedValues(test1,test2)', undefined, undefined))
}

describe('SelectConfigureOptions tests', () => {
  beforeEach(() => {
    onChange.mockReset()
  })

  test(`onChange should be called with correct arguments after options are chosen from dropdown and Submit is clicked`, async () => {
    render(
      <TestWrapper>
        <SelectConfigureOptions {...props} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_repository')
    userEvent.click(cogButton!)
    await waitFor(() => expect(modals.length).toBe(1))
    const cogModal = modals[0] as HTMLElement

    await doConfigureOptionsTesting(cogModal)
  })

  test(`when loading is true`, async () => {
    props.loading = true
    render(
      <TestWrapper>
        <SelectConfigureOptions {...props} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_repository')
    userEvent.click(cogButton!)
    await waitFor(() => expect(modals.length).toBe(1))
    const cogModal = modals[0] as HTMLElement

    await waitFor(() => expect(getElementByText(cogModal, 'allowedValues')).toBeInTheDocument())
    const allowedValuesRadio = getElementByText(cogModal, 'allowedValues')
    userEvent.click(allowedValuesRadio)
    const allowedValuesSelect = queryByAttribute('name', cogModal, 'allowedValues') as HTMLInputElement
    expect(allowedValuesSelect).toBeInTheDocument()
    await waitFor(() => expect(allowedValuesSelect.placeholder).toBe('- loading -'))
  })

  test(`when status is ERROR`, async () => {
    props.loading = false
    props.error = {
      data: {
        status: 'ERROR',
        message: 'Failed to fetch'
      },
      message: 'ERROR 500: Failed to fetch'
    } as GetDataError<Failure>

    render(
      <TestWrapper>
        <SelectConfigureOptions {...props} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_repository')
    userEvent.click(cogButton!)
    await waitFor(() => expect(modals.length).toBe(1))
    const cogModal = modals[0] as HTMLElement

    await waitFor(() => expect(getElementByText(cogModal, 'allowedValues')).toBeInTheDocument())
    const allowedValuesRadio = getElementByText(cogModal, 'allowedValues')
    userEvent.click(allowedValuesRadio)
    const allowedValuesSelect = queryByAttribute('name', cogModal, 'allowedValues') as HTMLInputElement
    expect(allowedValuesSelect).toBeInTheDocument()
    expect(getElementByText(cogModal, 'Failed to fetch')).toBeInTheDocument()
  })

  test(`when status is ERROR and data field is not present inside error object`, async () => {
    props.error = {
      data: {
        status: 'ERROR'
      },
      message: 'ERROR 500: Failed to fetch'
    } as GetDataError<Failure>

    render(
      <TestWrapper>
        <SelectConfigureOptions {...props} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_repository')
    userEvent.click(cogButton!)
    await waitFor(() => expect(modals.length).toBe(1))
    const cogModal = modals[0] as HTMLElement

    await waitFor(() => expect(getElementByText(cogModal, 'allowedValues')).toBeInTheDocument())
    const allowedValuesRadio = getElementByText(cogModal, 'allowedValues')
    userEvent.click(allowedValuesRadio)
    const allowedValuesSelect = queryByAttribute('name', cogModal, 'allowedValues') as HTMLInputElement
    expect(allowedValuesSelect).toBeInTheDocument()
    expect(getElementByText(cogModal, 'somethingWentWrong')).toBeInTheDocument()
  })

  test(`when status is FAILURE`, async () => {
    props.error = {
      data: {
        status: 'FAILURE',
        errors: [
          {
            fieldId: 'repository',
            error: 'No results fould for given params'
          }
        ]
      },
      message: 'Something went wrong'
    } as GetDataError<Failure>

    render(
      <TestWrapper>
        <SelectConfigureOptions {...props} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_repository')
    userEvent.click(cogButton!)
    await waitFor(() => expect(modals.length).toBe(1))
    const cogModal = modals[0] as HTMLElement

    await waitFor(() => expect(getElementByText(cogModal, 'allowedValues')).toBeInTheDocument())
    const allowedValuesRadio = getElementByText(cogModal, 'allowedValues')
    userEvent.click(allowedValuesRadio)
    const allowedValuesSelect = queryByAttribute('name', cogModal, 'allowedValues') as HTMLInputElement
    expect(allowedValuesSelect).toBeInTheDocument()
    expect(getElementByText(cogModal, 'repository No results fould for given params')).toBeInTheDocument()
  })

  test(`when status is FAILURE and fieldId is not present inside error object`, async () => {
    props.error = {
      data: {
        status: 'FAILURE',
        errors: [
          {
            error: 'No results fould for given params'
          }
        ]
      },
      message: 'Something went wrong'
    } as GetDataError<Failure>

    render(
      <TestWrapper>
        <SelectConfigureOptions {...props} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_repository')
    userEvent.click(cogButton!)
    await waitFor(() => expect(modals.length).toBe(1))
    const cogModal = modals[0] as HTMLElement

    await waitFor(() => expect(getElementByText(cogModal, 'allowedValues')).toBeInTheDocument())
    const allowedValuesRadio = getElementByText(cogModal, 'allowedValues')
    userEvent.click(allowedValuesRadio)
    const allowedValuesSelect = queryByAttribute('name', cogModal, 'allowedValues') as HTMLInputElement
    expect(allowedValuesSelect).toBeInTheDocument()
    expect(getElementByText(cogModal, 'somethingWentWrong')).toBeInTheDocument()
  })

  test(`when status is FAILURE and error object is not present`, async () => {
    props.error = {
      data: {
        status: 'FAILURE',
        errors: []
      },
      message: 'Something went wrong'
    } as GetDataError<Failure>

    render(
      <TestWrapper>
        <SelectConfigureOptions {...props} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogButton = document.getElementById('configureOptions_repository')
    userEvent.click(cogButton!)
    await waitFor(() => expect(modals.length).toBe(1))
    const cogModal = modals[0] as HTMLElement

    await waitFor(() => expect(getElementByText(cogModal, 'allowedValues')).toBeInTheDocument())
    const allowedValuesRadio = getElementByText(cogModal, 'allowedValues')
    userEvent.click(allowedValuesRadio)
    const allowedValuesSelect = queryByAttribute('name', cogModal, 'allowedValues') as HTMLInputElement
    expect(allowedValuesSelect).toBeInTheDocument()
    expect(getElementByText(cogModal, 'somethingWentWrong')).toBeInTheDocument()
  })
})
