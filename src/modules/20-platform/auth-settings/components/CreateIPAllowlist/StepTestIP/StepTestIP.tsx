/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import { pick, defaultTo } from 'lodash-es'
import { Intent } from '@blueprintjs/core'

import type { StepProps } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import {
  Text,
  FormInput,
  Formik,
  FormikForm,
  Icon,
  Layout,
  Button,
  ButtonVariation,
  Container,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@harness/uicore'
import { validateIpAddressAllowlistedOrNot } from '@harnessio/react-ng-manager-client'
import type { IpAllowlistConfigValidateResponse } from '@harnessio/react-ng-manager-client'

import { regexIpV4orV6 } from '@common/utils/StringUtils'
import type { IIPAllowlistForm } from '@auth-settings/interfaces/IPAllowlistInterface'
import { String, useStrings } from 'framework/strings'
import css from '../CreateIPAllowlistWizard.module.scss'

export type StepTestIPForm = {
  testIP: string
}

interface StepTestIPProps extends StepProps<StepTestIPForm> {
  onClose: () => void
  data: IIPAllowlistForm
  isEditMode: boolean
}

const StepTestIP: React.FC<StepTestIPProps> = props => {
  const { name, onClose, data, prevStepData } = props
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const [validatedResponse, setValidatedResponse] = useState<IpAllowlistConfigValidateResponse>({})

  const onTestIPSubmit = async (formData: any) => {
    modalErrorHandler?.hide()
    try {
      const response = await validateIpAddressAllowlistedOrNot({
        queryParams: { ip_address: formData.testIP, custom_ip_address_block: formData.ipAddress }
      })
      setValidatedResponse(response.content)
    } catch (err) {
      modalErrorHandler?.showDanger(
        defaultTo((err as Error)?.message, getString('authSettings.ipAddress.errorWhileValidating'))
      )
    }
  }

  const getInitialValues = (): StepTestIPForm => {
    return {
      ...pick(data, ['ipAddress']),
      ...(prevStepData && pick(prevStepData, ['ipAddress'])),
      testIP: ''
    }
  }

  const successTestIP = validatedResponse.allowed_for_custom_block === true
  const failTestIP = validatedResponse.allowed_for_custom_block === false
  let intent: Intent = Intent.NONE
  let message = ''
  if (successTestIP) {
    intent = Intent.SUCCESS
    message = getString('authSettings.ipAddress.inRange')
  } else if (failTestIP) {
    intent = Intent.DANGER
    message = getString('authSettings.ipAddress.notInRange')
  }
  return (
    <Layout.Vertical spacing="xxlarge">
      <Text font={{ variation: FontVariation.H3 }}>{name}</Text>
      <Formik<StepTestIPForm>
        formName="testIPForm"
        onSubmit={onTestIPSubmit}
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          testIP: Yup.string()
            .required(getString('authSettings.ipAddress.ipRequired'))
            .matches(regexIpV4orV6, getString('authSettings.ipAddress.ipInvalid')),
          ipAddress: Yup.string().required(getString('authSettings.ipAddress.required'))
        })}
      >
        {() => {
          return (
            <FormikForm className={css.fullHeightDivsWithFlex}>
              <Layout.Vertical spacing="huge" className={css.fieldsContainer}>
                <Container className={css.formElm}>
                  <Layout.Vertical spacing="large">
                    <Container>
                      <ModalErrorHandler bind={setModalErrorHandler} />
                      <Layout.Vertical margin={{ bottom: 'medium' }}>
                        <FormInput.Text
                          name="testIP"
                          label={getString('authSettings.ipAddress.testIPIfInRange')}
                          intent={intent}
                          style={{ marginBottom: 0 }}
                          onChange={() => {
                            setValidatedResponse({}) // resetting
                          }}
                        />
                        {message && (
                          <Text intent={intent} className={css.validateIpMessage}>
                            <Icon
                              name={failTestIP ? 'solid-error' : 'success-tick'}
                              size={15}
                              margin={{ right: 'small' }}
                            />
                            {message}
                          </Text>
                        )}
                      </Layout.Vertical>
                      <Layout.Horizontal spacing="small">
                        <Button type="submit" intent="primary" variation={ButtonVariation.SECONDARY}>
                          <String stringID="test" />
                        </Button>
                      </Layout.Horizontal>
                    </Container>
                    <FormInput.Text
                      disabled
                      label={getString('authSettings.ipAddress.ipAddressCIDR')}
                      name="ipAddress"
                    />
                  </Layout.Vertical>
                </Container>
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => {
                    props?.previousStep?.(props?.prevStepData)
                  }}
                  data-name="back"
                  variation={ButtonVariation.SECONDARY}
                />
                <Button
                  text={getString('finish')}
                  intent="primary"
                  onClick={() => {
                    onClose()
                  }}
                  data-name="finish"
                  variation={ButtonVariation.PRIMARY}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepTestIP
