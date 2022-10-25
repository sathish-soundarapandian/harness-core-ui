/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption, MultiSelectOption } from '@harness/uicore'

export const createKeyProp = (item?: string | SelectOption | MultiSelectOption[]): string =>
  `${Array.isArray(item) ? (item?.[0]?.value as string) : typeof item === 'string' ? item : (item?.value as string)}`
