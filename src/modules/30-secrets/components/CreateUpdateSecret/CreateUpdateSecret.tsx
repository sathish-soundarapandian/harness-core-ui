/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  Text,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import {
  usePutSecret,
  usePutSecretFileV2,
  usePostSecretFileV2,
  usePostSecret,
  useGetConnectorList,
  SecretDTOV2,
  SecretResponseWrapper,
  SecretRequestWrapper,
  ConnectorInfoDTO,
  ConnectorResponse,
  VaultConnectorDTO,
  useGetConnector,
  useGetSecretV2,
  ResponseSecretResponseWrapper,
  ListSecretsV2QueryParams,
  JsonNode
} from 'services/cd-ng'
import type { SecretTextSpecDTO, SecretFileSpecDTO } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { IdentifierSchema, NameSchema, VariableSchemaWithoutHook } from '@common/utils/Validation'
import type { UseGetMockData } from '@common/utils/testUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, SecretActions } from '@common/constants/TrackingConstants'
import { useGovernanceMetaDataModal } from '@governance/hooks/useGovernanceMetaDataModal'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { InputSetSchema } from '@secrets/components/ScriptVariableRuntimeInput/ScriptVariablesRuntimeInput'
import VaultFormFields from './views/VaultFormFields'
import LocalFormFields from './views/LocalFormFields'
import CustomFormFields from './views/CustomFormFields/CustomFormFields'

export type SecretFormData = Omit<SecretDTOV2, 'spec'> & SecretTextSpecDTO & SecretFileSpecDTO & TemplateInputInterface
interface TemplateInputInterface {
  templateInputs?: JsonNode
}

export interface SecretIdentifiers {
  identifier: string
  projectIdentifier?: string
  orgIdentifier?: string
}

interface CreateUpdateSecretProps {
  mockSecretDetails?: UseGetMockData<ResponseSecretResponseWrapper>
  secret?: SecretIdentifiers
  type?: SecretResponseWrapper['secret']['type']
  onChange?: (data: SecretDTOV2) => void
  onSuccess?: (data: SecretFormData) => void
  connectorTypeContext?: ConnectorInfoDTO['type']
  privateSecret?: boolean
}

