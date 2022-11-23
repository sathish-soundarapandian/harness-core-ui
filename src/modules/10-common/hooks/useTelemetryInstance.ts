/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import Telemetry from '@harness/telemetry'

const stubTelemetry = {
  identify: () => void 0,
  track: () => void 0,
  page: () => void 0,
  initialized: true
}

interface TelemetryStub {
  identify: () => void
  track: () => void
  page: () => void
  initialized: boolean
}

const telemetry = new Telemetry(window.segmentToken || 'exa6lo7CnJXqKnR83itMpHYLY5fiajft')

export function useTelemetryInstance(): TelemetryStub | Telemetry {
  const isStub = window.deploymentType === 'ON_PREM' || __DEV__
  return isStub ? stubTelemetry : telemetry
}
