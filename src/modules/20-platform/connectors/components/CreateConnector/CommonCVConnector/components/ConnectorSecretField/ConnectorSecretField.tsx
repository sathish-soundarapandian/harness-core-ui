/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { FormInput } from '@harness/uicore'
import SecretInput, { SecretInputProps } from '@secrets/components/SecretInput/SecretInput'
import { useToaster } from '@common/exports'
import { setSecretField } from '@secrets/utils/SecretField'
import { useStrings } from 'framework/strings'

export interface ConnectorSecretFieldProps {
  secretInputProps: SecretInputProps
  secretFieldValue?: string
  accountIdentifier: string
  projectIdentifier?: string
  orgIdentifier?: string
  onSuccessfulFetch?: (result: ReturnType<typeof setSecretField['prototype']>) => void
}

export function ConnectorSecretField(props: ConnectorSecretFieldProps): JSX.Element {
  const { secretInputProps, secretFieldValue, accountIdentifier, projectIdentifier, orgIdentifier, onSuccessfulFetch } =
    props
  const { clear, showError } = useToaster()
  const { getString } = useStrings()
  const [loadingSecrets, setLoadingSecrets] = useState(Boolean(secretFieldValue))

  useEffect(() => {
    if (!secretFieldValue) return
    setSecretField(secretFieldValue, { accountIdentifier, orgIdentifier, projectIdentifier })
      .then(result => {
        onSuccessfulFetch?.(result)
        setLoadingSecrets(false)
      })
      .catch(e => {
        clear()
        showError(e, 7000)
        setLoadingSecrets(false)
      })
  }, [secretFieldValue])

  return loadingSecrets ? (
    <FormInput.Text name={''} label={secretInputProps.label} placeholder={getString('loading')} />
  ) : (
    <SecretInput {...secretInputProps} />
  )
}
