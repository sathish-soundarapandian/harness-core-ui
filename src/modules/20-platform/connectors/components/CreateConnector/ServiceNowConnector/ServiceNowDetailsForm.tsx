/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  FormInput,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  ButtonVariation,
  PageSpinner,
  Container,
  SelectOption
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import type { ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { setupServiceNowFormData, useGetHelpPanel } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Connectors } from '@connectors/constants'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'

import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from './ServiceNowConnector.module.scss'
interface ServiceNowFormData {
  serviceNowUrl: string
  authType: string
  username: TextReferenceInterface | void
  passwordRef: SecretReferenceInterface | void
  resourceIdRef: SecretReferenceInterface | void
  clientIdRef: SecretReferenceInterface | void
  certificateRef: SecretReferenceInterface | void
  privateKeyRef: SecretReferenceInterface | void
  adfsUrl: string
}

interface AuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface ServiceNowFormProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

const defaultInitialFormData: ServiceNowFormData = {
  serviceNowUrl: '',
  authType: AuthTypes.USER_PASSWORD,
  username: undefined,
  passwordRef: undefined,
  resourceIdRef: undefined,
  clientIdRef: undefined,
  certificateRef: undefined,
  privateKeyRef: undefined,
  adfsUrl: ''
}

const ServiceNowDetailsForm: React.FC<StepProps<ServiceNowFormProps> & AuthenticationProps> = props => {
  const { prevStepData, nextStep, accountId } = props
  const [, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding | undefined>()
  const [initialValues, setInitialValues] = React.useState(defaultInitialFormData)
  const [loadConnector] = React.useState(false)

  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = React.useState(true && props.isEditMode)
  const { getString } = useStrings()

  const authOptions: SelectOption[] = React.useMemo(
    () => [
      {
        label: getString('connectors.serviceNow.usernamePasswordAPIKey'),
        value: AuthTypes.USER_PASSWORD
      },
      {
        label: getString('connectors.serviceNow.adfs'),
        value: AuthTypes.ADFS
      }
    ],
    []
  )

  React.useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupServiceNowFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as ServiceNowFormData)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setInitialValues(prevStepData as any)
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])
  useGetHelpPanel('ServiceNowConnectorDetails', 1100)

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.DetailsStepLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.ServiceNow
  })

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical spacing="small" className={css.secondStep}>
      <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'serviceNowConnectorDetails' }}>
        {getString('details')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="serviceNowDetailsForm"
        validationSchema={Yup.object().shape({
          serviceNowUrl: Yup.string()
            .trim()
            .required(getString('connectors.validation.serviceNowUrl'))
            .url(getString('validation.urlIsNotValid')),
          authType: Yup.string().trim().required(getString('validation.authType')),
          username: Yup.string().when('authType', {
            is: val => val === AuthTypes.USER_PASSWORD,
            then: Yup.string().trim().required(getString('validation.username')),
            otherwise: Yup.string().nullable()
          }),
          passwordRef: Yup.object().when('authType', {
            is: val => val === AuthTypes.USER_PASSWORD,
            then: Yup.object().required(getString('validation.password')),
            otherwise: Yup.object().nullable()
          }),
          resourceIdRef: Yup.object().when('authType', {
            is: val => val === AuthTypes.ADFS,
            then: Yup.object().required(getString('connectors.validation.resourceID')),
            otherwise: Yup.object().nullable()
          }),
          clientIdRef: Yup.object().when('authType', {
            is: val => val === AuthTypes.ADFS,
            then: Yup.object().required(getString('connectors.validation.clientID')),
            otherwise: Yup.object().nullable()
          }),
          certificateRef: Yup.object().when('authType', {
            is: val => val === AuthTypes.ADFS,
            then: Yup.object().required(getString('connectors.validation.certificate')),
            otherwise: Yup.object().nullable()
          }),
          privateKeyRef: Yup.object().when('authType', {
            is: val => val === AuthTypes.ADFS,
            then: Yup.object().required(getString('connectors.validation.privateKey')),
            otherwise: Yup.object().nullable()
          }),
          adfsUrl: Yup.string().when('authType', {
            is: val => val === AuthTypes.ADFS,
            then: Yup.string()
              .trim()
              .required(getString('connectors.validation.adfsUrl'))
              .url(getString('validation.urlIsNotValid')),
            otherwise: Yup.string().nullable()
          })
        })}
        onSubmit={stepData => {
          trackEvent(ConnectorActions.DetailsStepSubmit, {
            category: Category.CONNECTOR,
            connector_type: Connectors.ServiceNow
          })
          nextStep?.({ ...props.connectorInfo, ...prevStepData, ...stepData } as ServiceNowFormProps)
        }}
      >
        {formik => {
          return (
            <>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Layout.Vertical padding={{ top: 'large', bottom: 'large' }}>
                <FormInput.Text
                  name="serviceNowUrl"
                  placeholder={getString('UrlLabel')}
                  label={getString('connectors.serviceNow.serviceNowUrl')}
                  className={css.detailsFormWidth}
                />
                <Container className={cx(css.authContainer, css.detailsFormWidth)}>
                  <Text font={{ variation: FontVariation.H6 }} inline margin={{ bottom: 'small', right: 'small' }}>
                    {getString('authentication')}
                  </Text>
                  <FormInput.Select
                    name="authType"
                    items={authOptions}
                    disabled={false}
                    className={commonStyles.authTypeSelectLarge}
                  />
                </Container>
                {formik.values.authType === AuthTypes.USER_PASSWORD ? (
                  <Container className={css.detailsFormWidth}>
                    <TextReference
                      name="username"
                      stringId="username"
                      type={formik.values.username ? formik.values.username?.type : ValueType.TEXT}
                    />
                    <SecretInput name={'passwordRef'} label={getString('connectors.apiKeyOrPassword')} />
                  </Container>
                ) : null}
                {formik.values.authType === AuthTypes.ADFS ? (
                  <>
                    <Layout.Horizontal>
                      <Layout.Vertical className={css.detailsFormWidth} margin={{ right: 'xxlarge' }}>
                        <SecretInput
                          name={'resourceIdRef'}
                          label={getString('connectors.serviceNow.resourceID')}
                          isMultiTypeSelect
                        />
                        <SecretInput
                          name={'certificateRef'}
                          label={getString('common.certificate')}
                          isMultiTypeSelect
                        />
                      </Layout.Vertical>
                      <Layout.Vertical className={css.detailsFormWidth}>
                        <SecretInput
                          name={'clientIdRef'}
                          label={getString('connectors.serviceNow.clientID')}
                          isMultiTypeSelect
                        />
                        <SecretInput
                          name={'privateKeyRef'}
                          label={getString('connectors.serviceNow.privateKey')}
                          isMultiTypeSelect
                        />
                      </Layout.Vertical>
                    </Layout.Horizontal>
                    <FormInput.Text
                      name="adfsUrl"
                      placeholder={getString('UrlLabel')}
                      label={getString('connectors.serviceNow.adfsUrl')}
                      className={css.detailsFormWidth}
                    />
                  </>
                ) : null}
              </Layout.Vertical>

              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => props?.previousStep?.(props?.prevStepData)}
                  data-name="serviceNowBackButton"
                />
                <Button
                  type="submit"
                  onClick={formik.submitForm}
                  variation={ButtonVariation.PRIMARY}
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  disabled={loadConnector}
                />
              </Layout.Horizontal>
            </>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default ServiceNowDetailsForm
