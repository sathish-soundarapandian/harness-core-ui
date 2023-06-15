/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  StepProps,
  Layout,
  Button,
  ButtonVariation,
  Label,
  ThumbnailSelect,
  FormikForm,
  Text,
  Heading
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { FormValues, Providers, SAMLProviderType } from '../utils'
import css from '../useSAMLProvider.module.scss'

interface SelectProviderForm {
  samlProviderType?: Providers
}

const SelectProvider: React.FC<StepProps<FormValues>> = props => {
  const { getString } = useStrings()

  const SAMLProviderTypes: SAMLProviderType[] = [
    {
      value: Providers.AZURE,
      label: getString('authSettings.azure'),
      icon: 'service-azure'
    },
    {
      value: Providers.OKTA,
      label: getString('authSettings.okta'),
      icon: 'service-okta'
    },
    {
      value: Providers.ONE_LOGIN,
      label: getString('authSettings.oneLogin'),
      icon: 'service-onelogin'
    },
    {
      value: Providers.OTHER,
      label: getString('common.other'),
      icon: 'main-more'
    }
  ]

  return (
    <Layout.Horizontal height="100%">
      <Formik<SelectProviderForm>
        initialValues={{
          samlProviderType: props.prevStepData?.samlProviderType
        }}
        validationSchema={Yup.object().shape({
          samlProviderType: Yup.string().trim().required(getString('common.validation.nameIsRequired'))
        })}
        onSubmit={values => {
          props.nextStep?.({ ...props.prevStepData, ...values } as FormValues)
        }}
      >
        <FormikForm className={css.form}>
          <Layout.Vertical width={400}>
            <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.H3 }}>
              {getString('authSettings.selectProvider')}
            </Text>
            <Layout.Vertical
              spacing="small"
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.flex}
            >
              <Layout.Vertical>
                <Label>{getString('authSettings.selectSAMLProvider')}</Label>
                <ThumbnailSelect name="samlProviderType" items={SAMLProviderTypes} />
              </Layout.Vertical>
              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => props?.previousStep?.({ ...props.prevStepData } as FormValues)}
                  data-name="awsBackButton"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('continue')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Vertical>
        </FormikForm>
      </Formik>
      <Layout.Vertical
        width={290}
        padding={{ left: 'xxxlarge', top: 'xxxlarge' }}
        margin={{ bottom: 'large' }}
        border={{ left: true }}
      >
        <Heading level={6} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
          {getString('authSettings.friendlyReminder')}
        </Heading>
        <Text color={Color.GREY_800} font={{ size: 'small' }} margin={{ bottom: 'xxlarge' }} className={css.notes}>
          {getString('authSettings.friendlyReminderDescription')}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default SelectProvider
