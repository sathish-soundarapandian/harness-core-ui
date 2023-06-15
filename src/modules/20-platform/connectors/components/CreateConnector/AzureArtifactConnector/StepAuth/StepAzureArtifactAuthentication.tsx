/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  StepProps,
  Container,
  SelectOption,
  ButtonVariation,
  PageSpinner
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { setupAzureArtifactsFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useStrings } from 'framework/strings'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import css from '../../JenkinsConnector/CreateJenkinsConnector.module.scss'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'

interface StepAzureArticfactsAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface AzureArtifactsAuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo?: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface AzureArtifactsFormInterface {
  azureArtifactsUrl: string
  authType: string
  tokenRef: SecretReferenceInterface | void
}

const defaultInitialFormData: AzureArtifactsFormInterface = {
  azureArtifactsUrl: '',
  authType: AuthTypes.PERSONAL_ACCESS_TOKEN,
  tokenRef: undefined
}

const StepAzureArtifactsAuthentication: React.FC<
  StepProps<StepAzureArticfactsAuthenticationProps> & AzureArtifactsAuthenticationProps
> = props => {
  const { getString } = useStrings()
  const { prevStepData, nextStep, accountId } = props
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  const authOptions: SelectOption[] = [
    {
      label: getString('personalAccessToken'),
      value: AuthTypes.PERSONAL_ACCESS_TOKEN
    }
  ]

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupAzureArtifactsFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as AzureArtifactsFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepAzureArticfactsAuthenticationProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical className={css.stepDetails} spacing="small">
      <Text font={{ variation: FontVariation.H3 }}>{getString('details')}</Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="azureArtifactsAuthForm"
        validationSchema={Yup.object().shape({
          azureArtifactsUrl: Yup.string()
            .trim()
            .required(getString('connectors.azureArtifacts.azureArtifactsUrlRequired')),
          authType: Yup.string().trim().required(getString('validation.authType')),
          tokenRef: Yup.object().required(getString('connectors.azureArtifacts.tokenRefRequired'))
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <>
            <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.secondStep} width={'64%'}>
              <FormInput.Text
                name="azureArtifactsUrl"
                placeholder={getString('UrlLabel')}
                label={getString('connectors.azureArtifacts.azureArtifactsUrl')}
              />
              <Container className={css.authHeaderRow}>
                <Text
                  font={{ variation: FontVariation.H6 }}
                  inline
                  tooltipProps={{ dataTooltipId: 'jenkinsConnectorAuthentication' }}
                >
                  {getString('authentication')}
                </Text>
                <FormInput.Select
                  name="authType"
                  items={authOptions}
                  disabled={true}
                  className={commonStyles.authTypeSelectLarge}
                />
              </Container>
              <SecretInput name={'tokenRef'} label={getString('personalAccessToken')} />
            </Layout.Vertical>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="jenkinsBackButton"
                variation={ButtonVariation.SECONDARY}
              />
              <Button
                type="submit"
                variation={ButtonVariation.PRIMARY}
                onClick={formikProps.submitForm}
                text={getString('continue')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepAzureArtifactsAuthentication
