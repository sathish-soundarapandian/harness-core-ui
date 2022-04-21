/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  StepProps,
  Container,
  Text,
  Formik,
  FormikForm,
  Layout,
  Button,
  FontVariation,
  ButtonVariation
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AzureBlobConnectorDTO } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import { setupAzureBlobFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { StepDetailsProps, ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import AzureBlobFormFields from './AzureBlobFormFields'
import css from '../CreateAzureBlobConnector.module.scss'

export interface AzureBlobFormData {
  clientId?: string
  secretKey?: SecretReference
  tenantId?: string
  containerURL?: string
  default?: boolean
}

const AzureBlobForm: React.FC<StepProps<StepDetailsProps> & ConnectorDetailsProps> = props => {
  const { prevStepData, previousStep, isEditMode, nextStep, connectorInfo, accountId } = props
  const { getString } = useStrings()

  const defaultInitialFormData: AzureBlobFormData = {
    clientId: undefined,
    tenantId: undefined,
    containerURL: undefined,
    secretKey: undefined,
    default: false
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)

  React.useEffect(() => {
    if (isEditMode && connectorInfo) {
      setupAzureBlobFormData(connectorInfo, accountId).then(data => {
        setInitialValues(data as AzureBlobFormData)
        setLoadingFormData(false)
      })
    }
  }, [isEditMode, connectorInfo])

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      <Formik<AzureBlobFormData>
        formName="azureBlobForm"
        enableReinitialize
        initialValues={{ ...initialValues, ...prevStepData }}
        validationSchema={Yup.object().shape({
          containerURL: Yup.string().required(getString('connectors.azureBlob.validation.containerURLIsRequired')),
          clientId: Yup.string().required(getString('common.validation.clientIdIsRequired')),
          tenantId: Yup.string().required(getString('connectors.azureKeyVault.validation.tenantId')),
          secretKey: Yup.string().trim().required(getString('common.validation.keyIsRequired'))
        })}
        onSubmit={formData => {
          nextStep?.({ ...connectorInfo, ...prevStepData, ...formData } as StepDetailsProps)
        }}
      >
        <FormikForm>
          <Container className={css.formHeight} margin={{ top: 'medium', bottom: 'xxlarge' }}>
            <AzureBlobFormFields />
          </Container>
          <Layout.Horizontal spacing="medium">
            <Button
              variation={ButtonVariation.SECONDARY}
              icon="chevron-left"
              text={getString('back')}
              onClick={() => previousStep?.(prevStepData)}
            />
            <Button
              type="submit"
              intent="primary"
              rightIcon="chevron-right"
              text={getString('continue')}
              disabled={loadingFormData}
            />
          </Layout.Horizontal>
        </FormikForm>
      </Formik>
      {loadingFormData ? <PageSpinner /> : null}
    </Container>
  )
}

export default AzureBlobForm
