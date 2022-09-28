/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryAllByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { get, times } from 'lodash-es'

import { parse } from '@common/utils/YamlHelperMethods'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { ErrorType, Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { Basic } from '../FailureStrategyPanel.stories'

describe('<FailureStrategyPanel /> tests', () => {
  test('initial render with no data', async () => {
    const { findByTestId } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} />)
    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()
  })

  test('adding a new strategy works', async () => {
    const { container, findByTestId } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} />)

    const add = await findByTestId('add-failure-strategy')

    userEvent.click(add)

    await findByTestId('failure-strategy-step-0')

    expect(queryAllByAttribute('name', container, 'failureStrategies[0].onFailure.errors').length).toBe(2)

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()

    const code = await findByTestId('code-output')
    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors: []
            action: {}
      "
    `)

    const data = parse(code.innerHTML)
    expect(get(data, 'failureStrategies.length')).toBe(1)
  })

  test('removing a strategy works', async () => {
    const { findByTestId, getByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: [ErrorType.Authentication],
                action: { type: Strategy.Abort }
              }
            },
            {
              onFailure: {
                errors: [ErrorType.Authorization],
                action: { type: Strategy.Abort }
              }
            }
          ]
        }}
        mode={Modes.STEP}
      />
    )

    const step2 = await findByTestId('failure-strategy-step-1')

    userEvent.click(step2)

    const deleteBtn = await findByTestId('remove-failure-strategy')

    userEvent.click(deleteBtn)

    expect(() => getByTestId('failure-strategy-step-1')).toThrow()

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors:
              - Authentication
            action:
              type: Abort
      "
    `)

    const data = parse(code.innerHTML)
    expect(get(data, 'failureStrategies.length')).toBe(1)
  })

  test('error type selection does not show already selected error types', async () => {
    const { container, findByText, findByTestId } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} />)

    const getErrorTypeField = (): HTMLElement[] =>
      queryAllByAttribute('name', container, 'failureStrategies[0].onFailure.errors')!
    const menuItemSelector = '.bp3-menu-item > div'
    const authErrorTxt = 'pipeline.failureStrategies.errorTypeLabels.Authentication'

    const add = await findByTestId('add-failure-strategy')

    userEvent.click(add)

    await findByTestId('failure-strategy-step-0')

    fireEvent.change(getErrorTypeField()[0], { target: { value: 'auth' } })

    const opt1 = await findByText(authErrorTxt, { selector: menuItemSelector })

    userEvent.click(opt1)
    await act(() => {
      fireEvent.focus(getErrorTypeField()[0])
      return Promise.resolve()
    })

    await expect(() => findByText(authErrorTxt, { selector: menuItemSelector })).rejects.toThrow()

    const code = await findByTestId('code-output')

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors:
              - Authentication
            action: {}
      "
    `)
  })

  test('when AllErrors is selected, select is disabled', async () => {
    const { container, findByTestId } = render(
      <Basic
        data={{
          failureStrategies: []
        }}
        mode={Modes.STEP}
      />
    )

    const add = await findByTestId('add-failure-strategy')

    userEvent.click(add)

    await findByTestId('failure-strategy-step-0')
    const errorTypeFields = queryAllByAttribute('name', container, 'failureStrategies[0].onFailure.errors')!

    const code = await findByTestId('code-output')

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors: []
            action: {}
      "
    `)

    await act(() => {
      fireEvent.click(errorTypeFields[1], { target: { value: 'any' } })
      return Promise.resolve()
    })

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors:
              - AllErrors
            action: {}
      "
    `)

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel.querySelector('.failureSelect')).toMatchSnapshot()
  })

  test('removing error type works', async () => {
    const { container, findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: [ErrorType.Authentication, ErrorType.Authorization],
                action: { type: Strategy.Abort }
              }
            }
          ]
        }}
        mode={Modes.STEP}
      />
    )

    const code = await findByTestId('code-output')

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors:
              - Authentication
              - Authorization
            action:
              type: Abort
      "
    `)
    const removeTags = queryAllByAttribute('class', container, 'bp3-tag-remove')

    userEvent.click(removeTags[removeTags.length - 1])

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors:
              - Authentication
            action:
              type: Abort
      "
    `)

    const data = parse(code.innerHTML)
    await waitFor(() => {
      return expect(get(data, 'failureStrategies[0].onFailure.errors')).not.toContain(ErrorType.Authorization)
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('"Add" button is disabled, if the tab has errors', async () => {
    const { findByTestId, findByText } = render(<Basic data={{ failureStrategies: [{} as any] }} mode={Modes.STAGE} />)

    const tab1 = await findByTestId('failure-strategy-step-0')

    userEvent.click(tab1)

    const add = await findByTestId('add-failure-strategy')

    await findByText('pipeline.failureStrategies.validation.errorsRequired')
    await waitFor(() => expect(add.classList.contains('bp3-disabled')).toBe(true))
    expect(add.hasAttribute('disabled')).toBe(true)
  })

  test('"Add" button is disabled, when all possible errors are selected', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: Object.values(ErrorType).map(err => ({
            onFailure: { errors: [err], action: { type: Strategy.Abort } }
          }))
        }}
        mode={Modes.STAGE}
      />
    )

    const add = await findByTestId('add-failure-strategy')

    await waitFor(() => expect(add.classList.contains('bp3-disabled')).toBe(true))
    await waitFor(() => expect(add.hasAttribute('disabled')).toBe(true))
  })

  test('correct tab is opened, in error state on submit', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: [ErrorType.AllErrors],
                action: {
                  type: Strategy.Abort
                }
              }
            },
            {
              onFailure: {
                errors: [ErrorType.AllErrors]
              } as any // For testing
            },
            {
              onFailure: {
                errors: [ErrorType.AllErrors],
                action: {
                  type: Strategy.Abort
                }
              }
            }
          ]
        }}
        mode={Modes.STEP}
      />
    )

    const submit = await findByTestId('test-submit')

    userEvent.click(submit)

    const err = await findByTestId('failure-strategy-step-1')

    expect(err.dataset.selected).toBe('true')
  })

  test('on adding a new strategy, switch to latest tab', async () => {
    const NUM = 5
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: times(NUM, () => ({
            onFailure: {
              errors: [ErrorType.AllErrors],
              action: {
                type: Strategy.Abort
              }
            }
          }))
        }}
        mode={Modes.STEP}
      />
    )

    await waitFor(() => findByTestId('failure-strategy-step-0'))

    const add = await findByTestId('add-failure-strategy')

    userEvent.click(add)

    const panel = await findByTestId(`failure-strategy-step-${NUM}`)
    expect(panel.dataset.selected).toBe('true')
  })

  test('chaning strategy correctly updates YAML', async () => {
    const { container, findByTestId, findAllByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: [ErrorType.AllErrors],
                action: {
                  type: Strategy.ManualIntervention,
                  spec: {
                    timeout: '1d',
                    onTimeout: {
                      action: {
                        type: Strategy.Abort
                      }
                    }
                  }
                }
              }
            }
          ]
        }}
        mode={Modes.STEP}
      />
    )

    const queryFieldAndStrategy = (name: string, strategy: Strategy): HTMLElement | null =>
      container.querySelector(`input[name="${name}"][value=${strategy}]`)

    await waitFor(() => findByTestId('failure-strategy-step-0'))

    const code = await findByTestId('code-output')

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors:
              - AllErrors
            action:
              type: ManualIntervention
              spec:
                timeout: 1d
                onTimeout:
                  action:
                    type: Abort
      "
    `)

    const change = await findAllByTestId('thumbnail-select-change')

    userEvent.click(change[0])

    const retry = queryFieldAndStrategy('failureStrategies[0].onFailure.action.type', Strategy.Retry)!

    userEvent.click(retry)

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors:
              - AllErrors
            action:
              type: Retry
      "
    `)

    const data = parse(code.innerHTML)
    expect(get(data, 'failureStrategies[0].onFailure.action.spec')).toBeUndefined()
  })
})
