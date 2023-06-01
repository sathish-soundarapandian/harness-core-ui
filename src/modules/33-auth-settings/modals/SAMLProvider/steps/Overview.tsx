/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, StepProps, Layout, Button, ButtonVariation, FormInput, FormikForm, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { String, useStrings } from 'framework/strings'
import type { SAMLSettings } from 'services/cd-ng'
import type { FormValues } from '../utils'
import css from '../useSAMLProvider.module.scss'

interface OverviewForm {
  displayName: string
  friendlySamlName?: string
}

interface OverviewProps extends StepProps<FormValues> {
  samlSettings?: SAMLSettings
}

const Overview: React.FC<OverviewProps> = props => {
  const { getString } = useStrings()

  return (
    <Formik<OverviewForm>
      initialValues={{
        ...props.samlSettings,
        ...(props.prevStepData as OverviewForm)
      }}
      validationSchema={Yup.object().shape({
        displayName: Yup.string().trim().required(getString('common.validation.nameIsRequired')),
        friendlySamlName: Yup.string().trim()
      })}
      onSubmit={values => {
        props.nextStep?.({ ...props.prevStepData, ...values } as FormValues)
      }}
    >
      {() => (
        <FormikForm className={css.form}>
          <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Container width={390}>
              <Text font={{ variation: FontVariation.H3 }}>{getString('authSettings.samlProviderOverview')}</Text>
              <Layout.Vertical margin={{ top: 'xlarge' }}>
                <FormInput.Text
                  placeholder={getString('common.namePlaceholder')}
                  name="displayName"
                  label={getString('name')}
                />
                <FormInput.Text
                  placeholder={getString('common.displayNamePlaceHolder')}
                  name="friendlySamlName"
                  label={getString('common.displayName')}
                  isOptional
                  tooltipProps={{ dataTooltipId: 'friendlySamlName' }}
                />
              </Layout.Vertical>
            </Container>
            <Button type="submit" intent="primary" rightIcon="chevron-right" variation={ButtonVariation.PRIMARY}>
              <String stringID="continue" />
            </Button>
          </Layout.Vertical>
        </FormikForm>
      )}
    </Formik>
  )
}

export default Overview
