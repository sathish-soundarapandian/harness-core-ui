/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const onChange = (index: number, length: number, callback: (index: number) => void) => {
  const maxLength = length - 1
  const canUpdate = 0 <= index && index <= maxLength
  if (canUpdate) {
    callback(index)
  }
}
