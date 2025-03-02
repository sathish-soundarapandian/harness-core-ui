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
  ButtonVariation,
  shouldShowError
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import {
  ConnectorConfigDTO,
  useGetMetadata,
  AzureKeyVaultMetadataSpecDTO,
  useCreateConnector,
  useUpdateConnector,
  ConnectorRequestBody
} from 'services/cd-ng'
import type { StepDetailsProps, ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import { PageSpinner } from '@common/components'
import {
  buildAzureKeyVaultPayload,
  setupAzureKeyVaultNameFormData,
  buildAzureKeyVaultMetadataPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useGovernanceMetaDataModal } from '@governance/hooks/useGovernanceMetaDataModal'
import { connectorGovernanceModalProps } from '@connectors/utils/utils'
import { useConnectorWizard } from '@connectors/components/CreateConnectorWizard/ConnectorWizardContext'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'

export interface SetupVaultFormData {
  vaultName?: string
}

const defaultInitialFormData: SetupVaultFormData = {
  vaultName: undefined
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
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess } = useToaster()
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [vaultNameOptions, setVaultNameOptions] = useState<SelectOption[]>([])
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const {
    mutate: getMetadata,
    loading,
    error: metaDataError
  } = useGetMetadata({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  const { conditionallyOpenGovernanceErrorModal } = useGovernanceMetaDataModal(connectorGovernanceModalProps())
  useEffect(() => {
    if (isEditMode && connectorInfo) {
      setupAzureKeyVaultNameFormData(connectorInfo).then(data => {
        if (!metaDataError && vaultNameOptions && vaultNameOptions.length) {
          setInitialValues(data as SetupVaultFormData)
        }
        setLoadingFormData(false)
      })
    }
  }, [isEditMode, connectorInfo, metaDataError, vaultNameOptions])
  useConnectorWizard({ helpPanel: { referenceId: 'AzureKeyVaultSetupVault', contentWidth: 900 } })

  const handleFetchEngines = async (formData: ConnectorConfigDTO): Promise<void> => {
    modalErrorHandler?.hide()
    try {
      const metadataPayload = buildAzureKeyVaultMetadataPayload(formData, connectorInfo)
      const { data } = await getMetadata(metadataPayload)

      setVaultNameOptions(
        (data?.spec as AzureKeyVaultMetadataSpecDTO)?.vaultNames?.map(vaultName => {
          return {
            label: vaultName,
            value: vaultName
          }
        }) || []
      )
    } catch (err) {
      if (shouldShowError(err)) {
        modalErrorHandler?.showDanger(getRBACErrorMessage(err))
      }
    }
  }
  useEffect(() => {
    if (metaDataError && modalErrorHandler) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(metaDataError))
    }
  }, [metaDataError, modalErrorHandler])

  useEffect(() => {
    if (!loadingFormData && prevStepData) {
      handleFetchEngines(prevStepData as ConnectorConfigDTO)
    }
  }, [loadingFormData, prevStepData])

  const handleCreateOrEdit = async (formData: SetupVaultFormData): Promise<void> => {
    modalErrorHandler?.hide()
    if (prevStepData) {
      const data: ConnectorRequestBody = buildAzureKeyVaultPayload({ ...prevStepData, ...formData })

      try {
        const response = isEditMode ? await updateConnector(data) : await createConnector(data)
        const onSuccessCreateOrUpdateNextSteps = () => {
          nextStep?.({ ...prevStepData, ...formData })
          onConnectorCreated?.(response.data)
          isEditMode
            ? showSuccess(getString('secretManager.editmessageSuccess'))
            : showSuccess(getString('secretManager.createmessageSuccess'))
        }
        if (response.data?.governanceMetadata) {
          conditionallyOpenGovernanceErrorModal(response.data?.governanceMetadata, onSuccessCreateOrUpdateNextSteps)
        } else {
          onSuccessCreateOrUpdateNextSteps()
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message)
      }
    }
  }

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.SetupVaultLoad, {
    category: Category.CONNECTOR
  })

  return (
    <Container padding={{ top: 'medium' }}>
      <Text font={{ variation: FontVariation.H3 }}>{getString('connectors.azureKeyVault.labels.setupVault')}</Text>
      <Container margin={{ bottom: 'xlarge' }}>
        <ModalErrorHandler bind={setModalErrorHandler} />
      </Container>
      {loadingFormData || loading ? (
        <PageSpinner />
      ) : (
        <Formik
          formName="azureKeyVaultForm"
          enableReinitialize
          initialValues={initialValues}
          validationSchema={Yup.object().shape({
            vaultName: Yup.string().required(getString('connectors.azureKeyVault.validation.vaultName'))
          })}
          onSubmit={formData => {
            trackEvent(ConnectorActions.SetupVaultSubmit, {
              category: Category.CONNECTOR
            })
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
      )}
    </Container>
  )
}

export default SetupVault
