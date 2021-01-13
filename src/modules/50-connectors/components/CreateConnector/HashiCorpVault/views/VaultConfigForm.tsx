import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  Button,
  Formik,
  FormikForm,
  Layout,
  StepProps,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Container,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'

import { useToaster } from '@common/exports'
import {
  ConnectorRequestBody,
  useCreateConnector,
  useUpdateConnector,
  VaultConnectorDTO,
  VaultMetadataRequestSpecDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import i18n from '../CreateHashiCorpVault.i18n'
import VaultConnectorFormFields from './VaultConnectorFormFields'
import type { CreateHashiCorpVaultProps, StepSecretManagerProps } from '../CreateHashiCorpVault'

export interface VaultConfigFormData {
  vaultUrl: string
  basePath: string
  readOnly: boolean
  default: boolean
  accessType: VaultMetadataRequestSpecDTO['accessType']
  appRoleId?: string
  secretId?: string
  authToken?: string
  engineType?: 'fetch' | 'manual'
  secretEngine?: string
  secretEngineName?: string
  secretEngineVersion?: number
  renewalIntervalMinutes: number
}

const VaultConfigForm: React.FC<StepProps<StepSecretManagerProps> & CreateHashiCorpVaultProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  isEditMode
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: CreateHashiCorpVault, loading: createLoading } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateSecretManager, loading: updateLoading } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  const handleSubmit = async (formData: VaultConfigFormData): Promise<void> => {
    if (prevStepData) {
      const dataToSubmit: ConnectorRequestBody = {
        connector: {
          orgIdentifier,
          projectIdentifier,
          ...pick(prevStepData, ['name', 'identifier', 'description', 'tags']),
          type: 'Vault',
          spec: {
            ...pick(formData, ['basePath', 'vaultUrl', 'readOnly', 'default', 'renewalIntervalMinutes']),
            authToken: formData.accessType === 'TOKEN' ? formData.authToken : undefined,
            appRoleId: formData.accessType === 'APP_ROLE' ? formData.appRoleId : undefined,
            secretId: formData.accessType === 'APP_ROLE' ? formData.secretId : undefined,
            secretEngineManuallyConfigured: formData.engineType === 'manual',
            secretEngineName:
              formData.engineType === 'manual' ? formData.secretEngineName : formData.secretEngine?.split('@@@')[0],
            secretEngineVersion:
              formData.engineType === 'manual' ? formData.secretEngineVersion : formData.secretEngine?.split('@@@')[1]
          } as VaultConnectorDTO
        }
      }

      try {
        if (!isEditMode && prevStepData.isEdit != true) {
          await CreateHashiCorpVault(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          showSuccess(getString('secretManager.createmessageSuccess'))
        } else {
          await updateSecretManager(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          showSuccess(getString('secretManager.editmessageSuccess'))
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message)
      }
    }
  }

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ size: 'medium' }} padding={{ bottom: 'xlarge' }}>
        {getString('connectors.hashiCorpVault.stepTwoName')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<VaultConfigFormData>
        initialValues={{
          vaultUrl: '',
          basePath: '',
          readOnly: false,
          default: false,
          accessType: 'APP_ROLE',
          appRoleId: '',
          secretId: undefined,
          authToken: undefined,
          secretEngine: prevStepData?.spec
            ? `${(prevStepData?.spec as VaultConnectorDTO).secretEngineName || ''}@@@${
                (prevStepData?.spec as VaultConnectorDTO).secretEngineVersion
              }`
            : '',
          engineType: (prevStepData?.spec as VaultConnectorDTO)?.secretEngineManuallyConfigured ? 'manual' : 'fetch',
          secretEngineName: '',
          secretEngineVersion: 2,
          renewalIntervalMinutes: 10,
          ...prevStepData?.spec
        }}
        validationSchema={Yup.object().shape({
          vaultUrl: Yup.string().trim().required(i18n.validationVaultUrl),
          secretEngineName: Yup.string().when('engineType', {
            is: 'manual',
            then: Yup.string().trim().required(i18n.validationEngine)
          }),
          secretEngineVersion: Yup.number().when('engineType', {
            is: 'manual',
            then: Yup.number().positive(i18n.validationVersionNumber).required(i18n.validationVersion)
          }),
          secretEngine: Yup.string().when('engineType', {
            is: 'fetch',
            then: Yup.string().trim().required(i18n.validationSecretEngine)
          }),
          renewalIntervalMinutes: Yup.number().positive(i18n.validationRenewalNumber).required(i18n.validationRenewal),
          authToken: Yup.string()
            .nullable()
            .when('accessType', {
              is: 'TOKEN',
              then: Yup.string()
                .trim()
                .test('authToken', i18n.validationAuthToken, function (value) {
                  if ((prevStepData?.spec as VaultConnectorDTO)?.accessType === 'TOKEN') return true
                  else if (value?.length > 0) return true
                  return false
                })
            }),
          appRoleId: Yup.string().when('accessType', {
            is: 'APP_ROLE',
            then: Yup.string().trim().required(i18n.validationAppRole)
          }),
          secretId: Yup.string().when('accessType', {
            is: 'APP_ROLE',
            then: Yup.string()
              .trim()
              .test('secretId', i18n.validationSecretId, function (value) {
                if ((prevStepData?.spec as VaultConnectorDTO)?.accessType === 'APP_ROLE') return true
                else if (value?.length > 0) return true
                return false
              })
          })
        })}
        onSubmit={formData => {
          handleSubmit(formData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <VaultConnectorFormFields
                formik={formik}
                identifier={prevStepData?.identifier || /* istanbul ignore next */ ''}
                isEditing={isEditMode}
                accessType={(prevStepData?.spec as VaultConnectorDTO)?.accessType}
              />
              <Layout.Horizontal spacing="medium">
                <Button text={i18n.buttonBack} onClick={() => previousStep?.(prevStepData)} />
                <Button
                  intent="primary"
                  type="submit"
                  text={i18n.buttonNext}
                  disabled={updateLoading || createLoading}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default VaultConfigForm
