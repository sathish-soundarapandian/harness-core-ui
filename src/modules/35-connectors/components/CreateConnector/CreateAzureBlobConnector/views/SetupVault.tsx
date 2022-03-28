/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import {
  Container,
  Text,
  Formik,
  FormikForm,
  Layout,
  FormInput,
  Button,
  StepProps,
  SelectOption,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  FontVariation,
  ButtonVariation,
  shouldShowError
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import {
  ConnectorConfigDTO,
  useGetMetadata,
  AzureBlobMetadataRequestSpecDTO,
  AzureBlobMetadataSpecDTO,
  useCreateConnector,
  useUpdateConnector,
  ConnectorRequestBody
} from 'services/cd-ng'
import type { StepDetailsProps, ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import { PageSpinner } from '@common/components'
import {
  buildAzureBlobPayload,
  setupAzureKeyVaultNameFormData
} from '@connectors/pages/connectors/utils/ConnectorUtils'

export interface SetupVaultFormData {
  vaultName?: string
  keyName?: string
  keyId?: string
}

const defaultInitialFormData: SetupVaultFormData = {
  vaultName: undefined,
  keyName: undefined,
  keyId: undefined
}

const SetupVault: React.FC<StepProps<StepDetailsProps> & ConnectorDetailsProps> = ({
  isEditMode,
  accountId,
  connectorInfo,
  prevStepData,
  previousStep,
  nextStep,
  onConnectorCreated
}) => {
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [vaultNameOptions, setVaultNameOptions] = useState<SelectOption[]>([])
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const { mutate: getMetadata, loading } = useGetMetadata({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    if (isEditMode && connectorInfo) {
      setupAzureKeyVaultNameFormData(connectorInfo).then(data => {
        setInitialValues(data as SetupVaultFormData)
        setLoadingFormData(false)
      })
    }
  }, [isEditMode, connectorInfo])

  const handleFetchEngines = async (formData: ConnectorConfigDTO): Promise<void> => {
    modalErrorHandler?.hide()
    try {
      const { data } = await getMetadata({
        identifier: formData.identifier,
        encryptionType: 'AZURE_VAULT',
        orgIdentifier: formData.orgIdentifier,
        projectIdentifier: formData.projectIdentifier,
        spec: {
          clientId: formData.clientId?.trim(),
          tenantId: formData.tenantId?.trim(),
          subscription: formData.subscription?.trim(),
          connectionString: formData.connectionString?.trim(),
          containerName: formData.containerName?.trim(),
          secretKey: (connectorInfo as any)?.spec?.secretKey || formData.secretKey?.referenceString,
          delegateSelectors: formData.delegateSelectors
        } as AzureBlobMetadataRequestSpecDTO
      })

      setVaultNameOptions(
        (data?.spec as AzureBlobMetadataSpecDTO)?.vaultNames?.map(vaultName => {
          return {
            label: vaultName,
            value: vaultName
          }
        }) || []
      )
    } catch (err) {
      if (shouldShowError(err)) {
        modalErrorHandler?.showDanger(err.data?.message || err.message)
      }
    }
  }

  useEffect(() => {
    if (isEditMode && !loadingFormData && prevStepData) {
      handleFetchEngines(prevStepData as ConnectorConfigDTO)
    }
  }, [isEditMode, loadingFormData, prevStepData])

  useEffect(() => {
    if (isEditMode && !loadingFormData && loading && connectorInfo) {
      setVaultNameOptions([{ label: connectorInfo.spec.vaultName, value: connectorInfo.spec.vaultName }])
    }
  }, [isEditMode, loadingFormData, loading, connectorInfo])

  const handleCreateOrEdit = async (formData: SetupVaultFormData): Promise<void> => {
    modalErrorHandler?.hide()
    if (prevStepData) {
      const data: ConnectorRequestBody = buildAzureBlobPayload({ ...prevStepData, ...formData })

      try {
        if (isEditMode) {
          const response = await updateConnector(data)
          nextStep?.({ ...prevStepData, ...formData })
          onConnectorCreated?.(response.data)
          showSuccess(getString('secretManager.editmessageSuccess'))
        } else {
          const response = await createConnector(data)
          nextStep?.({ ...prevStepData, ...formData })
          onConnectorCreated?.(response.data)
          showSuccess(getString('secretManager.createmessageSuccess'))
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message)
      }
    }
  }

  return loadingFormData ? (
    <PageSpinner />
  ) : (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ variation: FontVariation.H3 }}>{getString('connectors.azureKeyVault.labels.setupVault')}</Text>
      <Container margin={{ bottom: 'xlarge' }}>
        <ModalErrorHandler bind={setModalErrorHandler} />
      </Container>
      <Formik
        formName="azureKeyVaultForm"
        enableReinitialize
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          vaultName: Yup.string().required(getString('connectors.azureKeyVault.validation.vaultName')),
          keyName: Yup.string().required(getString('connectors.azureBlob.validation.keyNameIsRequired')),
          keyId: Yup.string().required(getString('connectors.azureBlob.validation.keyIdIsRequired'))
        })}
        onSubmit={formData => {
          handleCreateOrEdit(formData)
        }}
      >
        <FormikForm>
          <Container height={490}>
            <Layout.Horizontal spacing="medium" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <FormInput.Select
                name="vaultName"
                label={getString('connectors.azureKeyVault.labels.vaultName')}
                items={vaultNameOptions}
                disabled={vaultNameOptions.length === 0 || loading}
              />
              <Button
                margin={{ top: 'large' }}
                intent="primary"
                text={getString('connectors.azureKeyVault.labels.fetchVault')}
                onClick={() => handleFetchEngines(prevStepData as ConnectorConfigDTO)}
                disabled={loading}
                loading={loading}
              />
            </Layout.Horizontal>
            <FormInput.Text name="keyName" label={getString('connectors.azureBlob.labels.keyName')} />
            <FormInput.Text name="keyId" label={getString('connectors.azureBlob.labels.keyId')} />
          </Container>
          <Layout.Horizontal spacing="medium">
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('back')}
              icon="chevron-left"
              onClick={() => previousStep?.(prevStepData)}
            />
            <Button
              type="submit"
              intent="primary"
              rightIcon="chevron-right"
              text={getString('saveAndContinue')}
              disabled={creating || updating}
            />
          </Layout.Horizontal>
        </FormikForm>
      </Formik>
    </Container>
  )
}

export default SetupVault
