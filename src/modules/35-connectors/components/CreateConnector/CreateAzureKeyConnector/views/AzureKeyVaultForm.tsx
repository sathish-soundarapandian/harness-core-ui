/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'

import {
  StepProps,
  Container,
  Text,
  Formik,
  FormikForm,
  Layout,
  Button,
  ButtonVariation,
  ThumbnailSelect
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { AzureKeyVaultConnectorDTO } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import {
  setupAzureKeyVaultFormData,
  getDelegateCards,
  AzureManagedIdentityTypes,
  AzureEnvironments
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { DelegateTypes } from '@common/components/ConnectivityMode/ConnectivityMode'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { StepDetailsProps, ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import { useConnectorWizard } from '@connectors/components/CreateConnectorWizard/ConnectorWizardContext'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import AzureKeyVaultFormFields from './AzureKeyVaultFormFields'
import AzureKeyVaultFormFieldsForDelegateInCluster from './AzureKeyVaultFormFieldsForDelegateInCluster'
import css from '../CreateAzureKeyVaultConnector.module.scss'

export interface AzureKeyVaultFormData {
  clientId?: string
  secretKey?: SecretReference
  tenantId?: string
  subscription?: string
  default?: boolean
  delegateType?: string
  managedIdentity?: string
  azureEnvironmentType?: string
}

const AzureKeyVaultForm: React.FC<StepProps<StepDetailsProps> & ConnectorDetailsProps> = props => {
  const { prevStepData, previousStep, isEditMode, nextStep, connectorInfo, accountId } = props
  const { getString } = useStrings()

  const DelegateCards = getDelegateCards(getString)

  const requiredString = 'common.validation.fieldIsRequired'

  const defaultInitialFormData: AzureKeyVaultFormData = {
    clientId: undefined,
    tenantId: undefined,
    subscription: undefined,
    secretKey: undefined,
    default: false,
    delegateType: undefined,
    managedIdentity: AzureManagedIdentityTypes.SYSTEM_MANAGED,
    azureEnvironmentType: AzureEnvironments.AZURE_GLOBAL
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)

  useConnectorWizard({
    helpPanel: { referenceId: 'AzureKeyVaultDetails', contentWidth: 1180 }
  })

  React.useEffect(() => {
    if (isEditMode && connectorInfo) {
      setupAzureKeyVaultFormData(connectorInfo, accountId).then(data => {
        setInitialValues(data as AzureKeyVaultFormData)
        setLoadingFormData(false)
      })
    }
  }, [isEditMode, connectorInfo])

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.AzureKeyValueFormLoad, {
    category: Category.CONNECTOR
  })

  return (
    <Layout.Vertical spacing="medium" className={css.step}>
      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      <Formik<AzureKeyVaultFormData>
        formName="azureKeyVaultForm"
        enableReinitialize
        initialValues={{ ...initialValues, ...prevStepData }}
        validationSchema={Yup.object().shape({
          clientId: Yup.string()
            .when('delegateType', {
              is: DelegateTypes.DELEGATE_OUT_CLUSTER,
              then: Yup.string().required(getString('common.validation.clientIdIsRequired'))
            })
            .when(['delegateType', 'managedIdentity'], {
              is: (delegateType, managedIdentity) => {
                return (
                  delegateType === DelegateTypes.DELEGATE_IN_CLUSTER &&
                  managedIdentity === AzureManagedIdentityTypes.USER_MANAGED
                )
              },
              then: Yup.string().required(getString('common.validation.clientIdIsRequired'))
            }),
          tenantId: Yup.string().when('delegateType', {
            is: DelegateTypes.DELEGATE_OUT_CLUSTER,
            then: Yup.string().required(getString('connectors.azureKeyVault.validation.tenantId'))
          }),
          subscription: Yup.string().required(getString('connectors.azureKeyVault.validation.subscription')),
          secretKey: Yup.string().when(['delegateType', 'vaultName'], {
            is: delegateType => {
              return (
                delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER &&
                !(prevStepData?.spec as AzureKeyVaultConnectorDTO)?.vaultName
              )
            },
            then: Yup.string().trim().required(getString('common.validation.keyIsRequired'))
          }),
          azureEnvironmentType: Yup.string().when('delegateType', {
            is: DelegateTypes.DELEGATE_IN_CLUSTER,
            then: Yup.string().required(
              getString(requiredString, {
                name: getString('environment')
              })
            )
          }),
          managedIdentity: Yup.string().when('delegateType', {
            is: DelegateTypes.DELEGATE_IN_CLUSTER,
            then: Yup.string().required(
              getString(requiredString, {
                name: getString('connectors.azure.managedIdentity')
              })
            )
          })
        })}
        onSubmit={formData => {
          trackEvent(ConnectorActions.AzureKeyValueFormSubmit, {
            category: Category.CONNECTOR
          })
          nextStep?.({ ...connectorInfo, ...prevStepData, ...formData } as StepDetailsProps)
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container className={css.wrapper} margin={{ top: 'medium', bottom: 'xxlarge' }}>
                <ThumbnailSelect
                  items={DelegateCards.map(card => ({ label: card.info, value: card.type }))}
                  name="delegateType"
                  size="large"
                />
                <Container className={css.formElm}>
                  {DelegateTypes.DELEGATE_OUT_CLUSTER === formikProps.values.delegateType ? (
                    <AzureKeyVaultFormFields />
                  ) : null}
                  {DelegateTypes.DELEGATE_IN_CLUSTER === formikProps.values.delegateType ? (
                    <AzureKeyVaultFormFieldsForDelegateInCluster formikProps={formikProps} />
                  ) : null}
                </Container>
              </Container>
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  text={getString('back')}
                  onClick={() => previousStep?.(prevStepData)}
                />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  text={getString('continue')}
                  disabled={loadingFormData}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
      {loadingFormData ? <PageSpinner /> : null}
    </Layout.Vertical>
  )
}

export default AzureKeyVaultForm
