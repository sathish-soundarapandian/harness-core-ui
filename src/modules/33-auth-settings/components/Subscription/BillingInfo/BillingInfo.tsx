/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Button, ButtonVariation, Container, Formik, FormikForm, Layout, PageError } from '@harness/uicore'
import * as Yup from 'yup'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { SubscribeViews, SubscriptionProps, BillingContactProps } from '@common/constants/SubscriptionTypes'
import { InvoiceDetailDTO, useCreateFfSubscription } from 'services/cd-ng/index'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@auth-settings/utils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { StateByCountryMap } from '@common/hooks/useRegionList'
import BillingContact, { InitialBillingInfo } from './BillingContact'
import { Header } from '../Header'
import css from './BillingInfo.module.scss'

interface BillingInfoProp {
  subscriptionProps: SubscriptionProps
  setView: (view: SubscribeViews) => void
  setInvoiceData: (value?: InvoiceDetailDTO) => void
  setSubscriptionProps: (props: SubscriptionProps) => void
  className?: string
  countries: { label: string; value: string }[]
  states: StateByCountryMap
}

export const BillingInfo: React.FC<BillingInfoProp> = ({
  subscriptionProps,
  setSubscriptionProps,
  setInvoiceData,
  setView,
  className,
  countries,
  states
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const handleBack = (): void => setView(SubscribeViews.CALCULATE)
  const { getString } = useStrings()

  const initValues = useMemo((): InitialBillingInfo => {
    const { companyName, country, billingAddress, city, state, zipCode } = subscriptionProps.billingContactInfo
    return { companyName, country, billingAddress, city, state, zipCode }
  }, [])

  const [err, setErr] = useState<string>()

  const { mutate: createFFNewSubscription, loading: creatingNewSubscription } = useCreateFfSubscription({
    queryParams: { accountIdentifier: accountId }
  })

  async function createNewSubscription(data?: InitialBillingInfo, update?: boolean): Promise<string | undefined> {
    try {
      let res

      if (!update) {
        setSubscriptionProps({ ...subscriptionProps, subscriptionId: '' })
        setInvoiceData(undefined)
        const sampleMultiplier = subscriptionProps.sampleDetails?.sampleMultiplier
        const numberOfMau =
          defaultTo(subscriptionProps.quantities?.featureFlag?.numberOfMau, 0) * defaultTo(sampleMultiplier, 0)
        // TODO: add a function to return create subscription function based of module
        res = await createFFNewSubscription({
          accountId,
          edition: subscriptionProps.edition,
          paymentFreq: subscriptionProps.paymentFreq,
          premiumSupport: subscriptionProps.premiumSupport,
          ...subscriptionProps.quantities?.featureFlag,
          numberOfMau,
          customer: {
            address: {
              postalCode: data?.zipCode,
              line1: data?.billingAddress,
              city: data?.city,
              country: data?.country,
              state: data?.state
            },
            billingEmail: subscriptionProps.billingContactInfo.email,
            companyName: subscriptionProps.billingContactInfo.companyName
          }
        })
      } else {
        // res = await updateSubscription({ customerId: '', data: {} })
      }
      setErr('')
      return res?.data?.subscriptionId
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setErr(errorMessage)
      throw new Error(errorMessage)
    }
  }
  const updateSubscriptionProps = (values: InitialBillingInfo, subscriptionId?: string): void => {
    setSubscriptionProps({
      ...subscriptionProps,
      ...(subscriptionId ? { subscriptionId } : {}),
      billingContactInfo: {
        ...subscriptionProps.billingContactInfo,
        country: values.country,
        billingAddress: values.billingAddress,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        companyName: values.companyName
      }
    })
    setView(SubscribeViews.PAYMENT_METHOD)
  }
  if (creatingNewSubscription) {
    return <ContainerSpinner />
  }

  return (
    <Formik
      validateOnChange={false}
      initialValues={initValues}
      validationSchema={Yup.object().shape({
        country: Yup.string().required(getString('common.banners.trial.contactSalesForm.countryValidation')),
        billingAddress: Yup.string().required(getString('authSettings.billingInfo.formikErrors.address')),
        city: Yup.string().required(getString('authSettings.billingInfo.formikErrors.city')),
        state: Yup.string().required(getString('authSettings.billingInfo.formikErrors.state')),
        zipCode: Yup.string().required(getString('authSettings.billingInfo.formikErrors.zipCode')),
        companyName: Yup.string().required(getString('authSettings.billingInfo.formikErrors.company'))
      })}
      onSubmit={(values: InitialBillingInfo): void => {
        createNewSubscription(values).then((subscriptionId?: string) => {
          updateSubscriptionProps(values, subscriptionId)
        })
      }}
      formName="subscriptionUserInfo"
    >
      {formik => (
        <FormikForm>
          {err && !subscriptionProps.subscriptionId ? (
            <Container width={300}>
              <PageError message={err} onClick={formik.submitForm} />
            </Container>
          ) : (
            <Layout.Vertical className={className}>
              <Header step={1} />
              <Layout.Vertical padding={{ top: 'small', bottom: 'large' }} spacing={'large'} className={css.body}>
                <BillingContact
                  formik={formik}
                  countries={countries}
                  states={states}
                  billingInfo={subscriptionProps.billingContactInfo}
                  setBillingInfo={(value: BillingContactProps) => {
                    setSubscriptionProps({
                      ...subscriptionProps,
                      billingContactInfo: value
                    })
                  }}
                />
              </Layout.Vertical>
              <Layout.Horizontal spacing="small">
                <Button variation={ButtonVariation.SECONDARY} onClick={handleBack} icon="chevron-left">
                  {getString('back')}
                </Button>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  onClick={() => formik.handleSubmit()}
                  rightIcon="chevron-right"
                >
                  {getString('authSettings.billing.next')}
                </Button>
              </Layout.Horizontal>
            </Layout.Vertical>
          )}
        </FormikForm>
      )}
    </Formik>
  )
}
