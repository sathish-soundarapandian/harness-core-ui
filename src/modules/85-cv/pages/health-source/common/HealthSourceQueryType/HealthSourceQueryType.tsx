/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { generateQueryTypeRadioButtonOptions } from './HealthSourceQueryType.utils'
import type { HealthSourceQueryTypeProps, QueryType } from './HealthSourceQueryType.types'

export const HealthSourceQueryType = (props: HealthSourceQueryTypeProps): JSX.Element => {
  const { onChange, value } = props
  const { getString } = useStrings()
  return (
    <FormInput.RadioGroup
      key={value}
      label={getString('cv.componentValidations.queryTypeLabel' as keyof StringsMap)}
      radioGroup={{ inline: true }}
      name="queryType"
      onChange={val => {
        onChange?.(val.currentTarget.value as QueryType)
      }}
      items={generateQueryTypeRadioButtonOptions(getString)}
    />
  )
}
