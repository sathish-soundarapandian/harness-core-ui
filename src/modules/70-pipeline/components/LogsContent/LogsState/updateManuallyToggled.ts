/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import produce from 'immer'
import { set } from 'lodash-es'

import type { Action, ActionType, State } from './types'

export function updateManuallyToggled(state: State, action: Action<ActionType.UpdateManuallyToggled>): State {
  const { payload } = action

  return produce(state, draft => {
    set(draft.dataMap[payload], 'manuallyToggled', true)
  })
}
