import React from 'react'
import { StepProps, Layout, Button, ButtonVariation, Label, ThumbnailSelect, FormikForm, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { FormValues, Providers, SAMLProviderType } from '../utils'
import css from '../useSAMLProvider.module.scss'

type SelectProviderForm = Pick<FormValues, 'samlProviderType'>

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
        <Layout.Vertical>
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
  )
}

export default SelectProvider
