/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByTestId, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SelectOption } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfConstants from '@cf/constants'
import type { OperatorOption } from '@cf/constants'
import RuleRow, { RuleRowProps } from '../RuleRow'

const renderComponent = (props: Partial<RuleRowProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <RuleRow
        namePrefix="prefix"
        targetAttributeItems={[
          { label: 'Name', value: 'name' },
          { label: 'Identifier', value: 'identifier' }
        ]}
        onDelete={jest.fn()}
        selectedOp=""
        setFieldValue={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('RuleRow', () => {
  const useOperatorsFromYamlMock = jest.spyOn(cfConstants, 'useOperatorsFromYaml')

  beforeEach(() => {
    jest.resetAllMocks()
    useOperatorsFromYamlMock.mockReturnValue([
      [
        { label: 'op1', value: 'op1' },
        { label: 'op2', value: 'op2' }
      ],
      () => true
    ])
  })

  test('it should display a select for the target attributes', async () => {
    const targetAttributeItems: SelectOption[] = [
      { label: 'Attribute 1', value: 'attr1' },
      { label: 'Attribute 2', value: 'attr2' },
      { label: 'Attribute 3', value: 'attr3' }
    ]

    renderComponent({ targetAttributeItems })

    for (const item of targetAttributeItems) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument()
    }

    userEvent.click(screen.getByLabelText('cf.segmentDetail.attribute'))

    for (const item of targetAttributeItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    }
  })

  test('it should display a select for the operations', async () => {
    const ops: OperatorOption[] = [
      { label: 'Operator 1', value: 'op1' },
      { label: 'Operator 2', value: 'op2' },
      { label: 'Operator 3', value: 'op3' }
    ]
    useOperatorsFromYamlMock.mockReturnValue([ops, () => true])

    renderComponent()

    for (const op of ops) {
      expect(screen.queryByText(op.label)).not.toBeInTheDocument()
    }

    userEvent.click(screen.getByLabelText('cf.segmentDetail.operator'))

    for (const op of ops) {
      expect(screen.getByText(op.label)).toBeInTheDocument()
    }
  })

  test('it should display a text input for the value when no op selected', async () => {
    renderComponent()

    const ruleRow = screen.getByTestId('ruleRowFields')
    expect(getByTestId(ruleRow, 'valuesTextInput').querySelector('input')).toBeVisible()
  })

  test('it should display a text input for the value when "starts with" op selected', async () => {
    renderComponent({ selectedOp: 'starts_with' })

    const ruleRow = screen.getByTestId('ruleRowFields')
    expect(getByTestId(ruleRow, 'valuesTextInput').querySelector('input')).toBeVisible()
  })

  test('it should display a text input for the value when "ends with" op selected', async () => {
    renderComponent({ selectedOp: 'ends_with' })

    const ruleRow = screen.getByTestId('ruleRowFields')
    expect(getByTestId(ruleRow, 'valuesTextInput').querySelector('input')).toBeVisible()
  })

  test('it should display a text input for the value when "contains" op selected', async () => {
    renderComponent({ selectedOp: 'contains' })

    const ruleRow = screen.getByTestId('ruleRowFields')
    expect(getByTestId(ruleRow, 'valuesTextInput').querySelector('input')).toBeVisible()
  })

  test('it should display a text input for the value when "equals" op selected', async () => {
    renderComponent({ selectedOp: 'equals' })

    const ruleRow = screen.getByTestId('ruleRowFields')
    expect(getByTestId(ruleRow, 'valuesTextInput').querySelector('input')).toBeVisible()
  })

  test('it should display a text input for the value when "equals (sensitive)" op selected', async () => {
    renderComponent({ selectedOp: 'equals_sensitive' })

    const ruleRow = screen.getByTestId('ruleRowFields')
    expect(getByTestId(ruleRow, 'valuesTextInput').querySelector('input')).toBeVisible()
  })

  test('it should display a text input for the value when "starts with" op selected', async () => {
    renderComponent({ selectedOp: 'starts_with' })

    const ruleRow = screen.getByTestId('ruleRowFields')
    expect(getByTestId(ruleRow, 'valuesTextInput').querySelector('input')).toBeVisible()
  })

  test('it should display a tag input for the value when "in" op selected', async () => {
    renderComponent({ selectedOp: 'in' })
    expect(screen.getByTestId('valuesTagInput')).toBeVisible()
  })

  test('it should display a remove rule button', async () => {
    const onDeleteMock = jest.fn()

    renderComponent({ onDelete: onDeleteMock })

    expect(onDeleteMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'cf.segmentDetail.removeRule' }))

    await waitFor(() => {
      expect(onDeleteMock).toHaveBeenCalled()
    })
  })
})
