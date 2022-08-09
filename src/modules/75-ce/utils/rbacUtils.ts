/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getPermissionErrorMsg = (errorMessage: string): string => {
  const colonIndex: number = errorMessage.indexOf(':')
  if (colonIndex > -1) {
    return errorMessage.slice(colonIndex + 1).trim()
  }
  return errorMessage
}
