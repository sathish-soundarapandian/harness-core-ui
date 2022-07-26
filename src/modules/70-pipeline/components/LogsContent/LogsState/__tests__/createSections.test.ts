/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createSections } from '../createSections'
import { ActionType } from '../types'
import { getDefaultReducerState } from '../utils'

describe('createSections tests', () => {
  test('handles no node', () => {
    const selectedStep = 'SELECTED_STEP'
    const selectedStage = 'SELECTED_STAGE'
    const init = getDefaultReducerState()
    const data = createSections(init, {
      type: ActionType.CreateSections,
      payload: { selectedStep, selectedStage, getSectionName: jest.fn() }
    })

    expect(data).toEqual(expect.objectContaining({ selectedStep, selectedStage }))
  })
})
