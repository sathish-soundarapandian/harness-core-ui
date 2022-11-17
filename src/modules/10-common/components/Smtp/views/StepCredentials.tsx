/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  StepProps,
  FormikForm,
  Formik,
  Container,
  Layout,
  FormInput,
  ModalErrorHandlerBinding,
  ButtonVariation,
  getErrorInfoFromErrorObject,
  PageSpinner
} from '@harness/uicore'

import { useParams } from 'react-router-dom'
import { NgSmtpDTO, SmtpConfigDTO, useCreateSmtpConfig, useUpdateSmtp } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CreateSmtpWizardProps, SmtpSharedObj } from '../CreateSmtpWizard'

import { SmtpModalHeader } from './StepDetails'
import css from '../useCreateSmtpModal.module.scss'
export type Details = Pick<SmtpConfigDTO, 'username' | 'password'>

const StepCredentials: React.FC<StepProps<NgSmtpDTO> & SmtpSharedObj & CreateSmtpWizardProps> = ({
  prevStepData,
  nextStep,
  detailsData,
  previousStep,
  isEdit
}) => {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()

  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const { loading: saveSmtpLoading, mutate: createSmtpConfig } = useCreateSmtpConfig({
    queryParams: { accountIdentifier: accountId }
  })
  const { loading: updateSmtpLoading, mutate: updateSmtp } = useUpdateSmtp({
    queryParams: { accountIdentifier: accountId }
  })
  const save = async (data: NgSmtpDTO): Promise<void> => {
    try {
      const uuid = detailsData?.uuid || prevStepData?.uuid
      const returnValue =
        uuid || isEdit
          ? await updateSmtp({ ...data, uuid, accountId }, { headers: { 'content-type': 'application/json' } })
          : await createSmtpConfig({ ...data, accountId }, { headers: { 'content-type': 'application/json' } })

      if (returnValue.status === 'SUCCESS') {
        nextStep?.({ ...data, uuid: returnValue.data?.uuid })
      } else {
        modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(returnValue))
      }
    } catch (err) {
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(err))
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
        if (prevStepData) {
          save({ ...prevStepData, value: { ...prevStepData?.value, ...values } })
        }
      }}
      formName="smtpStepCredentialsForm"
      initialValues={{
        username: prevStepData?.value?.username || detailsData?.value?.username || '',
        password: prevStepData?.value?.password || detailsData?.value?.password || undefined
      }}
    >
      {() => {
        return (
          <>
            {updateSmtpLoading || saveSmtpLoading ? (
              <PageSpinner
                message={isEdit ? getString('common.smtp.updatingSMTP') : getString('common.smtp.savingSMTP')}
              />
            ) : null}
            <Container padding="small" height={570}>
              <SmtpModalHeader
                errorHandler={setModalErrorHandler}
                mainHeading={getString('credentials')}
                subHeading={getString('common.smtp.modalSubHeading')}
              />
              <Container className={css.smtpMdlContainer}>
                <FormikForm>
                  <FormInput.Text name="username" label={getString('username')}></FormInput.Text>
                  <FormInput.Text name="password" inputGroup={{ type: 'password' }} label={getString('password')} />

                  <Layout.Horizontal className={css.buttonPanel} spacing="small">
                    <Button
                      variation={ButtonVariation.TERTIARY}
                      text={getString('previous')}
                      icon="chevron-left"
                      onClick={handlePrev}
                    ></Button>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={getString('saveAndContinue')}
                      disabled={updateSmtpLoading || saveSmtpLoading}
                    />
                  </Layout.Horizontal>
                </FormikForm>
              </Container>
            </Container>
          </>
        )
      }}
    </Formik>
  )
}

export default StepCredentials
