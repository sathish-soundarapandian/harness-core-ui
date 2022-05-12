/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { State, UnitLoadingStatus } from '../LogsState/types'

export const testReducerState: State = {
  units: [],
  logKeys: ['xyz'],
  selectedStage: '',
  selectedStep: '',
  dataMap: {
    xyz: {
      title: 'Section 1',
      data: [
        {
          text: {
            level: 'INFO',
            time: '14/04/2022 13:56:24',
            out: '\u001b[0;91m\u001b[40mFailed to complete service step\u001b[0m'
          }
        }
      ],
      isOpen: true,
      manuallyToggled: false,
      status: 'FAILED' as UnitLoadingStatus,
      unitStatus: 'FAILED' as UnitLoadingStatus,
      dataSource: 'blob'
    }
  },
  searchData: {
    text: '',
    currentIndex: 0,
    linesWithResults: []
  }
}
