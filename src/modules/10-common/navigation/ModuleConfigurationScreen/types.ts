/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'

export interface Carousel {
  primaryText?: string
  secondoryText?: string
  imageUrl: string
}

export interface ModuleDetails {
  title: string
  carousel?: Carousel[]
}

export interface ModuleInfo {
  label: string
  icon: IconName
  details: ModuleDetails
}
