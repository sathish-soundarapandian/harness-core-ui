/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

const AzureKeyVaultFormFields: React.FC = () => {
  const { getString } = useStrings()

  return (
    <>
      <FormInput.Text name="connectionString" label={getString('connectors.azureBlob.labels.connectionString')} />
      <FormInput.Text name="containerName" label={getString('connectors.azureBlob.labels.containerName')} />
      <FormInput.Text name="clientId" label={getString('common.clientId')} />
      <FormInput.Text name="tenantId" label={getString('connectors.azureKeyVault.labels.tenantId')} />
      <FormInput.Text name="subscription" label={getString('connectors.azureKeyVault.labels.subscription')} />
      <SecretInput name="secretKey" label={getString('keyLabel')} connectorTypeContext={'AzureKeyVault'} />

      <FormInput.CheckBox
        name="default"
        label={getString('connectors.hashiCorpVault.defaultVault')}
        padding={{ left: 'xxlarge' }}
      />
    </>
  )
}

export default AzureKeyVaultFormFields
