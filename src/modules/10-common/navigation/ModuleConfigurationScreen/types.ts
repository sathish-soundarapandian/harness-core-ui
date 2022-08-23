/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Entry } from 'contentful'
import type { IconName } from '@harness/icons'
import type { ModuleName } from 'framework/types/ModuleName'

export interface LottieContent {
  data: Record<any, any>
}

export interface CenterAlignedImageDesc {
  primaryText?: string
  secondoryText?: string
  imageUrl: string
}

export interface ModuleInfo {
  label: string
  icon: IconName
}

export interface ContentfulModuleResponse {
  identifier: ModuleName
  label: string
  data: Entry<CenterAlignedImageDesc | LottieContent>[]
}
