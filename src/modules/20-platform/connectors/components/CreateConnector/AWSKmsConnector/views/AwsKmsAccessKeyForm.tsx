/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { FormInput, Text, SelectOption, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { useToaster } from '@common/exports'
import { AwsKmsConfigFormData, CredTypeValues } from '@connectors/interfaces/ConnectorInterface'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

interface AwsKmsAccessKeyFormProps {
  formik: FormikProps<AwsKmsConfigFormData>
  accountId: string
}

const AwsKmsAccessKeyForm: React.FC<AwsKmsAccessKeyFormProps> = ({ formik, accountId }) => {
  const { getString } = useStrings()

  const [regions, setRegions] = React.useState<SelectOption[]>([])

  const { showError } = useToaster()
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
    showError(error.message)
  }
  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

  return (
    <>
      <Text font={{ variation: FontVariation.LEAD }} margin={{ bottom: 'medium', top: 'xlarge' }} color={Color.BLACK}>
        {getString('authentication')}
      </Text>
      {formik.values?.credType === CredTypeValues.ManualConfig && (
        <>
          <SecretInput
            name="accessKey"
            label={getString('connectors.awsKms.accessKeyLabel')}
            connectorTypeContext={'AwsKms'}
          />
          <SecretInput
            name="secretKey"
            label={getString('connectors.awsKms.secretKeyLabel')}
            connectorTypeContext={'AwsKms'}
          />
        </>
      )}
      <SecretInput name="awsArn" label={getString('connectors.awsKms.arnLabel')} connectorTypeContext={'AwsKms'} />
      {loading ? (
        <Icon margin="medium" name="spinner" size={15} color={Color.BLUE_500} />
      ) : (
        <FormInput.Select name="region" items={regions} label={getString('regionLabel')} />
      )}
    </>
  )
}

export default AwsKmsAccessKeyForm
