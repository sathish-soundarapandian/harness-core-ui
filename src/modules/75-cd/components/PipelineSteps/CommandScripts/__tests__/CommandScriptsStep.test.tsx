/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { CommandScriptsStep } from '../CommandScriptsStep'
import { name, commandUnits, environmentVariables, outputVariables, timeout } from './Props'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Command Scripts step', () => {
  beforeEach(() => {
    factory.registerStep(new CommandScriptsStep())
  })

  test('Should render edit view as new step', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.Command}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, name)
    await waitFor(() => expect(nameInput).toHaveDisplayValue(name))
    expect(getByText(getIdentifierFromName(name))).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, timeout)
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue(timeout))

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'commandstep',
        name: 'command-step',
        spec: {
          environmentVariables: [],
          onDelegate: false,
          outputVariables: []
        },
        strategy: {
          repeat: { items: '<+stage.output.hosts>' }
        },
        timeout: '10s',
        type: 'Command'
      })
    )
  })

  test('Should render edit view with initial values', async () => {
    const { container, getByText, getByDisplayValue, getByTestId } = render(
      <TestStepWidget
        initialValues={{
          name,
          timeout,
          identifier: getIdentifierFromName(name),
          spec: {
            onDelegate: false,
            environmentVariables,
            commandUnits,
            outputVariables
          }
        }}
        type={StepType.Command}
        stepViewType={StepViewType.Edit}
        isNewStep={false}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    expect(nameInput).toHaveDisplayValue(name)
    getByText(getIdentifierFromName(name))

    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toHaveDisplayValue(timeout)

    commandUnits.forEach(commandUnit => {
      getByText(commandUnit.name)
    })

    const optionalConfiguration = getByTestId('optional-config-summary')
    userEvent.click(optionalConfiguration)

    await waitFor(() => {
      environmentVariables.forEach(envVar => {
        expect(getByDisplayValue(envVar.name)).toBeInTheDocument()
      })
      outputVariables.forEach(opVar => {
        expect(getByDisplayValue(opVar.name)).toBeInTheDocument()
      })
    })
  })

  test('Should render input set view', () => {
    const { container, getByTestId } = render(
      <TestStepWidget
        initialValues={{
          name,
          timeout: '',
          identifier: getIdentifierFromName(name)
        }}
        template={{
          identifier: getIdentifierFromName(name),
          type: StepType.Command,
          timeout: RUNTIME_INPUT_VALUE
        }}
        type={StepType.Command}
        stepViewType={StepViewType.InputSet}
      />
    )

    expect(queryByNameAttribute('timeout', container)).toBeVisible()
    expect(getByTestId('command-scripts-input-set-form')).toBeVisible()
  })
})
