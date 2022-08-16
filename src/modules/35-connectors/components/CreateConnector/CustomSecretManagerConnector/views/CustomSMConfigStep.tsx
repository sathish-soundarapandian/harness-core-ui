/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import {
  StepProps,
  Layout,
  Text,
  Container,
  FormInput,
  Formik,
  Button,
  ButtonVariation,
  PageSpinner,
  FormikForm,
  MultiTypeInputType,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  getErrorInfoFromErrorObject
} from '@wings-software/uicore'

import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { parse } from 'yaml'
import type { FormikContextType } from 'formik'
import type { ConnectorInfoDTO, ConnectorRequestBody, ConnectorConfigDTO, JsonNode } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'

import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import RbacButton from '@rbac/components/Button/Button'
import { getTemplateInputSetYamlPromise } from 'services/template-ng'

import { MultiTypeSecretInput } from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { getRefFromIdAndScopeParams, setupCustomSMFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { CustomSMFormInterface } from '@connectors/interfaces/ConnectorInterface'
import { ScriptVariablesRuntimeInput } from '@common/components/ScriptVariableRuntimeInput/ScriptVariablesRuntimeInput'

interface StepCustomSMConfigStepProps extends ConnectorInfoDTO {
  name: string
  environmentVariables?: []
  templateInputs?: JsonNode
}

interface StepCustomSMConfigProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  hideModal: () => void
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  getTemplate: (data: GetTemplateProps) => Promise<GetTemplateResponse>
}

