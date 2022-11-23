/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { FormInput, Text, ModalErrorHandlerBinding, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { AwsSecretManagerConfigFormData, CredTypeValues } from '@connectors/interfaces/ConnectorInterface'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { Connectors } from '@connectors/constants'

interface AwsSecretManagerAccessKeyFormProps {
  formik: FormikProps<AwsSecretManagerConfigFormData>
  accountId: string
  modalErrorHandler?: ModalErrorHandlerBinding
}

const AwsSecretManagerAccessKeyForm: React.FC<AwsSecretManagerAccessKeyFormProps> = ({
  formik,
  accountId,
  modalErrorHandler
}) => {
  const { getString } = useStrings()

  const {
    data: regionData,
    loading,
    error
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  if (error) {
    modalErrorHandler?.showDanger(error.message)
  }

  const regionValues =
    regionData?.resource?.map(region => ({
      value: region.value,
      label: region.name || ''
    })) || []

  return (
    <>
      <Text
        font={{ variation: FontVariation.LEAD }}
        style={{ marginBottom: 'var(--spacing-medium)', marginTop: 'var(--spacing-7)' }}
        color={Color.BLACK}
      >
        {getString('authentication')}
      </Text>
      {formik.values?.credType === CredTypeValues.ManualConfig && (
        <>
          <SecretInput
            name="accessKey"
            label={getString('connectors.awsKms.accessKeyLabel')}
            connectorTypeContext={Connectors.AWS_SECRET_MANAGER}
          />
          <SecretInput
            name="secretKey"
            label={getString('connectors.awsKms.secretKeyLabel')}
            connectorTypeContext={Connectors.AWS_SECRET_MANAGER}
          />
        </>
      )}
      <FormInput.Text name="secretNamePrefix" label={getString('connectors.awsSecretManager.secretNamePrefix')} />
      {loading ? (
        <Icon margin="medium" name="spinner" size={15} color={Color.BLUE_500} />
      ) : (
        <FormInput.Select name="region" items={regionValues} label={getString('regionLabel')} />
      )}
    </>
  )
}

export default AwsSecretManagerAccessKeyForm
