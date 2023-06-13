/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, StepProps, FormikForm, Formik, Container, Layout, FormInput, ButtonVariation } from '@harness/uicore'

import * as Yup from 'yup'
import type { NgSmtpDTO, SmtpConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

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
  const handlePrev = (): void => {
    if (prevStepData && previousStep) {
      previousStep({ ...prevStepData })
    }
  }
  return (
    <Formik<Details>
      onSubmit={values => {
        if (prevStepData && nextStep) {
          const uuid = detailsData?.uuid || prevStepData.uuid
          nextStep({
            ...prevStepData,
            ...(isEdit && { uuid }),
            delegateSelectors: prevStepData.value.delegateSelectors,
            value: { ...prevStepData.value, ...values }
          } as any)
        }
      }}
      validationSchema={Yup.object().shape({
        username: Yup.string().trim().required(),
        password: Yup.string().trim().required()
      })}
      formName="smtpStepCredentialsForm"
      initialValues={{
        username: prevStepData?.value?.username || detailsData?.value?.username || '',
        password: prevStepData?.value?.password || detailsData?.value?.password || undefined
      }}
    >
      {() => {
        return (
          <>
            <Container padding="small" height={570}>
              <SmtpModalHeader
                mainHeading={getString('credentials')}
                subHeading={getString('common.smtp.modalSubHeading')}
              />
              <Container className={css.smtpMdlContainer}>
                <FormikForm>
                  <FormInput.Text name="username" label={getString('username')}></FormInput.Text>
                  <FormInput.Text name="password" inputGroup={{ type: 'password' }} label={getString('password')} />

                  <Layout.Horizontal className={css.buttonPanel} spacing="small">
                    <Button
                      variation={ButtonVariation.SECONDARY}
                      text={getString('back')}
                      icon="chevron-left"
                      onClick={handlePrev}
                    ></Button>
                    <Button type="submit" variation={ButtonVariation.PRIMARY} text={getString('continue')} />
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
