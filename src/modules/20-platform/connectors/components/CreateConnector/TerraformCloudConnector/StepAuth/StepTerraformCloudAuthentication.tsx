/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  StepProps,
  Container,
  ButtonVariation,
  FormikForm,
  PageSpinner,
  FormInput
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import classNames from 'classnames'
import * as Yup from 'yup'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import { URLValidationSchema } from '@common/utils/Validation'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useStrings } from 'framework/strings'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'
import { useConnectorWizard } from '@connectors/components/CreateConnectorWizard/ConnectorWizardContext'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { setupTerraformCloudFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import commonCss from '../../commonSteps/ConnectorCommonStyles.module.scss'
import css from '../../GithubConnector/StepAuth/StepGithubAuthentication.module.scss'

interface TerraformCloudAuthenticationProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  onConnectorCreated?: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  helpPanelReferenceId?: string
}

interface StepConfigureProps extends ConnectorConfigDTO {
  closeModal?: () => void
  onSuccess?: () => void
}

interface TerraformCloudFormInterface {
  apiToken: SecretReferenceInterface | void
  credentialType: string
  terraformCloudUrl: string
}

const StepTerraformCloudAuthentication: React.FC<StepProps<StepConfigureProps> & TerraformCloudAuthenticationProps> =
  props => {
    const { prevStepData, nextStep, accountId } = props
    const { getString } = useStrings()
    const { trackEvent } = useTelemetry()
    const [initialValues, setInitialValues] = useState<TerraformCloudFormInterface>({
      terraformCloudUrl: '',
      credentialType: AuthTypes.API_TOKEN,
      apiToken: undefined
    })

    const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(props.isEditMode)

    const scope: ScopedObjectDTO | undefined = props.isEditMode
      ? {
          orgIdentifier: prevStepData?.orgIdentifier,
          projectIdentifier: prevStepData?.projectIdentifier
        }
      : undefined

    useEffect(() => {
      if (loadingConnectorSecrets && props.isEditMode && props.connectorInfo) {
        setupTerraformCloudFormData(props.connectorInfo, accountId)
          .then(data => {
            setInitialValues(data as TerraformCloudFormInterface)
          })
          .finally(() => {
            setLoadingConnectorSecrets(false)
          })
      }
    }, [loadingConnectorSecrets])

    useConnectorWizard({
      helpPanel: props.helpPanelReferenceId ? { referenceId: props.helpPanelReferenceId, contentWidth: 900 } : undefined
    })

    useTrackEvent(ConnectorActions.AuthenticationStepLoad, {
      category: Category.CONNECTOR,
      connector_type: Connectors.TERRAFORM_CLOUD
    })

    const handleSubmit = (formData: ConnectorConfigDTO): void => {
      trackEvent(ConnectorActions.AuthenticationStepSubmit, {
        category: Category.CONNECTOR,
        connector_type: Connectors.TERRAFORM_CLOUD
      })

      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData })
    }

    if (loadingConnectorSecrets) {
      return <PageSpinner />
    }

    return (
      <Layout.Vertical
        className={classNames(css.secondStep, commonCss.connectorModalMinHeight, commonCss.stepContainer)}
      >
        <Text
          font={{ variation: FontVariation.H3 }}
          tooltipProps={{ dataTooltipId: 'terraformCloudAuthenticationDetails' }}
        >
          {getString('credentials')}
        </Text>
        <Formik
          initialValues={{
            ...initialValues,
            ...prevStepData
          }}
          formName="stepTerraformCloudAuthForm"
          validationSchema={Yup.object().shape({
            terraformCloudUrl: URLValidationSchema(getString, {
              requiredMessage: getString('connectors.terraformCloud.urlValidation')
            }),
            apiToken: Yup.string().trim().required(getString('connectors.apiTokenValidation'))
          })}
          onSubmit={handleSubmit}
        >
          <FormikForm className={classNames(commonCss.fullHeight, commonCss.fullHeightDivsWithFlex)}>
            <Layout.Vertical
              className={classNames(css.stepFormWrapper, commonCss.paddingTop8)}
              spacing="large"
              width={'64%'}
            >
              <FormInput.Text
                name="terraformCloudUrl"
                label={getString('connectors.terraformCloud.url')}
                placeholder={getString('UrlLabel')}
                tooltipProps={{ dataTooltipId: 'terraformCloud_master_url' }}
              />

              <Container className={css.authHeaderRow} flex={{ alignItems: 'baseline' }}>
                <Text
                  font={{ variation: FontVariation.H6 }}
                  tooltipProps={{ dataTooltipId: 'terraformCloudAuthentication' }}
                >
                  {getString('authentication')}
                </Text>
              </Container>
              <div>
                <SecretInput name="apiToken" label={getString('connectors.apiToken')} scope={scope} />
              </div>
            </Layout.Vertical>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                variation={ButtonVariation.SECONDARY}
                onClick={() => props?.previousStep?.(prevStepData)}
                data-name="terraformCloudBackButton"
              />
              <Button
                type="submit"
                variation={ButtonVariation.PRIMARY}
                text={getString('continue')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </FormikForm>
        </Formik>
      </Layout.Vertical>
    )
  }

export default StepTerraformCloudAuthentication
