/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import { Form, Formik } from 'formik'
import { FormInput } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import usePercentageRolloutEqualiser from '../usePercentageRolloutEqualiser'

interface TestFormProps {
  numberOfVariations: number
  active: boolean
}
const TestForm: FC<TestFormProps> = ({ numberOfVariations, active }) => {
  const variationWeightIds = useMemo<string[]>(
    () =>
      Array(numberOfVariations)
        .fill(0)
        .map((_, index) => `variations[${index}].weight`),
    [numberOfVariations]
  )

  usePercentageRolloutEqualiser(variationWeightIds, active)

  return (
    <>
      {variationWeightIds.map(id => (
        <FormInput.Text name={id} key={id} />
      ))}
    </>
  )
}

const renderComponent = (props: Partial<TestFormProps> = {}, initialValues: any = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        <Form>
          <TestForm numberOfVariations={2} active={true} {...props} />
        </Form>
      </Formik>
    </TestWrapper>
  )

const getTotal = (inputs: HTMLElement[]): number =>
  inputs.reduce((total, valueEl) => total + parseInt((valueEl as HTMLInputElement).value), 0)

describe('usePercentageRolloutEqualiser', () => {
  test('it should not equalise inputs when there are more than 2', async () => {
    const numberOfVariations = 3
    renderComponent({ numberOfVariations })

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(numberOfVariations)

    for (const input of inputs) {
      expect(input).toHaveValue('')
      await userEvent.type(input, '10', { allAtOnce: true })
    }

    await waitFor(() => expect(getTotal(inputs)).toBe(30))
  })

  test('it should start with 50:50 are 2 variations and no initial values', async () => {
    renderComponent({ numberOfVariations: 2 })

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)

    expect(inputs[0]).toHaveValue('50')
    expect(inputs[1]).toHaveValue('50')

    await waitFor(() => expect(getTotal(inputs)).toBe(100))
  })

  test('it should equalise when there are 2 variations', async () => {
    renderComponent({ numberOfVariations: 2 }, { variations: [{ weight: 30 }, { weight: 30 }] })

    const inputs = screen.getAllByRole('textbox')

    expect(inputs[0]).toHaveValue('30')
    expect(inputs[1]).toHaveValue('70')

    await waitFor(() => expect(getTotal(inputs)).toBe(100))
  })

  test('it should equalise when there are 2 variations and the 1st changes', async () => {
    renderComponent({ numberOfVariations: 2 })

    const inputs = screen.getAllByRole('textbox')

    expect(inputs[0]).toHaveValue('50')
    expect(inputs[1]).toHaveValue('50')

    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '70')

    await waitFor(() => expect(inputs[1]).toHaveValue('30'))

    await waitFor(() => expect(getTotal(inputs)).toBe(100))
  })

  test('it should equalise when there are 2 variations and the 2nd changes', async () => {
    renderComponent({ numberOfVariations: 2 })

    const inputs = screen.getAllByRole('textbox')

    expect(inputs[0]).toHaveValue('50')
    expect(inputs[1]).toHaveValue('50')

    await userEvent.clear(inputs[1])
    await userEvent.type(inputs[1], '70')

    await waitFor(() => expect(inputs[0]).toHaveValue('30'))

    await waitFor(() => expect(getTotal(inputs)).toBe(100))
  })
})
