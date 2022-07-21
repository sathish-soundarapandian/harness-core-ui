/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, MultiTypeInputProps, MultiTypeInputType } from '@wings-software/uicore'

export function getMultiTypeInputProps(
  expressions: string[] | undefined,
  allowableTypes: AllowedTypes
): Omit<MultiTypeInputProps, 'name'> {
  return expressions
    ? { expressions, allowableTypes }
    : {
        allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
          item => item !== MultiTypeInputType.EXPRESSION
        ) as AllowedTypes
      }
}
