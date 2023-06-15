/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect } from 'react'
import { useTelemetry } from '@common/hooks/useTelemetry'

export function useStepLoadTelemetry(eventName: string, properties: Record<string, string> = {}): void {
  const { trackEvent } = useTelemetry()
  useEffect(() => {
    trackEvent(eventName, properties)
  }, [])
}
