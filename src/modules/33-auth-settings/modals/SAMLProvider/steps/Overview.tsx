import { Container, StepProps, Layout, Button, ButtonVariation, FormInput, FormikForm, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { String, useStrings } from 'framework/strings'
import type { FormValues } from '../utils'
import css from '../useSAMLProvider.module.scss'

type OverviewForm = Pick<FormValues, 'displayName' | 'friendlyName'>

const Overview: React.FC<StepProps<FormValues>> = props => {
  const { getString } = useStrings()

  return (
    <Formik<OverviewForm>
      initialValues={{
        ...(props.prevStepData as OverviewForm)
      }}
      validationSchema={Yup.object().shape({
        displayName: Yup.string().trim().required(getString('common.validation.nameIsRequired')),
        friendlyName: Yup.string().trim()
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
                  placeholder={getString('common.friendlyNamePlaceholder')}
                  name="friendlyName"
                  label={getString('common.friendlyName')}
                  isOptional
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
