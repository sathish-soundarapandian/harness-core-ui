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

describe('Failure Strategy: ManualIntervention', () => {
  test('strategy works with simple fallback', async () => {
    const { container, findByTestId } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { errors: [], action: {} as any } }] }} mode={Modes.STEP} />
    )

    const queryByAttribute = (name: string, id: string): HTMLElement | null =>
      queryByAttributeGlobal(name, container, id)
    const queryFieldAndStrategy = (name: string, strategy: StrategyType): HTMLElement | null =>
      container.querySelector(`input[name="${name}"][value=${strategy}]`)

    const selection = queryFieldAndStrategy('failureStrategies[0].onFailure.action.type', Strategy.ManualIntervention)!

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    fireEvent.change(queryByAttribute('name', 'failureStrategies[0].onFailure.action.spec.timeout')!, {
      target: {
        value: '1d'
      }
    })

    const selection2 = queryFieldAndStrategy(
      'failureStrategies[0].onFailure.action.spec.onTimeout.action.type',
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
              type: ManualIntervention
              spec:
                timeout: 1d
                onTimeout:
                  action:
                    type: Abort
      "
    `)
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('"ManualIntervention" is not shown in "Retry" fallback step', async () => {
    const { container } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { errors: [], action: {} as any } }] }} mode={Modes.STEP} />
    )

    const queryFieldAndStrategy = (name: string, strategy: StrategyType): HTMLElement | null =>
      container.querySelector(`input[name="${name}"][value=${strategy}]`)

    const selection = queryFieldAndStrategy('failureStrategies[0].onFailure.action.type', Strategy.ManualIntervention)!

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const selection2 = queryFieldAndStrategy(
      'failureStrategies[0].onFailure.action.spec.onTimeout.action.type',
      Strategy.ManualIntervention
    )!

    await act(() => {
      fireEvent.click(selection2)
      return Promise.resolve()
    })

    expect(
      queryFieldAndStrategy(
        'failureStrategies[0].onFailure.action.spec.onTimeout.action.spec.onRetryFailure.action.type',
        Strategy.ManualIntervention
      )
    ).toBeNull()

    expect(queryAllByAttributeGlobal('value', container, Strategy.ManualIntervention).length).toBe(1)
  })
})
