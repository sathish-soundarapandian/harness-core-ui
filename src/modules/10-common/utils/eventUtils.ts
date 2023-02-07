/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SyntheticEvent } from 'react'

export function killEvent(e: React.MouseEvent<any> | SyntheticEvent<HTMLElement, Event> | undefined): void {
  // do not add preventDefault here, that works odd with checkbox selection
  e?.stopPropagation()
}
