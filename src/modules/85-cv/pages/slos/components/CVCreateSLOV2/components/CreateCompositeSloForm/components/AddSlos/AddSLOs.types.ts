/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SLOObjective } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'

export interface GetDistributionUpdatedProps {
  weight: number
  currentIndex: number
  sloList: SLOObjective[]
  manuallyUpdatedSlos: number[]
  isReset?: boolean
}

export interface UpdateWeightPercentageForCurrentSLOProps {
  weight: number
  index: number
  sloList: SLOObjective[]
  isReset?: boolean
}
