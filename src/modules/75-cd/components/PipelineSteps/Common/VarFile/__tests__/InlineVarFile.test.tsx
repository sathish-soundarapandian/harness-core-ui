/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, getByText as getByTextBody, act, fireEvent, queryByAttribute } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import InlineVarFile from '../InlineVarFile'

jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name} />
})

describe('Inline var file testing', () => {
  test('edit view for inline vars', async () => {
    const defaultProps = {
      arrayHelpers: {
        push: jest.fn(),
        replace: jest.fn()
      },
      isEditMode: false,
      selectedVarIndex: 1,
      showTfModal: true,
      selectedVar: {
        varFile: {
          identifier: 'test',
          spec: {
            content: 'test-content'
          }
        }
      },
      onClose: jest.fn(),
      onSubmit: jest.fn(),
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.EXPRESSION,
        MultiTypeInputType.RUNTIME
      ] as AllowedTypesWithRunTime[]
    }

    const { getByText } = render(
      <TestWrapper>
        <InlineVarFile {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    const identiferInput = queryByAttribute('name', dialog, 'varFile.identifier') as HTMLInputElement
    act(() => {
      fireEvent.change(identiferInput, { target: { value: 'varFile1' } })
    })
    await waitFor(() => expect(identiferInput.value).toBe('varFile1'))
    const contentInput = queryByAttribute('name', dialog, 'varFile.spec.content') as HTMLInputElement
    expect(contentInput.value).toEqual('test-content')
    act(() => {
      fireEvent.change(contentInput, { target: { value: 'test-data-content' } })
    })
    await waitFor(() => expect(contentInput.value).toBe('test-data-content'))
    await userEvent.click(getByText('submit').parentElement!)
  })
})
