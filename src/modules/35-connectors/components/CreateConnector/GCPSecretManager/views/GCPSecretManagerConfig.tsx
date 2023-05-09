/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  StepProps,
  Container,
  Text,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  Button,
  ButtonVariation,
  ThumbnailSelect
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { DelegateCardInterface, setupGCPSecretManagerFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type {
  ConnectorDetailsProps,
  GCPSecretManagerFormData,
  StepDetailsProps
} from '@connectors/interfaces/ConnectorInterface'
import { PageSpinner } from '@common/components'
import { useConnectorWizard } from '@connectors/components/CreateConnectorWizard/ConnectorWizardContext'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { DelegateTypes } from '@common/components/ConnectivityMode/ConnectivityMode'
import css from './GCPSecretManagerConfig.module.scss'
const GCPSecretManagerConfig: React.FC<StepProps<StepDetailsProps> & ConnectorDetailsProps> = props => {
  const { accountId, prevStepData, nextStep, previousStep } = props

  const { PL_USE_CREDENTIALS_FROM_DELEGATE_FOR_GCP_SM } = useFeatureFlags()
  const { getString } = useStrings()

  const defaultInitialFormData: GCPSecretManagerFormData = {
    credentialsRef: undefined,
    default: false,
    assumeCredentialsOnDelegate: undefined,
    delegateType: undefined
  }
  const DelegateCards: DelegateCardInterface[] = [
    {
      type: DelegateTypes.DELEGATE_OUT_CLUSTER,
      info: getString('connectors.GCP.delegateOutClusterInfo')
    },
    {
      type: DelegateTypes.DELEGATE_IN_CLUSTER,
      info: getString('connectors.GCP.delegateInClusterInfo')
    }
  ]
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(props.isEditMode)
  useConnectorWizard({ helpPanel: undefined })
  React.useEffect(() => {
    if (loadingConnectorSecrets && props.isEditMode) {
      if (props.connectorInfo) {
        setupGCPSecretManagerFormData(props.connectorInfo, accountId).then(data => {
          setInitialValues(data as GCPSecretManagerFormData)
          setLoadingConnectorSecrets(false)
        })
      } else {
        setLoadingConnectorSecrets(false)
      }
    }
  }, [loadingConnectorSecrets])

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.ConfigLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.GcpSecretManager
  })

  const scope: ScopedObjectDTO | undefined = props.isEditMode
    ? {
        orgIdentifier: prevStepData?.orgIdentifier,
        projectIdentifier: prevStepData?.projectIdentifier
      }
    : undefined
  const validationSchema = Yup.object().shape({
    assumeCredentialsOnDelegate: Yup.boolean(),
    delegateType: Yup.string().required(
      getString('connectors.chooseMethodForConnection', { name: getString('connectors.title.gcpSecretManager') })
    ),
    credentialsRef: Yup.object().when('delegateType', {
      is: DelegateTypes.DELEGATE_OUT_CLUSTER,
      then: Yup.object().required(getString('connectors.gcpSecretManager.validation.credFileRequired'))
    })
  })
  const validationSchemaWithoutFeatureFlag = Yup.object().shape({
    assumeCredentialsOnDelegate: Yup.boolean(),
    credentialsRef: Yup.object().required(getString('connectors.gcpSecretManager.validation.credFileRequired'))
  })
  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Container padding={{ top: 'medium' }}>
      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>

      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="gcpSecretManagerForm"
        validationSchema={
          PL_USE_CREDENTIALS_FROM_DELEGATE_FOR_GCP_SM ? validationSchema : validationSchemaWithoutFeatureFlag
        }
        onSubmit={formData => {
          trackEvent(ConnectorActions.ConfigSubmit, {
            category: Category.CONNECTOR,
            connector_type: Connectors.GcpSecretManager
          })
          nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepDetailsProps)
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container className={css.gcpContainer}>
                {PL_USE_CREDENTIALS_FROM_DELEGATE_FOR_GCP_SM && (
                  <ThumbnailSelect
                    items={DelegateCards.map(card => ({ label: card.info, value: card.type }))}
                    name="delegateType"
                    size="large"
                    onChange={async type => {
                      await formikProps?.setFieldValue('delegateType', type)
                      formikProps?.setFieldValue(
                        'assumeCredentialsOnDelegate',
                        type === DelegateTypes.DELEGATE_IN_CLUSTER
                      )
                      if (type === DelegateTypes.DELEGATE_IN_CLUSTER) {
                        formikProps?.setFieldValue('credentialsRef', undefined)
                        formikProps?.setFieldValue('default', false)
                      }
                    }}
                  />
                )}
                {!PL_USE_CREDENTIALS_FROM_DELEGATE_FOR_GCP_SM ||
                formikProps.values.delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER ? (
                  <>
                    <SecretInput
                      name="credentialsRef"
                      label={getString('connectors.gcpSecretManager.gcpSMSecretFile')}
                      connectorTypeContext={'GcpSecretManager'}
                      type="SecretFile"
                      scope={scope}
                    />
                    <FormInput.CheckBox
                      name="default"
                      label={getString('connectors.hashiCorpVault.defaultVault')}
                      padding={{ left: 'xxlarge' }}
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

export default GCPSecretManagerConfig
