/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
  FormikForm
} from '@wings-software/uicore'
import React, { useState } from 'react'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import type { ConnectorInfoDTO, ConnectorRequestBody, ConnectorConfigDTO } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'

import { useConnectorWizard } from '../../../CreateConnectorWizard/ConnectorWizardContext'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import RbacButton from '@rbac/components/Button/Button'
import { getTemplateInputSetYamlPromise, useGetTemplateInputSetYaml } from 'services/template-ng'
import { defaultTo } from 'lodash-es'

interface StepCustomSMConfigStepProps extends ConnectorInfoDTO {
  name: string
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
}

const CustomSMConfigStep: React.FC<StepProps<StepCustomSMConfigStepProps> & StepCustomSMConfigProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  isEditMode,
  connectorInfo,
  accountId
}) => {
  const { getString } = useStrings()
  const { getTemplate } = useTemplateSelector()

  //   const defaultInitialFormData: VaultConfigFormData = {
  //     vaultUrl: '',
  //     basePath: '',
  //     namespace: undefined,
  //     readOnly: false,
  //     default: false,
  //     accessType: HashiCorpVaultAccessTypes.APP_ROLE,
  //     appRoleId: '',
  //     secretId: undefined,
  //     authToken: undefined,
  //     sinkPath: undefined,
  //     renewalIntervalMinutes: 10,
  //     k8sAuthEndpoint: '',
  //     vaultK8sAuthRole: '',
  //     serviceAccountTokenPath: ''
  //   }

  //   const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)
  useConnectorWizard({ helpPanel: { referenceId: 'HashiCorpVaultDetails', contentWidth: 900 } })

  React.useEffect(() => {
    if (isEditMode && connectorInfo) {
      //   setupVaultFormData(connectorInfo, accountId).then(data => {
      //     setInitialValues(data as VaultConfigFormData)
      //     setLoadingFormData(false)
      //   })
    }
  }, [isEditMode, connectorInfo])

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.ConfigLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.Vault
  })

  //   const {
  //     data: templateInputYaml,
  //     loading: loadingTemplateYaml,
  //     error: errorTemplateYaml,
  //     refetch: refetchTemplateInputYaml
  //   } = useGetTemplateInputSetYaml({
  //     lazy: true,
  //     templateIdentifier: defaultTo(templateRefData?.identifier, ''),
  //     queryParams: {
  //       accountIdentifier: templateRefData?.accountId,
  //       orgIdentifier: templateRefData?.orgIdentifier,
  //       projectIdentifier: templateRefData?.projectIdentifier,
  //       versionLabel: defaultTo(templateRefData?.versionLabel, ''),
  //       getDefaultFromOtherRepo: true
  //     }
  //   })

  const onUseTemplate = async () => {
    const { template } = await getTemplate({ templateType: 'Step' })
    const templateRefData = {
      identifier: template?.identifier,
      accountId: template?.accountId,
      orgIdentifier: template?.orgIdentifier,
      projectIdentifier: template?.projectIdentifier,
      versionLabel: template?.versionLabel
    }

    try {
      const data = await getTemplateInputSetYamlPromise({
        templateIdentifier: template.identifier || '',
        queryParams: {
          accountIdentifier: accountId || '',
          orgIdentifier: template.orgIdentifier,
          projectIdentifier: template.projectIdentifier,
          versionLabel: template.versionLabel || ''
        }
      })
    } catch (e) {}
  }

  return loadingFormData ? (
    <PageSpinner />
  ) : (
    <Container padding={{ top: 'medium' }}>
      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }}>
        {getString('connectors.customSM.details')}
      </Text>
      <Formik<any>
        enableReinitialize
        initialValues={{ ...[], ...prevStepData }}
        formName="customSMForm"
        // validationSchema={Yup.object().shape({
        // //   vaultUrl: URLValidationSchema(),
        // //   renewalIntervalMinutes: Yup.mixed().when('accessType', {
        // //     is: val => val !== HashiCorpVaultAccessTypes.VAULT_AGENT && val !== HashiCorpVaultAccessTypes.AWS_IAM,
        // //     then: Yup.number()
        // //       .positive(getString('validation.renewalNumber'))
        // //       .required(getString('validation.renewalInterval'))
        //   }),
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
        // })}
        onSubmit={formData => {
          trackEvent(ConnectorActions.ConfigSubmit, {
            category: Category.CONNECTOR,
            connector_type: Connectors.Vault
          })
          nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <FormInput.CustomRender
                name="templateInfo"
                render={formikProps => {
                  return (
                    <Layout.Horizontal spacing="medium">
                      <RbacButton
                        text={getString('connectors.customSM.selectTemplate')}
                        variation={ButtonVariation.SECONDARY}
                        icon="template-library"
                        onClick={onUseTemplate}
                      />
                    </Layout.Horizontal>
                  )
                }}
              />

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