const CustomSMConfigStep: React.FC<StepProps<StepCustomSMConfigStepProps> & StepCustomSMConfigProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  isEditMode,
  connectorInfo,
  accountId,
  getTemplate
}) => {
  const { getString } = useStrings()

  const defaultInitialFormData: CustomSMFormInterface = {
    template: undefined,
    templateInputs: {},
    onDelegate: true,
    executionTarget: {},
    templateJson: {}
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  React.useEffect(() => {
    if (isEditMode) {
      if (connectorInfo) {
        setupCustomSMFormData(connectorInfo).then(data => {
          setInitialValues(data as CustomSMFormInterface)
          setTemplateInputSets(data.templateInputs)
        })
      }
      setLoadingFormData(false)
    }
  }, [isEditMode, connectorInfo])

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.ConfigLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.Vault
  })

  const [templateInputSets, setTemplateInputSets] = React.useState<JsonNode>()
  const onUseTemplate = async (formikProps: FormikContextType<CustomSMFormInterface>) => {
    const { template } = await getTemplate?.({ templateType: 'SecretManager' })
    formikProps.setFieldValue('template', {
      ...template,
      versionLabel: template.versionLabel,
      templateRef: getRefFromIdAndScopeParams(
        template.identifier || '',
        template.orgIdentifier,
        template.projectIdentifier
      )
    })

    const templateJSON = parse(template.yaml || '')?.template
    formikProps.setFieldValue('templateJson', templateJSON)
    formikProps.setFieldValue('onDelegate', templateJSON.spec.onDelegate)

    try {
      const templateInputYaml = await getTemplateInputSetYamlPromise({
        templateIdentifier: template?.identifier || '',
        queryParams: {
          accountIdentifier: accountId || '',
          orgIdentifier: template?.orgIdentifier,
          projectIdentifier: template?.projectIdentifier,
          versionLabel: template?.versionLabel || ''
        }
      })

      let inputSet: JsonNode = {}
      if (templateInputYaml && templateInputYaml?.data) {
        inputSet = parse(templateInputYaml?.data?.replace(/"<\+input>"/g, '""'))
        formikProps.setFieldValue('templateInputs', inputSet)
        setTemplateInputSets(inputSet)
      }

      if (templateJSON.spec.onDelegate !== true && !inputSet.hasOwnProperty('executionTarget')) {
        formikProps.setFieldValue('executionTarget', templateJSON.spec.executionTarget)
      }
    } catch (e) {
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(e))
    }
  }

  return loadingFormData ? (
    <PageSpinner />
  ) : (
    <Container padding={{ top: 'medium' }} height="100%">
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }}>
        {getString('connectors.customSM.details')}
      </Text>
      <Formik<CustomSMFormInterface>
        enableReinitialize
        initialValues={{ ...initialValues, ...prevStepData }}
        formName="customSMForm"
        validationSchema={Yup.object().shape({
          template: Yup.object().required('Please seleact a template.')

          // renewalIntervalMinutes: Yup.mixed().when('accessType', {
          //   is: val => val !== HashiCorpVaultAccessTypes.VAULT_AGENT && val !== HashiCorpVaultAccessTypes.AWS_IAM,
          //   then: Yup.number()
          //     .positive(getString('validation.renewalNumber'))
          //     .required(getString('validation.renewalInterval'))
          // }),
          //   authToken: Yup.object()
          //     .nullable()
          //     .when('accessType', {
          //       is: HashiCorpVaultAccessTypes.TOKEN,
          //       then: Yup.object().test('authToken', getString('validation.authToken'), function (value) {
          //         if ((prevStepData?.spec as VaultConnectorDTO)?.accessType === HashiCorpVaultAccessTypes.TOKEN)
          //           return true
          //         else if (value?.name?.length > 0) return true
          //         return false
          //       })
          //     }),
          //   appRoleId: Yup.string().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.APP_ROLE,
          //     then: Yup.string().trim().required(getString('validation.appRole'))
          //   }),
          //   secretId: Yup.object().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.APP_ROLE,
          //     then: Yup.object().test('secretId', getString('validation.secretId'), function (value) {
          //       if ((prevStepData?.spec as VaultConnectorDTO)?.accessType === HashiCorpVaultAccessTypes.APP_ROLE)
          //         return true
          //       else if (value?.name?.length > 0) return true
          //       return false
          //     })
          //   }),
          //   sinkPath: Yup.string().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.VAULT_AGENT,
          //     then: Yup.string().trim().required(getString('connectors.hashiCorpVault.sinkPathIsRequired'))
          //   }),
          //   xvaultAwsIamServerId: Yup.object().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.AWS_IAM,
          //     then: Yup.object().test(
          //       'secretId',
          //       getString('connectors.hashiCorpVault.serverIdHeaderRequired'),
          //       function (value) {
          //         if (
          //           (prevStepData?.spec as VaultConnectorDTO)?.accessType === HashiCorpVaultAccessTypes.AWS_IAM ||
          //           value?.name?.length > 0
          //         ) {
          //           return true
          //         }
          //         return false
          //       }
          //     )
          //   }),
          //   vaultAwsIamRole: Yup.string().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.AWS_IAM,
          //     then: Yup.string().trim().required(getString('common.banners.trial.contactSalesForm.roleValidation'))
          //   }),
          //   awsRegion: Yup.string().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.AWS_IAM,
          //     then: Yup.string().trim().required(getString('validation.regionRequired'))
          //   }),
          //   vaultK8sAuthRole: Yup.string().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.K8s_AUTH,
          //     then: Yup.string().trim().required(getString('connectors.hashiCorpVault.vaultK8sAuthRoleRequired'))
          //   }),
          //   serviceAccountTokenPath: Yup.string().when('accessType', {
          //     is: HashiCorpVaultAccessTypes.K8s_AUTH,
          //     then: Yup.string().trim().required(getString('connectors.hashiCorpVault.serviceAccountRequired'))
          //   }),
          //   default: Yup.boolean().when('readOnly', {
          //     is: true,
          //     then: Yup.boolean().equals([false], getString('connectors.hashiCorpVault.preventDefaultWhenReadOnly'))
          //   })
        })}
        onSubmit={formData => {
          trackEvent(ConnectorActions.ConfigSubmit, {
            category: Category.CONNECTOR,
            connector_type: Connectors.Vault
          })
          nextStep?.({ ...connectorInfo, ...prevStepData, ...formData } as ConnectorInfoDTO)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Container style={{ minHeight: '450px' }}>
                <FormInput.CustomRender
                  name="template"
                  label="Shell Script"
                  render={formikProps => {
                    return (
                      <Layout.Vertical spacing="medium">
                        <RbacButton
                          text={
                            formikProps.values.template
                              ? `Selected: ${formikProps.values.template.templateRef}(${formikProps.values.template.versionLabel})`
                              : getString('connectors.customSM.selectTemplate')
                          }
                          variation={ButtonVariation.PRIMARY}
                          icon="template-library"
                          style={{ width: 'fit-content', maxWidth: '400px' }}
                          onClick={() => onUseTemplate(formikProps)}
                        />
                      </Layout.Vertical>
                    )
                  }}
                />
                {formik.values.templateInputs ? (
                  <ScriptVariablesRuntimeInput
                    allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                    path={''}
                    template={templateInputSets || prevStepData?.templateInputs}
                    enableDefault
                  />
                ) : null}

                <FormInput.CheckBox
                  label="Execute on Delegate"
                  name={`onDelegate`}
                  placeholder={getString('typeLabel')}
                />
                {formik.values.onDelegate !== true ? (
                  <>
                    <FormInput.Text
                      name="executionTarget.host"
                      placeholder={getString('pipelineSteps.hostLabel')}
                      label={getString('targetHost')}
                      style={{ marginTop: 'var(--spacing-small)' }}
                      disabled={false}
                    />

                    <MultiTypeSecretInput
                      type="SSHKey"
                      name="executionTarget.connectorRef"
                      label={getString('sshConnector')}
                      disabled={false}
                      formik={formik}
                      allowableTypes={[]}
                    />

                    <FormInput.Text
                      name="executionTarget.workingDirectory"
                      placeholder={getString('workingDirectory')}
                      label={getString('workingDirectory')}
                      style={{ marginTop: 'var(--spacing-medium)' }}
                      disabled={false}
                    />
                  </>
                ) : null}
              </Container>

              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  text={getString('back')}
                  onClick={() => previousStep?.(prevStepData)}
                />
                <Button type="submit" intent="primary" rightIcon="chevron-right" text={getString('continue')} />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default CustomSMConfigStep
