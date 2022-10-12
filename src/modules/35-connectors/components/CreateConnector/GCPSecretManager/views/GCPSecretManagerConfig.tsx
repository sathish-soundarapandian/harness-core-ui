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
  ButtonVariation
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { setupGCPSecretManagerFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
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
import css from './GCPSecretManagerConfig.module.scss'
const GCPSecretManagerConfig: React.FC<StepProps<StepDetailsProps> & ConnectorDetailsProps> = props => {
  const { accountId, prevStepData, nextStep, previousStep } = props

  const { getString } = useStrings()

  const defaultInitialFormData: GCPSecretManagerFormData = {
    credentialsRef: undefined,
    default: false
  }

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

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Container padding={{ top: 'medium' }}>
      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>

      <Formik
        enableReinitialize
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="gcpSecretManagerForm"
        validationSchema={Yup.object().shape({
          credentialsRef: Yup.object().required(getString('connectors.gcpSecretManager.validation.credFileRequired'))
        })}
        onSubmit={formData => {
          trackEvent(ConnectorActions.ConfigSubmit, {
            category: Category.CONNECTOR,
            connector_type: Connectors.GcpSecretManager
          })
          nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepDetailsProps)
        }}
      >
        {() => {
          return (
            <FormikForm>
              <Container className={css.gcpContainer}>
                <SecretInput
                  name="credentialsRef"
                  label={getString('connectors.gcpSecretManager.gcpSMSecretFile')}
                  connectorTypeContext={'GcpSecretManager'}
                  type="SecretFile"
                />
                <FormInput.CheckBox
                  name="default"
                  label={getString('connectors.hashiCorpVault.defaultVault')}
                  padding={{ left: 'xxlarge' }}
                />
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
