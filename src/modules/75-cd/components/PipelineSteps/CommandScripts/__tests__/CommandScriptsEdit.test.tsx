/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, RenderResult, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { name, commandUnits, environmentVariables, outputVariables, timeout } from './Props'
import { CommandScriptsEdit } from '../CommandScriptsEdit'
import type { CommandScriptStepVariable, CommandUnitType } from '../CommandScriptsTypes'

describe('test <CommandScriptsEdit />', () => {
  describe('test CRUD of command units (<CommandList />)', () => {
    let renderResult: RenderResult

    beforeEach(() => {
      const ref = React.createRef<StepFormikRef<unknown>>()
      renderResult = render(
        <TestWrapper>
          <CommandScriptsEdit
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            initialValues={{
              type: StepType.Command,
              name: name,
              identifier: getIdentifierFromName(name),
              spec: {
                onDelegate: false,
                commandUnits: commandUnits as unknown as CommandUnitType[],
                environmentVariables: environmentVariables.map(variable => ({
                  ...variable,
                  id: uuid()
                })) as CommandScriptStepVariable[],
                outputVariables: outputVariables.map(variable => ({
                  ...variable,
                  id: uuid()
                })) as CommandScriptStepVariable[]
              },
              timeout
            }}
            stepViewType={StepViewType.Edit}
            readonly={false}
            ref={ref}
          />
        </TestWrapper>
      )
    })

    test('should render all commands', async () => {
      const { getByText } = renderResult

      commandUnits.forEach(commandUnit => {
        expect(getByText(commandUnit.name)).toBeVisible()
      })
    })

    test('should delete a command', async () => {
      const { queryByText, getByTestId } = renderResult
      const commandUnitIndex = 0
      const deleteButton = getByTestId(`delete-command-unit-${commandUnitIndex}`)

      expect(queryByText(commandUnits[commandUnitIndex].name)).toBeVisible()

      userEvent.click(deleteButton)

      await waitFor(() => {
        expect(queryByText(commandUnits[commandUnitIndex].name)).not.toBeInTheDocument()
      })
    })

    test('should add a command', async () => {
      const { queryByText, getByTestId, findByTestId } = renderResult
      const addButton = getByTestId('add-command-unit')

      userEvent.click(addButton)

      const commandUnitForm = await findByTestId('command-unit-form-container')

      expect(commandUnitForm).toBeInTheDocument()

      const nameInput = queryByNameAttribute('name', commandUnitForm)
      const destinationPathInput = queryByNameAttribute('spec.destinationPath', commandUnitForm)
      const newCommandName = 'copy cmd test'

      userEvent.type(nameInput!, newCommandName)
      userEvent.type(destinationPathInput!, 'test-path')

      const submitButton = await findByTestId('command-unit-form-submit')

      userEvent.click(submitButton)

      await waitFor(() => expect(queryByText(newCommandName)).toBeVisible())
    })

    test('should edit a command', async () => {
      const { queryByText, getByTestId, findByTestId } = renderResult
      const commandUnitIndex = 0
      const editButton = getByTestId(`edit-command-unit-${commandUnitIndex}`)

      userEvent.click(editButton)

      const commandUnitForm = await findByTestId('command-unit-form-container')

      expect(commandUnitForm).toBeInTheDocument()

      const nameInput = queryByNameAttribute('name', commandUnitForm)
      const updatedCommandUnitName = 'updated-cmd'

      userEvent.clear(nameInput!)
      userEvent.type(nameInput!, updatedCommandUnitName)

      const submitButton = await findByTestId('command-unit-form-submit')

      userEvent.click(submitButton)

      await waitFor(() => {
        expect(queryByText(updatedCommandUnitName)).toBeVisible()
        expect(queryByText(commandUnits[commandUnitIndex].name)).toBeNull()
      })
    })

    test('should close command unit form on clicking cancel/submit', async () => {
      const { getByTestId, findByTestId, queryByTestId } = renderResult
      const editButton = getByTestId('edit-command-unit-1')

      userEvent.click(editButton)
      expect(await findByTestId('command-unit-form-container')).toBeInTheDocument()

      userEvent.click(getByTestId('command-unit-form-cancel'))
      await waitFor(() => expect(queryByTestId('command-unit-form-container')).not.toBeInTheDocument())

      userEvent.click(editButton)
      expect(await findByTestId('command-unit-form-container')).toBeInTheDocument()

      const submitButton = await findByTestId('command-unit-form-submit')
      userEvent.click(submitButton)
      await waitFor(() => expect(queryByTestId('command-unit-form-container')).not.toBeInTheDocument())
    })
  })

  describe('test Optional Configuration', () => {
    let renderResult: RenderResult

    beforeEach(async () => {
      const ref = React.createRef<StepFormikRef<unknown>>()
      renderResult = render(
        <TestWrapper>
          <CommandScriptsEdit
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            initialValues={{
              type: StepType.Command,
              name: name,
              identifier: getIdentifierFromName(name),
              spec: {
                onDelegate: false,
                commandUnits: commandUnits as unknown as CommandUnitType[],
                environmentVariables: environmentVariables.map(variable => ({
                  ...variable,
                  id: uuid()
                })) as CommandScriptStepVariable[],
                outputVariables: outputVariables.map(variable => ({
                  ...variable,
                  id: uuid()
                })) as CommandScriptStepVariable[]
              },
              timeout
            }}
            stepViewType={StepViewType.Edit}
            readonly={false}
            ref={ref}
          />
        </TestWrapper>
      )
    })

    describe.each([
      ['environment variables', 'spec.environmentVariables', environmentVariables],
      ['output variables', 'spec.outputVariables', outputVariables]
    ])('test %s', (testName, fieldName, variables) => {
      test(`should render existing ${testName}`, async () => {
        const { getByTestId, findByTestId } = renderResult
        const optionalConfiguration = getByTestId('optional-config-summary')

        userEvent.click(optionalConfiguration)

        const formWrapper = await findByTestId(fieldName)

        expect(formWrapper).toBeVisible()

        variables.forEach((variable, index) => {
          Object.entries(variable).forEach(([key, value]) => {
            const field = queryByNameAttribute(`${fieldName}[${index}].${key}`, formWrapper)
            expect(field).toBeInTheDocument()
            expect(field).toHaveDisplayValue(value)
          })
        })
      })

      test('should remove a variable', async () => {
        const { getByTestId, findByTestId } = renderResult
        const optionalConfiguration = getByTestId('optional-config-summary')

        userEvent.click(optionalConfiguration)

        const formWrapper = await findByTestId(fieldName)
        const index = 0
        const variable = variables[index]

        expect(within(formWrapper).getByDisplayValue(variable.name)).toBeInTheDocument()

        const removeButton = getByTestId(`remove-${fieldName}-${index}`)

        userEvent.click(removeButton)

        await waitFor(() => {
          expect(within(formWrapper).queryByDisplayValue(variable.name)).not.toBeInTheDocument()
        })
      })

      test('should add a variable', async () => {
        const { getByTestId, findByTestId } = renderResult
        const optionalConfiguration = getByTestId('optional-config-summary')

        userEvent.click(optionalConfiguration)

        const formWrapper = await findByTestId(fieldName)
        const lastVariableIndex = variables.length - 1
        const addButton = getByTestId(`add-${fieldName}`)

        userEvent.click(addButton)

        await waitFor(() => {
          expect(within(formWrapper).getByTestId(`${fieldName}[${lastVariableIndex + 1}]`)).toBeInTheDocument()
        })
      })
    })

    test('should render a checkbox for onDelegate field', async () => {
      const { getByTestId, findByTestId } = renderResult
      const optionalConfiguration = getByTestId('optional-config-summary')
      userEvent.click(optionalConfiguration)

      const delegateCheckbox = await findByTestId('runOnDelegate')
      expect(delegateCheckbox).toBeInTheDocument()

      userEvent.click(delegateCheckbox)
      await waitFor(() => expect(delegateCheckbox).toBeChecked())
    })
  })

  test('interacting with <ConfigureOptions /> when timeout is runtime input', async () => {
    const { container, findByText, getByText } = render(
      <TestWrapper>
        <CommandScriptsEdit
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={{
            type: StepType.Command,
            name: name,
            identifier: getIdentifierFromName(name),
            spec: {
              onDelegate: false
            },
            timeout: RUNTIME_INPUT_VALUE
          }}
          stepViewType={StepViewType.Edit}
          readonly={false}
        />
      </TestWrapper>
    )

    expect(queryByNameAttribute('timeout', container)).toHaveDisplayValue(RUNTIME_INPUT_VALUE)

    const configureOptionsButton = queryByAttribute('id', container, 'configureOptions_step.timeout')
    expect(configureOptionsButton).toBeInTheDocument()
    userEvent.click(configureOptionsButton!)

    expect(await findByText('common.configureOptions.configureOptions')).toBeInTheDocument()

    userEvent.click(getByText('common.configureOptions.regex'))
    const regexField = queryByNameAttribute('regExValues', document.body)
    await waitFor(() => expect(regexField).toBeInTheDocument())
    const regex = '.*'
    userEvent.type(regexField!, regex)

    userEvent.click(getByText(/submit/i))

    await waitFor(() =>
      expect(queryByNameAttribute('timeout', container)).toHaveDisplayValue(`${RUNTIME_INPUT_VALUE}.regex(${regex})`)
    )
  })
})
