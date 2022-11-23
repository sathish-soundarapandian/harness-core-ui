/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const rafThrottle = <T extends (...args: any[]) => void>(
  fn: T
): { (...args: Parameters<T>): void; cancel: () => void } => {
  let lastArgs: Parameters<T>
  let frameId: number | null = null

  const wrapperFn = (...args: Parameters<T>): void => {
    lastArgs = args

    if (frameId) {
      return
    }

    frameId = requestAnimationFrame(() => {
      frameId = null
      fn(...lastArgs)
    })
  }

  wrapperFn.cancel = () => {
    if (!frameId) {
      return
    }

    cancelAnimationFrame(frameId)
    frameId = null
  }

  return wrapperFn
}
