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
  ButtonVariation,
  PageSpinner
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { get } from 'lodash-es'

import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { setupBambooFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference.types'

import css from '../CreateBambooConnector.module.scss'

interface StepBambooAuthenticationProps extends ConnectorInfoDTO {
  isEditMode?: boolean
}

interface BambooAuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo?: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

export interface BambooFormInterface {
  bambooUrl: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
}

const defaultInitialFormData: BambooFormInterface = {
  bambooUrl: '',
  username: undefined,
  password: undefined
}

const StepBambooAuthentication: React.FC<StepProps<StepBambooAuthenticationProps> & BambooAuthenticationProps> =
  props => {
    const { getString } = useStrings()
    const { prevStepData, nextStep, accountId, connectorInfo, isEditMode } = props
    const [initialValues, setInitialValues] = useState(defaultInitialFormData)
    const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(props.isEditMode)
    useEffect(() => {
      if (loadingConnectorSecrets && isEditMode && connectorInfo) {
        setupBambooFormData(connectorInfo, accountId).then(data => {
          setInitialValues(data as BambooFormInterface)
          setLoadingConnectorSecrets(false)
        })

        setInitialValues(defaultInitialFormData)
      }
    }, [loadingConnectorSecrets, connectorInfo, isEditMode])

    const handleSubmit = (formData: ConnectorConfigDTO) => {
      if (nextStep) {
        nextStep({ ...props.connectorInfo, ...prevStepData, ...formData } as StepBambooAuthenticationProps)
      }
    }

    const scope: ScopedObjectDTO | undefined = props.isEditMode
      ? {
          orgIdentifier: get(prevStepData, 'orgIdentifier', ''),
          projectIdentifier: get(prevStepData, 'projectIdentifier', '')
        }
      : undefined

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
          formName="bambooAuthForm"
          validationSchema={Yup.object().shape({
            bambooUrl: Yup.string()
              .trim()
              .required(
                getString('common.validation.fieldIsRequired', { name: getString('connectors.bamboo.bambooUrl') })
              ),
            username: Yup.string().trim().required(getString('validation.username')),

            password: Yup.string().trim().required(getString('validation.password'))
          })}
          onSubmit={handleSubmit}
        >
          {formikProps => (
            <>
              <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.secondStep} width={'64%'}>
                <FormInput.Text
                  name="bambooUrl"
                  placeholder={getString('UrlLabel')}
                  label={getString('connectors.bamboo.bambooUrl')}
                />
                <Container className={css.authHeaderRow}>
                  <Text
                    font={{ variation: FontVariation.H6 }}
                    inline
                    tooltipProps={{ dataTooltipId: 'bambooConnectorAuthentication' }}
                  >
                    {getString('authentication')}
                  </Text>
                </Container>
                <>
                  <TextReference
                    name="username"
                    stringId="username"
                    type={formikProps.values.username ? get(formikProps.values.username, 'type', '') : ValueType.TEXT}
                  />
                  <SecretInput name={'password'} label={getString('password')} scope={scope} />
                </>
              </Layout.Vertical>
              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => {
                    if (props.previousStep) {
                      props.previousStep(get(props, 'prevStepData', undefined))
                    }
                  }}
                  data-name="bambooBackButton"
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

export default StepBambooAuthentication
