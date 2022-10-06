/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, waitFor, getByText as getByTextBody } from '@testing-library/react'

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import InlineVarFile from '../Editview/InlineVarFile'

const props = {
  arrayHelpers: {
    push: jest.fn(),
    replace: jest.fn()
  },
  isEditMode: false,
  selectedVarIndex: -1,
  showTfModal: true,
  selectedVar: {},
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.RUNTIME
  ] as AllowedTypesWithRunTime[]
}

jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
})

describe('Inline var file testing', () => {
  test('initial render', async () => {
    render(
      <TestWrapper>
        <InlineVarFile {...props} />
      </TestWrapper>
    )
    const dialog = findDialogContainer() as HTMLElement

    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    expect(dialog).toMatchSnapshot()
  })

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
    render(
      <TestWrapper>
        <InlineVarFile {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    expect(dialog).toMatchSnapshot()
  })

  test('click submit for inline var file', async () => {
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
    render(
      <TestWrapper>
        <InlineVarFile {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    expect(dialog).toMatchSnapshot()
  })

  test('when content is runtime input', async () => {
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
          identifer: 'test',
          spec: {
            content: '<+input>'
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
    render(
      <TestWrapper>
        <InlineVarFile {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Add Inline Terraform Var File'))
    expect(dialog).toMatchSnapshot()
  })
})