const LocalFormFieldsSMList = ['Local', 'GcpKms', 'AwsKms']
const CreateUpdateSecret: React.FC<CreateUpdateSecretProps> = props => {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { onSuccess, connectorTypeContext, privateSecret } = props
  const propsSecret = props.secret
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { OPA_SECRET_GOVERNANCE } = useFeatureFlags()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const secretTypeFromProps = props.type
  const [type, setType] = useState<SecretResponseWrapper['secret']['type']>(secretTypeFromProps || 'SecretText')
  const [secret, setSecret] = useState<SecretDTOV2>()
  const { conditionallyOpenGovernanceErrorModal } = useGovernanceMetaDataModal({
    considerWarningAsError: false,
    errorHeaderMsg: 'secrets.policyEvaluations.failedToSave',
    warningHeaderMsg: 'secrets.policyEvaluations.warning'
  })

  const {
    loading: loadingSecret,
    data: secretResponse,
    refetch,
    error: getSecretError
  } = useGetSecretV2({
    identifier: propsSecret?.identifier || '',
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    },
    mock: props.mockSecretDetails,
    lazy: true
  })

  useEffect(() => {
    if (getSecretError) {
      modalErrorHandler?.showDanger(getSecretError.message)
      refetch?.()
    }
  }, [getSecretError])

  useEffect(() => {
    if (propsSecret?.identifier) {
      refetch?.()
    }
  }, [propsSecret?.identifier])

  const secretManagerTypes: ConnectorInfoDTO['type'][] = [
    'AwsKms',
    'AzureKeyVault',
    'Vault',
    'AwsSecretManager',
    'GcpKms'
  ]
  let sourceCategory: ListSecretsV2QueryParams['source_category'] | undefined
  if (connectorTypeContext && secretManagerTypes.includes(connectorTypeContext)) {
    sourceCategory = 'SECRET_MANAGER'
  }

  const {
    data: secretManagersApiResponse,
    loading: loadingSecretsManagers,
    refetch: getSecretManagers
  } = useGetConnectorList({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      category: 'SECRET_MANAGER',
      source_category: sourceCategory
    },
    lazy: true
  })

  const {
    data: connectorDetails,
    loading: loadingConnectorDetails,
    refetch: getConnectorDetails
  } = useGetConnector({
    identifier:
      (secret?.spec as SecretTextSpecDTO)?.secretManagerIdentifier ||
      (secretResponse?.data?.secret?.spec as SecretTextSpecDTO)?.secretManagerIdentifier,
    lazy: true
  })
  const { mutate: createSecretText, loading: loadingCreateText } = usePostSecret({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, privateSecret }
  })
  const { mutate: createSecretFile, loading: loadingCreateFile } = usePostSecretFileV2({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, privateSecret }
  })
  const { mutate: updateSecretText, loading: loadingUpdateText } = usePutSecret({
    identifier: secret?.identifier as string,
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    }
  })
  const { mutate: updateSecretFile, loading: loadingUpdateFile } = usePutSecretFileV2({
    identifier: secret?.identifier as string,
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    }
  })

  const loading = loadingCreateText || loadingUpdateText || loadingCreateFile || loadingUpdateFile
  const editing = !!propsSecret

  useEffect(() => {
    if (!editing) {
      getSecretManagers()
    } else if (secretResponse?.data?.secret && !loadingSecret) {
      setSecret(secretResponse?.data?.secret)
      getConnectorDetails({
        queryParams: {
          accountIdentifier,
          ...pick(secretResponse?.data.secret, ['orgIdentifier', 'projectIdentifier'])
        }
      })
      if ((secretResponse?.data?.secret?.spec as SecretTextSpecDTO)?.valueType === 'CustomSecretManagerValues') {
        setTemplateInputSets(JSON.parse((secretResponse?.data?.secret?.spec as SecretTextSpecDTO)?.value as string))
      }
    }
  }, [secretResponse])

  const createFormData = (data: SecretFormData, editFlag?: boolean): FormData => {
    const formData = new FormData()
    formData.set(
      'spec',
      JSON.stringify({
        secret: {
          type,
          ...pick(data, ['name', 'identifier', 'description', 'tags']),
          orgIdentifier: editFlag ? propsSecret?.orgIdentifier : orgIdentifier,
          projectIdentifier: editFlag ? propsSecret?.projectIdentifier : projectIdentifier,
          spec: {
            ...pick(data, ['secretManagerIdentifier'])
          } as SecretFileSpecDTO
        } as SecretDTOV2
      })
    )
    const file = (data as any)?.['file']?.[0]
    file && formData.set('file', file)
    return formData
  }

  const createSecretTextData = (data: SecretFormData, editFlag?: boolean): SecretRequestWrapper => {
    return {
      secret: {
        type,
        ...pick(data, ['name', 'identifier', 'description', 'tags']),
        orgIdentifier: editFlag ? propsSecret?.orgIdentifier : orgIdentifier,
        projectIdentifier: editFlag ? propsSecret?.projectIdentifier : projectIdentifier,
        spec: {
          value: data.templateInputs ? JSON.stringify(data.templateInputs) : data.value,
          ...pick(data, ['secretManagerIdentifier', 'valueType'])
        } as SecretTextSpecDTO
      }
    }
  }

  const { trackEvent } = useTelemetry()

  const handleSubmit = async (data: SecretFormData): Promise<void> => {
    let response
    let successMessage: string
    try {
      if (editing) {
        if (type === 'SecretText') {
          response = await updateSecretText(createSecretTextData(data, editing))
        }
        if (type === 'SecretFile') {
          response = await updateSecretFile(createFormData(data, editing) as any)
        }
        successMessage = getString('secrets.secret.successMessage', {
          name: data.name,
          action: 'updated'
        })
      } else {
        trackEvent(SecretActions.SaveCreateSecret, {
          category: Category.SECRET,
          type,
          data
        })
        if (type === 'SecretText') {
          response = await createSecretText(createSecretTextData(data))
        }
        if (type === 'SecretFile') {
          response = await createSecretFile(createFormData(data) as any)
        }
        successMessage = getString('secrets.secret.successMessage', {
          name: data.name,
          action: 'created'
        })
      }

      conditionallyOpenGovernanceErrorModal(
        OPA_SECRET_GOVERNANCE ? response?.data?.governanceMetadata : undefined,
        () => {
          showSuccess(successMessage)
          onSuccess?.(data)
        }
      )
    } catch (error) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(error))
    }
  }

  const secretManagersOptions: SelectOption[] = editing
    ? [
        {
          label: connectorDetails?.data?.connector?.name || '',
          value: connectorDetails?.data?.connector?.identifier || ''
        }
      ]
    : secretManagersApiResponse?.data?.content?.map((item: ConnectorResponse) => {
        return {
          label: item.connector?.name || '',
          value: item.connector?.identifier || ''
        }
      }) || []

  const defaultSecretManagerId = secretManagersApiResponse?.data?.content?.filter(
    item => item.connector?.spec?.default
  )[0]?.connector?.identifier
  const secretTypeOptions = [
    { label: getString('secrets.secret.labelText'), value: 'SecretText' },
    { label: getString('secrets.secret.labelFile'), value: 'SecretFile' }
  ]

  const [selectedSecretManager, setSelectedSecretManager] = useState<ConnectorInfoDTO | undefined>()
  const [readOnlySecretManager, setReadOnlySecretManager] = useState<boolean>()
  const [templateInputSets, setTemplateInputSets] = React.useState<JsonNode>()

  const initializeTemplateInputs = (secretManager: ConnectorInfoDTO | undefined) => {
    if (secretManager?.type === 'CustomSecretManager') {
      const inputs: [] = secretManager.spec.template?.templateInputs?.environmentVariables
      if (inputs) {
        const filteredInputs = {
          environmentVariables: inputs
            .map((item: InputSetSchema) => {
              if (!item.useAsDefault) {
                return { ...pick(item, ['name', 'type']), value: '' }
              }
            })
            .filter(value => value)
        }
        setTemplateInputSets(filteredInputs)
      }
    }
  }

  // update selectedSecretManager and readOnly flag in state when we get new data
  useEffect(() => {
    const selectedSM = editing
      ? // when editing, use connector from api response directly, since user cannot change SM
        connectorDetails?.data?.connector
      : // when creating, iterate over all secret managers to find default SM
        secretManagersApiResponse?.data?.content?.filter(
          itemValue => itemValue.connector?.identifier === defaultSecretManagerId
        )?.[0]?.connector

    setSelectedSecretManager(selectedSM)
    setReadOnlySecretManager((selectedSM?.spec as VaultConnectorDTO)?.readOnly)
  }, [defaultSecretManagerId, connectorDetails])

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<SecretFormData>
        initialValues={{
          name: '',
          description: '',
          identifier: '',
          tags: {},
          valueType:
            selectedSecretManager?.type === 'CustomSecretManager'
              ? 'CustomSecretManagerValues'
              : readOnlySecretManager
              ? 'Reference'
              : 'Inline',
          type,
          secretManagerIdentifier: selectedSecretManager?.identifier || defaultSecretManagerId || '',
          orgIdentifier,
          projectIdentifier,
          templateInputs: templateInputSets,
          ...pick(secret, ['name', 'identifier', 'description', 'tags']),
          ...pick(secret?.spec, ['valueType', 'secretManagerIdentifier']),
          ...(editing &&
            secret &&
            (secret?.spec as SecretTextSpecDTO)?.valueType === 'Reference' &&
            pick(secret?.spec, ['value']))
        }}
        formName="createUpdateSecretForm"
        enableReinitialize
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema(),
          value:
            editing || type === 'SecretFile' || selectedSecretManager?.type === 'CustomSecretManager'
              ? Yup.string().trim()
              : Yup.string().trim().required(getString('common.validation.valueIsRequired')),
          secretManagerIdentifier: Yup.string().required(getString('secrets.secret.validationKms')),
          templateInputs:
            selectedSecretManager?.type === 'CustomSecretManager'
              ? Yup.object().shape({
                  environmentVariables: VariableSchemaWithoutHook(getString)
                })
              : Yup.object()
        })}
        validate={formData => {
          props.onChange?.({
            type: formData.type,
            ...pick(formData, ['name', 'description', 'identifier', 'tags']),
            spec: pick(formData, ['value', 'valueType', 'secretManagerIdentifier']) as SecretTextSpecDTO
          })
        }}
        onSubmit={data => {
          handleSubmit(data)
        }}
      >
        {formikProps => {
          const typeOfSelectedSecretManager = selectedSecretManager?.type

          return (
            <FormikForm>
              <FormInput.Select
                name="secretManagerIdentifier"
                label={getString('secrets.labelSecretsManager')}
                items={secretManagersOptions}
                disabled={editing || loadingSecretsManagers || loadingConnectorDetails}
                onChange={item => {
                  const secretManagerData = secretManagersApiResponse?.data?.content?.filter(
                    itemValue => itemValue.connector?.identifier === item.value
                  )?.[0]?.connector
                  const readOnlyTemp =
                    secretManagerData?.type === 'Vault'
                      ? (secretManagerData?.spec as VaultConnectorDTO)?.readOnly
                      : false
                  setReadOnlySecretManager(readOnlyTemp)
                  formikProps.setFieldValue(
                    'valueType',
                    secretManagerData?.type === 'CustomSecretManager'
                      ? 'CustomSecretManagerValues'
                      : readOnlyTemp
                      ? 'Reference'
                      : 'Inline'
                  )

                  initializeTemplateInputs(secretManagerData)
                  setSelectedSecretManager(secretManagerData)
                }}
              />
              {!secretTypeFromProps ? (
                <FormInput.RadioGroup
                  name="type"
                  label={getString('secrets.secret.labelSecretType')}
                  items={secretTypeOptions}
                  radioGroup={{ inline: true }}
                  onChange={ev => {
                    setType((ev.target as HTMLInputElement).value as SecretResponseWrapper['secret']['type'])
                  }}
                />
              ) : null}
              <FormInput.InputWithIdentifier
                inputName="name"
                inputLabel={getString('secrets.labelSecretName')}
                idName="identifier"
                isIdentifierEditable={!editing}
                inputGroupProps={{ disabled: loadingSecret }}
              />

              {!typeOfSelectedSecretManager ? <Text>{getString('secrets.secret.messageSelectSM')}</Text> : null}
              {typeOfSelectedSecretManager === 'CustomSecretManager' ? (
                <CustomFormFields
                  formikProps={formikProps}
                  type={type}
                  templateInputSets={templateInputSets as JsonNode}
                  modalErrorHandler={modalErrorHandler}
                />
              ) : null}
              {LocalFormFieldsSMList.findIndex(val => val === typeOfSelectedSecretManager) !== -1 ? (
                <LocalFormFields disableAutocomplete formik={formikProps} type={type} editing={editing} />
              ) : null}
              {typeOfSelectedSecretManager === 'Vault' ||
              typeOfSelectedSecretManager === 'AzureKeyVault' ||
              typeOfSelectedSecretManager === 'AwsSecretManager' ? (
                <VaultFormFields formik={formikProps} type={type} editing={editing} readonly={readOnlySecretManager} />
              ) : null}
              <Button
                intent="primary"
                type="submit"
                text={loading ? getString('common.saving') : getString('save')}
                margin={{ top: 'large' }}
                disabled={loading || !typeOfSelectedSecretManager}
                variation={ButtonVariation.PRIMARY}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export default CreateUpdateSecret
