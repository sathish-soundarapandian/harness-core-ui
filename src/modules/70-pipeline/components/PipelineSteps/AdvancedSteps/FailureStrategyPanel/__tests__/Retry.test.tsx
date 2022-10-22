/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  fireEvent,
  act,
  queryByAttribute as queryByAttributeGlobal,
  queryAllByAttribute as queryAllByAttributeGlobal
} from '@testing-library/react'

import { Strategy, StrategyType } from '@pipeline/utils/FailureStrategyUtils'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { Basic } from '../FailureStrategyPanel.stories'

describe('Failure Strategy: Retry', () => {
  test('strategy works with simple fallback', async () => {
    const { container, findByTestId } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { errors: [], action: {} as any } }] }} mode={Modes.STEP} />
    )

    const queryByAttribute = (name: string, id: string): HTMLElement | null =>
      queryByAttributeGlobal(name, container, id)
    const queryFieldAndStrategy = (name: string, strategy: StrategyType): HTMLElement | null =>
      container.querySelector(`input[name="${name}"][value=${strategy}]`)

    const selection = queryFieldAndStrategy('failureStrategies[0].onFailure.action.type', Strategy.Retry)!

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    act(() => {
      fireEvent.change(queryByAttribute('name', 'failureStrategies[0].onFailure.action.spec.retryCount')!, {
        target: {
          value: '3'
        }
      })
    })

    const addRetryInterval1 = await findByTestId('add-retry-interval')

    act(() => {
      fireEvent.click(addRetryInterval1)
    })

    const addRetryInterval2 = await findByTestId('add-retry-interval')
    act(() => {
      fireEvent.click(addRetryInterval2)
    })

    act(() => {
      fireEvent.change(queryByAttribute('name', 'failureStrategies[0].onFailure.action.spec.retryIntervals[0]')!, {
        target: {
          value: '1m'
        }
      })
    })

    const removeRetryInterval = await findByTestId('remove-retry-interval-1')

    act(() => {
      fireEvent.click(removeRetryInterval)
    })

    const selection2 = queryFieldAndStrategy(
      'failureStrategies[0].onFailure.action.spec.onRetryFailure.action.type',
      Strategy.Abort
    )!

    fireEvent.click(selection2)

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code.innerHTML).toMatchInlineSnapshot(`
      "failureStrategies:
        - onFailure:
            errors: []
            action:
              type: Retry
              spec:
                retryCount: 3
                retryIntervals:
                  - 1m
                onRetryFailure:
                  action:
                    type: Abort
      "
    `)
  })

  test('"Retry" is not shown in "ManualIntervention" fallback step', async () => {
    const { container } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { errors: [], action: {} as any } }] }} mode={Modes.STEP} />
    )

    const queryFieldAndStrategy = (name: string, strategy: StrategyType): HTMLElement | null =>
      container.querySelector(`input[name="${name}"][value=${strategy}]`)

    const selection = queryFieldAndStrategy('failureStrategies[0].onFailure.action.type', Strategy.Retry)!

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const selection2 = queryFieldAndStrategy(
      'failureStrategies[0].onFailure.action.spec.onRetryFailure.action.type',
      Strategy.ManualIntervention
    )!

    await act(() => {
      fireEvent.click(selection2)
      return Promise.resolve()
    })

    expect(
      queryFieldAndStrategy(
        'failureStrategies[0].onFailure.action.spec.onRetryFailure.action.spec.onTimeout.action.type',
        Strategy.Retry
      )
    ).toBeNull()

    expect(queryAllByAttributeGlobal('value', container, Strategy.Retry).length).toBe(1)
  })
})
