/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect } from 'react'
import {
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  Container,
  StepProps,
  Button,
  ButtonVariation,
  Text,
  Utils
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { illegalIdentifiers } from '@common/utils/StringUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import type { FlagWizardFormValues } from './FlagWizard'
import css from './FlagElemAbout.module.scss'

interface FlagElemAboutProps {
  goBackToTypeSelections: () => void
}

type AboutFormProps = FormikProps<any> & FlagElemAboutProps & { isEdit: boolean }

const AboutForm: FC<AboutFormProps> = props => {
  const { getString } = useStrings()

  return (
    <Form>
      <Container height="100%" className={css.aboutFlagContainer}>
        <Container style={{ flexGrow: 1, overflow: 'auto' }}>
          <Text style={{ fontSize: '18px', color: Color.GREY_700 }} margin={{ bottom: 'xlarge' }}>
            {getString('cf.creationModal.aboutFlag.aboutFlagHeading')}
          </Text>
          <Container margin={{ bottom: 'large' }} width="60%">
            <FormInput.InputWithIdentifier
              inputName="name"
              idName="identifier"
              isIdentifierEditable={true}
              inputGroupProps={{
                placeholder: getString('cf.creationModal.aboutFlag.ffNamePlaceholder'),
                inputGroup: { autoFocus: true }
              }}
            />
            <FormInput.TextArea label={getString('description')} name="description" />
          </Container>
          <Container margin={{ top: 'xlarge' }}>
            <Layout.Horizontal>
              <FormInput.CheckBox name="permanent" label={getString('cf.creationModal.aboutFlag.permaFlag')} />
              <Text
                margin={{ left: 'xsmall' }}
                tooltip={getString('cf.creationModal.aboutFlag.permaFlagTooltip')}
                tooltipProps={{
                  isDark: true,
                  portalClassName: css.tooltipAboutFlag
                }}
                inline
              />
            </Layout.Horizontal>
          </Container>
        </Container>
        <Layout.Horizontal spacing="small" margin={{ top: 'large' }}>
          <Button
            type="button"
            text={getString('back')}
            variation={ButtonVariation.SECONDARY}
            onMouseDown={e => {
              Utils.stopEvent(e)
              props.goBackToTypeSelections()
            }}
          />
          <Button
            type="submit"
            intent="primary"
            rightIcon="chevron-right"
            text={getString('next')}
            variation={ButtonVariation.PRIMARY}
            onClick={() => props.handleSubmit()}
          />
        </Layout.Horizontal>
      </Container>
    </Form>
  )
}

const FlagElemAbout: FC<StepProps<Partial<FlagWizardFormValues>> & FlagElemAboutProps> = props => {
  const { getString } = useStrings()
  const { nextStep, prevStepData, goBackToTypeSelections } = props
  const isEdit = Boolean(prevStepData)

  const { trackEvent } = useTelemetry()

  useEffect(() => {
    if (!isEdit) {
      trackEvent(FeatureActions.AboutTheFlag, {
        category: Category.FEATUREFLAG
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  return (
    <>
      <Formik
        initialValues={{
          name: prevStepData?.name || '',
          identifier: prevStepData?.identifier || '',
          description: prevStepData?.description || '',
          tags: prevStepData?.tags || [],
          permanent: prevStepData?.permanent || false
        }}
        formName="cfFlagElem"
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('cf.creationModal.aboutFlag.nameRequired')),
          identifier: Yup.string()
            .trim()
            .required(getString('cf.creationModal.aboutFlag.idRequired'))
            .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('cf.creationModal.aboutFlag.ffRegex'))
            .notOneOf(illegalIdentifiers)
        })}
        onSubmit={vals => {
          trackEvent(FeatureActions.AboutTheFlagNext, {
            category: Category.FEATUREFLAG,
            data: vals
          })
          nextStep?.({ ...prevStepData, ...vals })
        }}
      >
        {formikProps => <AboutForm {...formikProps} isEdit={isEdit} goBackToTypeSelections={goBackToTypeSelections} />}
      </Formik>
    </>
  )
}

export default FlagElemAbout
