/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Text,
  StepProps,
  FormikForm,
  Formik,
  Container,
  Layout,
  FormInput,
  ButtonVariation,
  ModalErrorHandlerBinding,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { NgSmtpDTO, useValidateConnectivity, ValidateConnectivityQueryParams } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CreateSmtpWizardProps, SmtpSharedObj } from '../CreateSmtpWizard'

import { SmtpModalHeader } from './StepDetails'
import css from '../useCreateSmtpModal.module.scss'

export type Details = Pick<ValidateConnectivityQueryParams, 'to' | 'subject' | 'body'>
const StepTestConnection: React.FC<StepProps<NgSmtpDTO> & SmtpSharedObj & CreateSmtpWizardProps> = ({
  prevStepData,
  previousStep,
  hideModal
}) => {
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [mailSent, updateMailSent] = React.useState<boolean>(false)
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const { loading, mutate: validateConnectivity } = useValidateConnectivity({
    queryParams: { accountId, identifier: '', body: '', subject: '', to: '' }
  })
  const test = async (values: Details): Promise<void> => {
    try {
      const returnValue = await validateConnectivity(undefined, {
        queryParams: { ...values, identifier: prevStepData?.uuid || '', accountId },
        headers: { 'content-type': 'application/json' }
      })
      if (returnValue.status === 'SUCCESS') {
        const errMsg = getErrorInfoFromErrorObject(returnValue) || ''
        if (errMsg) {
          modalErrorHandler?.showDanger(errMsg)
        } else if (returnValue.data?.errorMessage) {
          modalErrorHandler?.showDanger(returnValue.data?.errorMessage)
        } else {
          updateMailSent(true)
        }
      } else {
        modalErrorHandler?.showDanger(
          getErrorInfoFromErrorObject(returnValue) || getString('common.smtp.emailSentFail')
        )
        updateMailSent(false)
      }
    } catch (err) {
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(err) || getString('common.smtp.emailSentFail'))
    }
  }

  const handlePrev = (): void => {
    if (prevStepData) {
      previousStep?.({ ...prevStepData })
    }
  }
  return (
    <Formik<Details>
      onSubmit={values => {
        test(values)
      }}
      formName="smtpStepTestConnectionForm"
      validationSchema={Yup.object().shape({
        to: Yup.string()
          .trim()
          .required(getString('common.smtp.validationTo'))
          .email(getString('common.validation.email.format')),
        subject: Yup.string().trim().required(getString('common.smtp.validationSubject')),
        body: Yup.string().trim().required(getString('common.smtp.validationBody'))
      })}
      initialValues={{
        to: '',
        subject: getString('common.smtp.preConfiguredSubject'),
        body: getString('common.smtp.preConfiguredBody')
      }}
    >
      {() => {
        return (
          <Container padding="small" height={570}>
            <SmtpModalHeader
              errorHandler={setModalErrorHandler}
              mainHeading={getString('common.smtp.smtpConnectivity')}
              subHeading={getString('common.smtp.modalSubHeading')}
            />
            <Container className={css.smtpMdlContainer}>
              <FormikForm>
                <FormInput.Text name="to" label={getString('common.smtp.labelTo')}></FormInput.Text>
                <FormInput.Text name="subject" label={getString('common.smtp.labelSubject')}></FormInput.Text>
                <FormInput.Text name="body" label={getString('common.smtp.labelBody')}></FormInput.Text>
                <Button
                  type="submit"
                  disabled={loading}
                  variation={ButtonVariation.SECONDARY}
                  text={getString('test')}
                />
                {mailSent && (
                  <Text
                    margin={{ top: 'medium' }}
                    font={{ variation: FontVariation.H6 }}
                    color={Color.GREEN_500}
                    icon="tick-circle"
                    iconProps={{ size: 14, color: Color.GREEN_500 }}
                  >
                    {getString('common.smtp.emailSent')}
                  </Text>
                )}
                <Layout.Horizontal className={css.buttonPanel} spacing="small">
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('previous')}
                    icon="chevron-left"
                    onClick={handlePrev}
                  ></Button>
                  <Button onClick={hideModal} variation={ButtonVariation.PRIMARY} text={getString('continue')} />
                </Layout.Horizontal>
              </FormikForm>
            </Container>
          </Container>
        )
      }}
    </Formik>
  )
}

export default StepTestConnection
