/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import {
  getDurationValidationSchema,
  GetDurationValidationSchemaProps
} from '@common/components/MultiTypeDuration/helper'

export const VALIDATORS = {
  [ALLOWED_VALUES_TYPE.TIME]: (props?: GetDurationValidationSchemaProps) => {
    return Yup.object().shape({
      timeout: getDurationValidationSchema(props).required()
    })
  },
  [ALLOWED_VALUES_TYPE.URL]: (getString: UseStringsReturn['getString']) => {
    return Yup.object().shape({
      url: Yup.string().url(getString('validation.urlIsNotValid'))
    })
  }
}
