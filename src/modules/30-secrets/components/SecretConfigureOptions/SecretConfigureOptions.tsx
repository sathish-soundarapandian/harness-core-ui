/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FC } from 'react';
import React from 'react'
import type { ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions';
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import type { SecretInputProps } from '../SecretInput/SecretInput';
import SecretInput from '../SecretInput/SecretInput'

export interface SecretConfigureOptionsProps extends ConfigureOptionsProps {
  secretInputProps?: Omit<SecretInputProps, 'name' | 'isMultiSelect' | 'placeholder'>
}

export const SecretConfigureOptions: FC<SecretConfigureOptionsProps> = props => {
  const { secretInputProps = {}, ...configureOptionsProps } = props
  const { getString } = useStrings()

  const renderSecretInput: ConfigureOptionsProps['getAllowedValuesCustomComponent'] = () => {
    return (
      <SecretInput
        {...secretInputProps}
        name="allowedValues"
        placeholder={getString('secrets.selectSecrets')}
        isMultiSelect
      />
    )
  }

  return <ConfigureOptions {...configureOptionsProps} getAllowedValuesCustomComponent={renderSecretInput} />
}
