/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { HTTPRequestMethod } from './HTTPRequestMethod.types'
import { CustomHealthValidationPathFieldNames } from '../../CustomHealthValidationPath.constants'

export const HTTPRequestMethodOption = ({
  value,
  onChange
}: {
  value?: string
  onChange?: (val: HTTPRequestMethod) => void
}) => {
  const { getString } = useStrings()
  return (
    <FormInput.RadioGroup
      key={value}
      radioGroup={{ inline: true }}
      label={getString('connectors.requestMethod')}
      name={CustomHealthValidationPathFieldNames.REQUEST_METHOD}
      onChange={e => onChange?.(e.currentTarget.value as HTTPRequestMethod)}
      items={[
        {
          label: HTTPRequestMethod.GET,
          value: HTTPRequestMethod.GET
        },
        {
          label: HTTPRequestMethod.POST,
          value: HTTPRequestMethod.POST
        }
      ]}
    />
  )
}
