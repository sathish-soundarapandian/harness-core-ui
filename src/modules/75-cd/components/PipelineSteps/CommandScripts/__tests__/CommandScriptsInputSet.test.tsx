/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, MultiTypeInputType } from '@harness/uicore'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { CommandScriptsInputSet } from '../CommandScriptsInputSet'
import type { CommandScriptsData, CommandScriptsFormData } from '../CommandScriptsTypes'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const template: CommandScriptsData = {
  identifier: 'commandstep',
  name: 'commandstep',
  type: 'Command',
  spec: {
    onDelegate: false,
    environmentVariables: [
      {
        name: 'iv',
        type: 'String',
        value: '<+input>'
      }
    ],
    commandUnits: [
      {
        identifier: 'Copy_Cmd_Runtime',
        name: 'Copy Cmd Runtime',
        type: 'Copy',
        spec: {
          destinationPath: '<+input>',
          sourceType: 'Artifact'
        }
      },
      {
        identifier: 'Script_Cmd_Runtime',
        name: 'Script Cmd Runtime',
        type: 'Script',
        spec: {
          workingDirectory: '<+input>',
          shell: 'Bash',
          source: {
            type: 'Inline',
            spec: {
              script: '<+input>'
            }
          }
        }
      }
    ],
    outputVariables: [
      {
        name: 'ov',
        type: 'String',
        value: '<+input>'
      }
    ]
  },
  timeout: '<+input>'
}

const initialValues: CommandScriptsFormData = {
  identifier: 'commandstep',
  name: 'commandstep',
  type: 'Command',
  timeout: '',
  spec: {
    onDelegate: false,
    commandUnits: [
      {
        identifier: 'Copy_Cmd_Runtime',
        name: 'Copy Cmd Runtime',
        type: 'Copy',
        spec: {
          destinationPath: '',
          sourceType: 'Artifact'
        }
      },
      {
        identifier: 'Script_Cmd_Runtime',
        name: 'Script Cmd Runtime',
        type: 'Script',
        spec: {
          workingDirectory: '',
          shell: 'Bash',
          source: {
            type: 'Inline',
            spec: {
              script: '<+expression>'
            }
          }
        }
      }
    ],
    environmentVariables: [
      {
        name: 'iv',
        type: 'String',
        value: '',
        id: '1f964a4f-a0bc-49b5-a8f2-9d23dde58b82'
      }
    ],
    outputVariables: [
      {
        name: 'ov',
        type: 'String',
        value: '',
        id: 'b9b49383-2d63-4f58-b827-e1a96c97906d'
      }
    ]
  }
}

describe('test Command Scripts input set', () => {
  let renderResult: RenderResult

  beforeEach(() => {
    renderResult = render(
      <TestWrapper>
        <Formik initialValues={initialValues} onSubmit={jest.fn()} formName="testForm">
          <CommandScriptsInputSet
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            initialValues={initialValues}
            inputSetData={{
              template: template,
              readonly: false
            }}
            stepViewType={StepViewType.InputSet}
          />
        </Formik>
      </TestWrapper>
    )
  })

  test('should render timeout field, update timeout', async () => {
    const { getByPlaceholderText } = renderResult
    const timeoutInput = getByPlaceholderText('Enter w/d/h/m/s/ms')

    expect(timeoutInput).toBeInTheDocument()

    userEvent.type(timeoutInput, '10m')

    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('10m'))
  })

  test('should render runtime inputs in commandUnits', async () => {
    const { container, getByText } = renderResult

    template.spec.commandUnits?.forEach(commandUnit => {
      expect(getByText(commandUnit.name)).toBeInTheDocument()
    })

    expect(queryByNameAttribute('spec.commandUnits[0].spec.destinationPath', container)).toBeInTheDocument()
    expect(queryByNameAttribute('spec.commandUnits[1].spec.workingDirectory', container)).toBeInTheDocument()

    const scriptField = queryByNameAttribute('spec.commandUnits[1].spec.source.spec.script', container)
    expect(scriptField).toBeInTheDocument()
    expect(scriptField).toHaveDisplayValue('<+expression>')
  })

  describe.each([
    ['environment variables', 'spec.environmentVariables', template.spec.environmentVariables],
    ['output variables', 'spec.outputVariables', template.spec.outputVariables]
  ])('test %s', (testName, fieldName, variables) => {
    test(`should render runtime inputs in ${testName}`, () => {
      const { container } = renderResult

      variables?.forEach((variable, index) => {
        Object.entries(variable).forEach(([key, _value]) => {
          const field = queryByNameAttribute(`${fieldName}[${index}].${key}`, container)
          expect(field).toBeInTheDocument()
        })
      })
    })
  })
})
