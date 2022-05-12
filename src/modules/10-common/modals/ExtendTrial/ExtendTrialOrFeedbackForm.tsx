/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Formik, FormikForm, Heading, Container, Text, Layout, Button, FormInput, Tag } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, LicenseActions, FeedbackActions } from '@common/constants/TrackingConstants'
import css from './useExtendTrialOrFeedbackModal.module.scss'

export interface FeedbackFormValues {
  experience?: string
  suggestion?: string
}

interface FeedBackFormProps {
  moduleDescription: string
  onCloseModal: () => void
  onSubmit: (values: FeedbackFormValues) => void
  loading: boolean
}

interface ExtendTrialFormProps {
  expiryDateStr: string
  moduleDescription: string
  onCloseModal: () => void
  onSubmit: (values: FeedbackFormValues) => void
  loading: boolean
}

const enum EXPERIENCE {
  USEFUL = '10',
  NEEDMORE = '5',
  IMPROVE = '0'
}

const Feedback = ({ moduleDescription }: { moduleDescription: string }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Container padding={{ bottom: 'large' }}>
      <FormInput.RadioGroup
        className={css.experience}
        name="experience"
        label={getString('common.extendTrial.feedback.ifUseful', { moduleDescription: moduleDescription })}
        items={[
          {
            label: getString('common.extendTrial.feedback.answers.useful'),
            value: EXPERIENCE.USEFUL
          },
          {
            label: getString('common.extendTrial.feedback.answers.needMore'),
            value: EXPERIENCE.NEEDMORE
          },
          {
            label: getString('common.extendTrial.feedback.answers.improve'),
            value: EXPERIENCE.IMPROVE
          }
        ]}
      />
      <FormInput.TextArea
        className={css.suggestion}
        name="suggestion"
        label={getString('common.extendTrial.feedback.suggestion', { moduleDescription: moduleDescription })}
      />
    </Container>
  )
}

const Footer = ({
  onCloseModal,
  loading,
  hasInput
}: {
  onCloseModal: () => void
  loading: boolean
  hasInput: boolean
}): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="medium">
      <Button intent="primary" text={getString('submit')} type="submit" disabled={loading || !hasInput} />
      <Button
        intent="none"
        text={getString('common.extendTrial.doItLater')}
        type="reset"
        onClick={() => onCloseModal()}
      />
    </Layout.Horizontal>
  )
}

export const FeedBackForm: React.FC<FeedBackFormProps> = ({ onCloseModal, onSubmit, moduleDescription, loading }) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(FeedbackActions.LoadFeedback, {
      category: Category.FEEDBACK
    })
  }, [])
  return (
    <Formik
      initialValues={{
        experience: undefined,
        suggestion: ''
      }}
      onSubmit={onSubmit}
      formName="feedbackForm"
      validationSchema={Yup.object().shape({
        experience: Yup.string().trim().required(getString('validation.thisIsARequiredField'))
      })}
    >
      {formikProps => {
        const hasInput = formikProps.values.experience || formikProps.values.suggestion.trim() !== ''
        return (
          <FormikForm>
            <Heading color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} padding={{ bottom: 'large' }}>
              {`${moduleDescription} ${getString('common.extendTrial.feedback.title')}`}
            </Heading>
            <Feedback moduleDescription={moduleDescription} />
            <Footer onCloseModal={onCloseModal} loading={loading} hasInput={hasInput} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const ExtendTrialForm: React.FC<ExtendTrialFormProps> = ({
  expiryDateStr,
  onCloseModal,
  onSubmit,
  moduleDescription,
  loading
}) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(LicenseActions.LoadExtendedTrial, {
      category: Category.LICENSE
    })
  }, [])
  return (
    <Formik
      initialValues={{
        experience: undefined,
        suggestion: ''
      }}
      onSubmit={onSubmit}
      enableReinitialize={true}
      formName="extendTrialForm"
      validationSchema={Yup.object().shape({
        experience: Yup.string().trim().required(getString('validation.thisIsARequiredField'))
      })}
    >
      {formikProps => {
        const hasInput = formikProps.values.experience || formikProps.values.suggestion.trim() !== ''
        return (
          <FormikForm className={css.extendTrial}>
            <Heading color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} padding={{ bottom: 'large' }}>
              {getString('common.extendTrial.heading')}
            </Heading>
            <Tag round className={css.tag}>
              {getString('common.trialInProgress')}
            </Tag>
            <Text padding={{ top: 'small', bottom: 'large' }} className={css.description}>
              {getString('common.extendTrial.description')}
            </Text>
            <Layout.Horizontal padding={{ bottom: 'large' }}>
              <Text padding={{ right: 'small' }}>{`${getString('common.extendTrial.expiryDate')}:`}</Text>
              <Text color={Color.BLACK}>{expiryDateStr}</Text>
            </Layout.Horizontal>
            <Feedback moduleDescription={moduleDescription} />
            <Footer onCloseModal={onCloseModal} loading={loading} hasInput={hasInput} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
