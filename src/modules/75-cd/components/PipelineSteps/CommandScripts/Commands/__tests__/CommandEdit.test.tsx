/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findPopoverContainer, queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { CommandType, CommandUnitType } from '../../CommandScriptsTypes'
import { CommandEdit } from '../CommandEdit'

jest.mock('@common/components/MonacoEditor/MonacoEditor')

const initialValues: CommandUnitType = {
  identifier: 'Copy_Cmd',
  name: 'Copy Cmd',
  type: 'Copy',
  spec: { destinationPath: 'abc', sourceType: 'Artifact' }
}

describe('test <CommandEdit />', () => {
  test('should render fields with initial values', () => {
    const { getByDisplayValue } = render(
      <TestWrapper>
        <CommandEdit
          isEdit
          initialValues={initialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onAddEditCommand={jest.fn()}
          onCancelClick={jest.fn()}
        />
      </TestWrapper>
    )

    expect(getByDisplayValue(initialValues.name)).toBeInTheDocument()
    expect(getByDisplayValue(initialValues.type)).toBeInTheDocument()
    expect(getByDisplayValue(initialValues.spec.sourceType)).toBeInTheDocument()
    expect(getByDisplayValue(initialValues.spec.destinationPath)).toBeInTheDocument()
  })

  test('should render relevant fields when command type is changed to Script', async () => {
    const { container, findByTestId } = render(
      <TestWrapper>
        <CommandEdit
          isEdit
          initialValues={initialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onAddEditCommand={jest.fn()}
          onCancelClick={jest.fn()}
        />
      </TestWrapper>
    )

    userEvent.click(queryByNameAttribute('type', container)!)
    userEvent.click(within(findPopoverContainer()!).getByText(CommandType.Script))

    expect(await findByTestId('tail-files-edit')).toBeInTheDocument()
    expect(queryByNameAttribute('spec.workingDirectory', container)).toBeInTheDocument()
    expect(queryByNameAttribute('spec.shell', container)).toBeInTheDocument()
    expect(queryByNameAttribute('spec.source.spec.script', container)).toBeInTheDocument()
  })
})
