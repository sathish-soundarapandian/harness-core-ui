/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Color } from '@harness/design-system'
import { Layout, Button, Text, FormInput, FormikForm, Container } from '@wings-software/uicore'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import noop from 'lodash/noop'
import { useStrings } from 'framework/strings'
import { buildELKPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import {
  ConnectorSecretField,
  ConnectorSecretFieldProps
} from '../CommonCVConnector/components/ConnectorSecretField/ConnectorSecretField'
import { initializeElkConnector } from './utils'
import { StepDetailsHeader } from '../CommonCVConnector/components/CredentialsStepHeader/CredentialsStepHeader'
import { Connectors, ElkAuthType, ELKConnectorFields, getELKAuthType } from '../../../constants'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import styles from './CreateElkConnector.module.scss'

interface UsernamePasswordAndApiKeyOptionProps extends Omit<ConnectorSecretFieldProps, 'secretInputProps'> {
  onAuthTypeChange: (authType: string) => void
  authTypeValue?: string
}

function UsernamePasswordAndApiKeyOption(props: UsernamePasswordAndApiKeyOptionProps): JSX.Element {
  const {
    onAuthTypeChange,
    authTypeValue,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    onSuccessfulFetch,
    secretFieldValue
  } = props
  const { getString } = useStrings()
  const authOptions = useMemo(() => getELKAuthType(getString), [getString])

  const fieldProps =
    authTypeValue === ElkAuthType.API_CLIENT_TOKEN
      ? [
          {
            name: 'apiKeyId',
            label: getString('connectors.elk.apiId'),
            key: 'apiKeyId'
          },
          {
            name: 'apiKeyRef',
            label: getString('common.apikey'),
            key: 'apiKeyRef'
          }
        ]
      : authTypeValue === ElkAuthType.USERNAME_PASSWORD
      ? [
          { name: ELKConnectorFields.USERNAME, label: getString('username'), key: 'username' },
          { name: ELKConnectorFields.PASSWORD, label: getString('password'), key: 'password' }
        ]
      : null

  return (
    <Container>
      <Container flex style={{ alignItems: 'baseline' }}>
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {getString('authentication')}
        </Text>
        <FormInput.Select
          name="authType"
          items={authOptions}
          className={commonStyles.authTypeSelect}
          onChange={updatedAuth => onAuthTypeChange(updatedAuth.value as string)}
        />
      </Container>
      {fieldProps && (
        <>
          <FormInput.Text {...fieldProps[0]} />
          <ConnectorSecretField
            secretInputProps={fieldProps[1]}
            accountIdentifier={accountIdentifier}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            secretFieldValue={secretFieldValue}
            onSuccessfulFetch={onSuccessfulFetch}
          />
        </>
      )}
    </Container>
  )
}

function ElkConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { getString } = useStrings()
  const { nextStep = noop, prevStepData, connectorInfo, accountId, projectIdentifier, orgIdentifier } = props
  const initialValues = initializeElkConnector({
    prevStepData,
    projectIdentifier,
    accountId,
    orgIdentifier
  })
  const handleSubmit = (formData: ConnectorConfigDTO) => {
    trackEvent(ConnectorActions.CreateConnectorSubmit, {
      category: Category.CONNECTOR,
      connector_type: Connectors.ELK
    })
    nextStep({ ...connectorInfo, ...prevStepData, ...formData })
  }

  const { spec, ...prevData } = props.prevStepData || {}

  let secretFieldValue: undefined | string
  if (initialValues.authType === ElkAuthType.USERNAME_PASSWORD) {
    secretFieldValue = prevData?.password?.referenceString || spec?.passwordRef
  } else if (initialValues.authType === ElkAuthType.API_CLIENT_TOKEN) {
    secretFieldValue = prevData?.apiKeyRef?.referenceString || spec?.apiKeyRef
  }

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.CreateConnectorLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.ELK
  })

  const onAuthTypeChange = (updatedAuth: string, formikProps: FormikProps<any>): void => {
    if (updatedAuth === ElkAuthType.API_CLIENT_TOKEN) {
      formikProps.setValues({
        ...formikProps.values,
        authType: updatedAuth,
        username: null,
        password: null
      })
    } else if (updatedAuth === ElkAuthType.USERNAME_PASSWORD) {
      formikProps.setValues({
        ...formikProps.values,
        authType: updatedAuth,
        clientId: null,
        clientSecretRef: null
      })
    }
  }

  return (
    <>
      <StepDetailsHeader connectorTypeLabel={getString('connectors.elk.elkLabel')} />
      <Formik
        enableReinitialize
        initialValues={{
          ...initialValues
        }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('UrlLabel')),
          authType: Yup.string().trim(),
          username: Yup.string()
            .nullable()
            .when('authType', {
              is: ElkAuthType.USERNAME_PASSWORD,
              then: Yup.string().required(getString('validation.username'))
            }),
          password: Yup.string()
            .nullable()
            .when('authType', {
              is: ElkAuthType.USERNAME_PASSWORD,
              then: Yup.string().required(getString('validation.password'))
            }),
          apiKeyId: Yup.string()
            .nullable()
            .when('authType', {
              is: ElkAuthType.API_CLIENT_TOKEN,
              then: Yup.string().required(getString('connectors.elk.validation.apiKeyId'))
            }),
          apiKeyRef: Yup.string()
            .nullable()
            .when('authType', {
              is: ElkAuthType.API_CLIENT_TOKEN,
              then: Yup.string().required(getString('connectors.elk.validation.apiKeyRef'))
            })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <FormikForm className={styles.connectionForm}>
            <Layout.Vertical spacing="large" className={styles.elkContainer}>
              <FormInput.Text label={getString('UrlLabel')} name="url" />
              <UsernamePasswordAndApiKeyOption
                accountIdentifier={props.accountId}
                projectIdentifier={props.projectIdentifier}
                orgIdentifier={props.orgIdentifier}
                secretFieldValue={secretFieldValue}
                onSuccessfulFetch={result => {
                  if (initialValues.authType === ElkAuthType.API_CLIENT_TOKEN) {
                    formikProps.setFieldValue('apiKeyRef', result)
                  } else if (initialValues.authType === ElkAuthType.USERNAME_PASSWORD) {
                    formikProps.setFieldValue('password', result)
                  }
                }}
                authTypeValue={formikProps.values.authType}
                onAuthTypeChange={updatedAuth => onAuthTypeChange(updatedAuth, formikProps)}
              />
            </Layout.Vertical>
            <Layout.Horizontal spacing="large">
              <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
              <Button type="submit" intent="primary" text={getString('continue')} />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </>
  )
}

export default cvConnectorHOC({
  connectorType: Connectors.ELK,
  ConnectorCredentialsStep: ElkConfigStep,
  buildSubmissionPayload: buildELKPayload
})
