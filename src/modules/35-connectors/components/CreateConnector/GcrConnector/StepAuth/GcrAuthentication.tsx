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
  Text,
  FormikForm as Form,
  StepProps,
  Container,
  PageSpinner,
  ThumbnailSelect
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import {
  DelegateTypes,
  DelegateCardInterface,
  setupGCPFormData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import css from '../CreateGcrConnector.module.scss'

interface GcrAuthenticationProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  onConnectorCreated?: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo?: ConnectorInfoDTO | void
}

interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
}

interface GCPFormInterface {
  delegateType?: string
  password: SecretReferenceInterface | void
}
const GcrAuthentication: React.FC<StepProps<StepConfigureProps> & GcrAuthenticationProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const defaultInitialFormData: GCPFormInterface = {
    password: undefined
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

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

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupGCPFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as GCPFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepConfigureProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.secondStep}>
      <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'gcpAuthenticationDetails' }}>
        {getString('details')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...props.prevStepData
        }}
        formName="gcrAuthForm"
        validationSchema={Yup.object().shape({
          delegateType: Yup.string().required(
            getString('connectors.chooseMethodForConnection', { name: Connectors.GCP })
          ),
          password: Yup.object().when('delegateType', {
            is: DelegateTypes.DELEGATE_OUT_CLUSTER,
            then: Yup.object().required(getString('validation.encryptedKey'))
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Container className={css.clusterWrapper}>
              <ThumbnailSelect
                items={DelegateCards.map(card => ({ label: card.info, value: card.type }))}
                name="delegateType"
                size="large"
                onChange={type => {
                  formikProps?.setFieldValue('delegateType', type)
                }}
              />
              {DelegateTypes.DELEGATE_OUT_CLUSTER === formikProps.values.delegateType ? (
                <SecretInput name={'password'} label={getString('encryptedKeyLabel')} type={'SecretFile'} />
              ) : null}
            </Container>
            <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default GcrAuthentication
