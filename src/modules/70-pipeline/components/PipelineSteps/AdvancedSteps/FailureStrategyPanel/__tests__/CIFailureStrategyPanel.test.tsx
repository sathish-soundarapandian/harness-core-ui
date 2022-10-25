/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { ErrorType, Strategy } from '@pipeline/utils/FailureStrategyUtils'
import type { AbortFailureActionConfig } from 'services/pipeline-ng'
import { errorTypesForStages } from '../StrategySelection/StrategyConfig'
import { Basic } from '../FailureStrategyPanel.stories'

describe('CI <FailureStrategyPanel /> tests', () => {
  test('initial render with no data with CI domain', async () => {
    const { findByTestId } = render(
      <Basic data={{ failureStrategies: [] }} mode={Modes.STEP} stageType={StageType.BUILD} />
    )
    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()
  })

  test('adding all error types disable Add button and prevents new strategy addition', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: errorTypesForStages[StageType.BUILD],
                action: {
                  type: Strategy.Abort
                } as AbortFailureActionConfig
              }
            }
          ]
        }}
        mode={Modes.STAGE}
        stageType={StageType.BUILD}
      />
    )

    const add = await findByTestId('add-failure-strategy')

    expect(add.classList.contains('bp3-disabled')).toBe(true)
    expect(add.hasAttribute('disabled')).toBe(true)
  })

  test('in stage mode of CI, can delete first error type', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: [ErrorType.Unknown],
                action: {
                  type: Strategy.Abort
                } as AbortFailureActionConfig
              }
            }
          ]
        }}
        mode={Modes.STAGE}
        stageType={StageType.BUILD}
      />
    )

    const del = await findByTestId('remove-failure-strategy')

    expect(del.hasAttribute('disabled')).toBe(false)
  })
})
