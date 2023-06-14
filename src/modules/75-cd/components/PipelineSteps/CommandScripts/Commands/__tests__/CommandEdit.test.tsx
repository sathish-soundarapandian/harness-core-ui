/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { queryByAttribute, render, waitFor, within } from '@testing-library/react'
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

  test('can change source type from Artifact to Config', async () => {
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

    const artifactRadio = getByDisplayValue(/artifact/i)
    expect(artifactRadio).toBeChecked()

    const configRadio = getByDisplayValue(/config/i)
    expect(configRadio).not.toBeChecked()

    await userEvent.click(configRadio)
    await waitFor(() => expect(configRadio).toBeChecked())
  })

  test('should render relevant fields when command type is changed to Script', async () => {
    const { container, findByTestId, queryByText, getByText } = render(
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

    await userEvent.click(queryByNameAttribute('type', container)!)
    await userEvent.click(within(findPopoverContainer()!).getByText(CommandType.Script))
    await userEvent.click(getByText('cd.steps.commands.locationFileStore'))

    expect(await findByTestId('tail-files-edit')).toBeInTheDocument()
    expect(queryByNameAttribute('spec.workingDirectory', container)).toBeInTheDocument()
    expect(queryByNameAttribute('spec.shell', container)).toBeInTheDocument()
    expect(queryByText('common.git.filePath')).toBeInTheDocument()
  })

  test('can select Script Type when command type is script', async () => {
    const { container, findByDisplayValue } = render(
      <TestWrapper>
        <CommandEdit
          isEdit
          initialValues={{
            identifier: 'script_command',
            name: 'script command',
            type: 'Script',
            spec: {
              workingDirectory: 'working-dir',
              shell: 'Bash',
              source: {
                type: 'Inline',
                spec: {
                  script: 'echo "script"'
                }
              }
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onAddEditCommand={jest.fn()}
          onCancelClick={jest.fn()}
        />
      </TestWrapper>
    )
    const scriptTypeField = queryByNameAttribute('spec.shell', container)!

    await userEvent.click(scriptTypeField)
    await userEvent.click(within(findPopoverContainer()!).getByText(/bash/i))

    expect(await findByDisplayValue(/bash/i)).toBeInTheDocument()
  })

  test('renders a field for selecting file store path', async () => {
    const { getByText } = render(
      <TestWrapper>
        <CommandEdit
          isEdit
          initialValues={{
            identifier: 'script_command',
            name: 'script command',
            type: 'Script',
            spec: {
              workingDirectory: 'working-dir',
              shell: 'Bash',
              source: {
                type: 'Inline',
                spec: {
                  script: '<+expression>'
                }
              }
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onAddEditCommand={jest.fn()}
          onCancelClick={jest.fn()}
        />
      </TestWrapper>
    )
    await userEvent.click(getByText('cd.steps.commands.locationFileStore'))
    const fileStoreField = getByText('common.git.filePath')

    expect(fileStoreField).toBeInTheDocument()
  })

  test('can use <ConfigureOptions /> when script is a runtime input', async () => {
    const { container, findByText, getByText } = render(
      <TestWrapper>
        <CommandEdit
          isEdit
          initialValues={{
            identifier: 'script_command',
            name: 'script command',
            type: 'Script',
            spec: {
              workingDirectory: 'working-dir',
              shell: 'Bash',
              source: {
                type: 'Inline',
                spec: {
                  script: RUNTIME_INPUT_VALUE
                }
              }
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onAddEditCommand={jest.fn()}
          onCancelClick={jest.fn()}
        />
      </TestWrapper>
    )
    await userEvent.click(getByText('inline'))
    expect(queryByNameAttribute('spec.source.spec.script', container)).toHaveDisplayValue(RUNTIME_INPUT_VALUE)

    const configureOptionsButton = queryByAttribute('id', container, 'configureOptions_spec.source.spec.script')
    expect(configureOptionsButton).toBeInTheDocument()
    await userEvent.click(configureOptionsButton!)

    expect(await findByText('common.configureOptions.configureOptions')).toBeInTheDocument()

    await userEvent.click(getByText('common.configureOptions.regex'))
    const regexField = queryByNameAttribute('regExValues', document.body)
    await waitFor(() => expect(regexField).toBeInTheDocument())
    const regex = '.*'
    await userEvent.type(regexField!, regex)
    await userEvent.click(getByText(/submit/i))

    await waitFor(() =>
      expect(queryByNameAttribute('spec.source.spec.script', container)).toHaveDisplayValue(
        `${RUNTIME_INPUT_VALUE}.regex(${regex})`
      )
    )
  })
})
