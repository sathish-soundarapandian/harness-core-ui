import React from 'react'
import { render, queryByAttribute, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { stringify } from '@common/utils/YamlHelperMethods'

import { TestWrapper } from '@common/utils/testUtils'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
// eslint-disable-next-line no-restricted-imports
import { ShellScriptStep } from '@cd/components/PipelineSteps/ShellScriptStep/ShellScriptStep'
import { useSubmitExecutionInput, useGetExecutionInputTemplate, useHandleInterrupt } from 'services/pipeline-ng'

import { ExecutionInputs } from '../ExecutionInputs'

jest.mock('services/pipeline-ng', () => ({
  useGetExecutionInputTemplate: jest.fn().mockReturnValue({
    data: {}
  }),
  useHandleInterrupt: jest.fn().mockReturnValue({}),
  useSubmitExecutionInput: jest.fn().mockReturnValue({})
}))

factory.registerStep(new ShellScriptStep())

describe('<ExecutionInputs /> tests', () => {
  describe('stage inputs', () => {
    test('submit works', async () => {
      const mutate = jest.fn()
      ;(useSubmitExecutionInput as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "<+input>.executionInput()"\n'
          }
        }
      })
      const { container, findByTestId } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'APPROVAL_STAGE' }} factory={factory} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()

      const input = queryByAttribute('name', container, 'stage.variables[0].value')!
      userEvent.type(input, 'Hello')

      const submit = await findByTestId('submit')

      userEvent.click(submit)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith(
          stringify({
            stage: {
              identifier: 'app',
              type: 'Approval',
              variables: [{ name: 'test', type: 'String', value: 'Hello' }]
            }
          })
        )
      })
    })

    test('completed', async () => {
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "<+input>.executionInput()"\n',
            userInput:
              'stage:\n  identifier: "app"\n  type: "Approval"\n  variables:\n  - name: "test"\n    type: "String"\n    value: "Hello"\n'
          }
        }
      })
      const { container } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'ShellScript', status: 'Success' }} factory={factory} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('loading', async () => {
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: null,
        loading: true
      })
      const { container } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'ShellScript', status: 'Success' }} factory={factory} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('step inputs', () => {
    test('submit works', async () => {
      const mutate = jest.fn()
      ;(useSubmitExecutionInput as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "<+input>.executionInput()"\n'
          }
        }
      })
      const { container, findByTestId } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'ShellScript' }} factory={factory} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()

      const input = queryByAttribute('name', container, 'timeout')!
      userEvent.type(input, '1m')

      const submit = await findByTestId('submit')

      userEvent.click(submit)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith(
          stringify({
            step: {
              identifier: 'hello',
              type: 'ShellScript',
              timeout: '1m'
            }
          })
        )
      })
    })

    test('completed', async () => {
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "<+input>.executionInput()"\n',
            userInput: 'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "1m"\n'
          }
        }
      })
      const { container } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'ShellScript', status: 'Success' }} factory={factory} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('abort works', async () => {
      const mutate = jest.fn()
      ;(useHandleInterrupt as jest.Mock).mockReturnValue({
        mutate
      })
      ;(useGetExecutionInputTemplate as jest.Mock).mockReturnValue({
        data: {
          data: {
            inputTemplate:
              'step:\n  identifier: "hello"\n  type: "ShellScript"\n  timeout: "<+input>.executionInput()"\n'
          }
        }
      })
      const { findByTestId, findByText } = render(
        <TestWrapper>
          <ExecutionInputs step={{ stepType: 'ShellScript' }} />
        </TestWrapper>
      )

      const submit = await findByTestId('abort')

      userEvent.click(submit)

      const confirm = await findByText('confirm')

      userEvent.click(confirm)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalledWith({})
      })
    })
  })
})
