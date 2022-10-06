/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { FormikContextType, useFormikContext } from 'formik'
import { Card, Layout, Text, DropDown, FontVariation, Color, SelectOption, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { BillingContactProps } from '@common/constants/SubscriptionTypes'
import UserLabelBilling from '@auth-settings/pages/Billing/UserLabelBilling'
import type { State, StateByCountryMap } from '@common/hooks/useRegionList'
import css from './BillingInfo.module.scss'

export interface InitialBillingInfo {
  companyName: string
  country: string
  billingAddress: string
  city: string
  state: string
  zipCode: string
}
interface BillingContactProp {
  billingInfo: BillingContactProps
  setBillingInfo: (value: BillingContactProps) => void
  countries: { label: string; value: string }[]
  states: StateByCountryMap
  formik: FormikContextType<InitialBillingInfo>
}

const BillingContact: React.FC<BillingContactProp> = ({ billingInfo, countries, states, setBillingInfo }) => {
  const { getString } = useStrings()
  const { email } = billingInfo
  const formik = useFormikContext<InitialBillingInfo>()
  const statesList = defaultTo(states[formik.values.country], []).map((state: State) => ({
    label: state.name,
    value: state.code
  }))
  return (
    <>
      <Layout.Vertical spacing={'large'}>
        <Card>
          <Text font={{ variation: FontVariation.H5 }}>{getString('authSettings.billingInfo.billingContact')}</Text>
          <Layout.Vertical spacing={'large'}>
            <Layout.Horizontal margin={{ bottom: 'small' }} width={'50%'} className={css.billingContact}>
              <UserLabelBilling name={email || 'dadada'} />
              {/* {isEmail(name) ? <Button text="+ Add your name" variation={ButtonVariation.LINK} /> : null} */}
            </Layout.Horizontal>
            <Layout.Horizontal className={css.billingContact}>
              <Text
                font={{ size: 'small', weight: 'bold' }}
                icon="info"
                iconProps={{ color: Color.PRIMARY_7 }}
                padding="small"
                className={css.warning}
              >
                {getString('authSettings.billingInfo.emailWarning')}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Card>
        <Card>
          <Layout.Vertical spacing={'large'}>
            <Text font={{ variation: FontVariation.H5 }}>{getString('common.billingAddress')}</Text>
            <Layout.Vertical spacing={'large'}>
              <Layout.Horizontal>
                <Layout.Vertical width={'30%'} spacing="small" padding={{ right: 'large' }}>
                  <Text>{getString('common.headerCompanyName')}</Text>
                  <FormInput.Text data-testid="companyName" name="companyName" />
                </Layout.Vertical>
                <Layout.Vertical width={'70%'}>
                  <Text padding={{ bottom: 'small' }}>{getString('common.billingAddress')}</Text>
                  <FormInput.Text data-testid="billingAddress" name="billingAddress" />
                </Layout.Vertical>
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Layout.Vertical width={'30%'} spacing="small" padding={{ right: 'large' }}>
                  <Text>{getString('common.countryOrRegion')}</Text>
                  <DropDown
                    buttonTestId="countryOrRegion"
                    items={countries}
                    value={formik.values.country}
                    className={cx({ [css.errorBorder]: formik.errors.country })}
                    onChange={(item: SelectOption, event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => {
                      event?.stopPropagation()
                      formik.setFieldValue('country', String(item.value))
                      setBillingInfo({
                        ...billingInfo,
                        country: String(item.value)
                      })
                    }}
                  />
                  {formik.errors.country && (
                    <Text icon="circle-cross" iconProps={{ size: 10, color: Color.RED_600 }} color={Color.RED_600}>
                      {formik.errors.country}
                    </Text>
                  )}
                </Layout.Vertical>

                <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'baseline' }} width={'70%'}>
                  <Layout.Vertical width={132} spacing="small">
                    <Text>{getString('common.state')}</Text>
                    <DropDown
                      disabled={isEmpty(formik.values.country)}
                      buttonTestId="state"
                      items={statesList}
                      value={formik.values.state}
                      className={cx({ [css.errorBorder]: formik.errors.state })}
                      onChange={(item: SelectOption, event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => {
                        event?.stopPropagation()
                        formik.setFieldValue('state', String(item.value))
                      }}
                    />
                    {formik.errors.state && (
                      <Text icon="circle-cross" iconProps={{ size: 10, color: Color.RED_600 }} color={Color.RED_600}>
                        {formik.errors.state}{' '}
                      </Text>
                    )}
                  </Layout.Vertical>
                  <Layout.Vertical width={130} spacing="small" padding={{ right: 'large' }}>
                    <Text>{getString('common.city')}</Text>
                    <FormInput.Text data-testid="city" name="city" />
                  </Layout.Vertical>
                  <Layout.Vertical width={130} spacing="small">
                    <Text>{getString('common.zipCode')}</Text>
                    <FormInput.Text data-testid="zipCode" name="zipCode" />
                  </Layout.Vertical>
                </Layout.Horizontal>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Vertical>
        </Card>
      </Layout.Vertical>
    </>
  )
}

export default BillingContact
