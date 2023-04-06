/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'

import { FormInput, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import {
  getAzureEnvironmentOptions,
  getAzureManagedIdentityOptions,
  AzureManagedIdentityTypes
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { AzureKeyVaultFormData } from './AzureKeyVaultForm'

export interface Props {
  formikProps: FormikProps<AzureKeyVaultFormData>
}

const AzureKeyVaultFormFieldsForDelegateInCluster: React.FC<Props> = props => {
  const { formikProps } = props
  const { getString } = useStrings()
  const environmentOptions = getAzureEnvironmentOptions(getString)
  const managedIdentityOptions = getAzureManagedIdentityOptions(getString)

  const clientIdString = getString('connectors.azure.clientId')

  const resetManagedIdenity = (formik: FormikProps<ConnectorConfigDTO>, value: string): void => {
    if (value === AzureManagedIdentityTypes.SYSTEM_MANAGED) {
      formik.setFieldValue('clientId', '')
    }
  }

  return (
    <Layout.Vertical>
      <FormInput.Text name="subscription" label={getString('connectors.azureKeyVault.labels.subscription')} />
      <FormInput.Select name="azureEnvironmentType" label={getString('environment')} items={environmentOptions} />
      <FormInput.Select
        label={getString('authentication')}
        name="managedIdentity"
        items={managedIdentityOptions}
        disabled={false}
        onChange={({ value }) => resetManagedIdenity(formikProps, value as string)}
      />
      {formikProps.values.managedIdentity === AzureManagedIdentityTypes.USER_MANAGED && (
        <FormInput.Text name={'clientId'} placeholder={clientIdString} label={clientIdString} />
      )}
    </Layout.Vertical>
  )
}

export default AzureKeyVaultFormFieldsForDelegateInCluster
