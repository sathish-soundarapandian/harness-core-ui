/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NGTemplateInfoConfig } from 'services/template-ng'

export const DefaultNewTemplateId = '-1'
export const DefaultNewVersionLabel = '-1'

export const DefaultTemplate: NGTemplateInfoConfig = {
  name: '',
  identifier: DefaultNewTemplateId,
  versionLabel: DefaultNewVersionLabel,
  type: 'Step'
}

export const ICON_FILE_MAX_SIZE_IN_KB = 30
export const ICON_FILE_MAX_SIZE = ICON_FILE_MAX_SIZE_IN_KB * 1024
export const ICON_FILE_SUPPORTED_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml']
export const ICON_FILE_MAX_DIMENSION = 32
