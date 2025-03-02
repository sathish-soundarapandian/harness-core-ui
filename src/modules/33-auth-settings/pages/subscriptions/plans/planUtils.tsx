/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { Layout, Text, Button, ButtonVariation, Popover } from '@harness/uicore'
import { Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { Editions } from '@common/constants/SubscriptionTypes'
import type { EditionActionDTO } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import type { PlansFragment, Maybe } from 'services/common/services'
import { TimeType } from '@common/constants/SubscriptionTypes'
import RbacButton from '@rbac/components/Button/Button'
import type { PlanCalculatedProps, BtnProps } from './PlanContainer'
import css from './Plan.module.scss'

export type PlanProp = Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>

export interface PlanData {
  planProps: PlanProp
  btnProps?: BtnProps[]
  currentPlanProps?: {
    isCurrentPlan?: boolean
    isTrial?: boolean
    isPaid?: boolean
  }
}

interface GetBtnPropsProps {
  plan: PlanProp
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  handleStartPlan: (planEdition: Editions) => Promise<void> | void
  handleContactSales: () => void
  handleManageSubscription: () => void
  handleUpgrade: () => void
  btnLoading: boolean
  actions?: {
    [key: string]: EditionActionDTO[]
  }
  isSelfServiceEnabled: boolean
}

export function getBtnProps({
  plan,
  getString,
  handleStartPlan,
  handleContactSales,
  handleManageSubscription,
  handleUpgrade,
  btnLoading,
  actions,
  isSelfServiceEnabled
}: GetBtnPropsProps): PlanCalculatedProps['btnProps'] {
  const btnProps: BtnProps[] = []
  const planEdition = plan?.title && (plan?.title?.toUpperCase() as Editions)
  let planActions = (planEdition && actions?.[planEdition]) || []
  // for March's launch, we hide manage subscription, upgrade, subscribe until the functions are fullfilled
  if (!isSelfServiceEnabled) {
    planActions = planActions.filter(
      action => action.action && !['MANAGE', 'SUBSCRIBE', 'UPGRADE'].includes(action.action)
    )
  }

  planActions.forEach(action => {
    let onClick,
      order,
      planDisabledStr: string | undefined,
      isContactSales: boolean | undefined,
      isContactSupport: boolean | undefined
    const buttonText =
      action.action && PLAN_BTN_ACTIONS[action.action] && getString(PLAN_BTN_ACTIONS[action.action] as keyof StringsMap)
    switch (action.action) {
      case 'START_FREE':
        order = 0
        onClick = () => planEdition && handleStartPlan(planEdition)
        break
      case 'MANAGE':
        order = 0
        onClick = handleManageSubscription
        break
      case 'SUBSCRIBE':
      case 'UPGRADE':
        order = 1
        onClick = handleUpgrade
        break
      case 'CONTACT_SALES':
        order = 2
        onClick = handleContactSales
        isContactSales = true
        break
      case 'CONTACT_SUPPORT':
        order = 2
        isContactSupport = true
        break
      case 'DISABLED_BY_ENTERPRISE':
      case 'DISABLED_BY_TEAM':
        order = 0
        onClick = undefined
        planDisabledStr = action.reason
        break
      default:
        order = 0
        onClick = undefined
    }

    btnProps.push({ buttonText, onClick, btnLoading, order, planDisabledStr, isContactSales, isContactSupport })
  })

  // sort btns for display order
  btnProps.sort((btn1, btn2) => btn1.order - btn2.order)

  return btnProps
}

export const PLAN_BTN_ACTIONS: { [key in NonNullable<EditionActionDTO['action']>]?: string } = {
  START_FREE: 'common.startFree',
  SUBSCRIBE: 'common.subscriptions.overview.subscribe',
  UPGRADE: 'common.upgrade',
  CONTACT_SALES: 'common.banners.trial.contactSales',
  CONTACT_SUPPORT: 'common.contactSupport',
  MANAGE: 'common.plans.manageSubscription'
}

interface GetBtnsProps {
  isPlanDisabled: boolean
  btnProps?: BtnProps[]
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
}

export function getBtns({ isPlanDisabled, btnProps, getString }: GetBtnsProps): ReactElement {
  if (isPlanDisabled) {
    return <></>
  }
  const btns: ReactElement[] = []
  const length = btnProps?.length || 0
  btnProps?.forEach(btn => {
    const { onClick, btnLoading, buttonText, isContactSales, isContactSupport } = btn

    // contact sales|support displays as link when there are other buttons
    if ((isContactSales || isContactSupport) && length > 1) {
      btns.push(
        <Layout.Vertical spacing="small" flex={{ alignItems: 'center', justifyContent: 'center' }}>
          <Button
            font={{ size: 'small' }}
            key={buttonText}
            onClick={onClick}
            loading={btnLoading}
            variation={ButtonVariation.SECONDARY}
          >
            {buttonText}
          </Button>
          <Text font={{ size: 'small' }}>{getString('common.requestFreeTrial')}</Text>
        </Layout.Vertical>
      )
      return
    }

    // or else, just a button
    buttonText &&
      btns.push(
        buttonText === 'Upgrade' ? (
          <RbacButton
            permission={{
              permission: PermissionIdentifier.EDIT_LICENSE,
              resource: {
                resourceType: ResourceType.LICENSE
              }
            }}
            key={buttonText}
            onClick={onClick}
            loading={btnLoading}
            variation={ButtonVariation.PRIMARY}
          >
            {buttonText}
          </RbacButton>
        ) : (
          <Button key={buttonText} onClick={onClick} loading={btnLoading} variation={ButtonVariation.PRIMARY}>
            {buttonText}
          </Button>
        )
      )
  })

  return <Layout.Vertical spacing={'small'}>{btns}</Layout.Vertical>
}

interface GetPriceTipsProps {
  timeType: TimeType
  plan: PlanData
  textColorClassName: string
}

export function getPriceTips({ timeType, plan, textColorClassName }: GetPriceTipsProps): React.ReactElement {
  const priceTips = timeType === TimeType.MONTHLY ? plan.planProps?.priceTips : plan.planProps?.yearlyPriceTips
  const priceTerm = timeType === TimeType.MONTHLY ? plan.planProps?.priceTerm : plan.planProps?.yearlyPriceTerm
  const priceTermTips =
    timeType === TimeType.MONTHLY ? plan.planProps?.priceTermTips : plan.planProps?.yearlyPriceTermTips

  if (!isEmpty(priceTerm) && !isEmpty(priceTermTips)) {
    const tips = priceTips?.split(priceTerm || '')
    return (
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
        <Text
          color={Color.BLACK}
          font={{ weight: 'light', size: 'small' }}
          padding={{ left: 'large' }}
          className={css.centerText}
        >
          {tips?.[0]}
        </Text>
        <Popover
          popoverClassName={Classes.DARK}
          position={Position.BOTTOM}
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <Text width={200} padding="medium" color={Color.WHITE}>
              {priceTermTips || ''}
            </Text>
          }
        >
          <Text font={{ weight: 'light', size: 'small' }} className={cx(css.centerText, textColorClassName)}>
            {priceTerm}
          </Text>
        </Popover>
        <Text
          color={Color.BLACK}
          font={{ weight: 'light', size: 'small' }}
          padding={{ right: 'large' }}
          className={css.centerText}
        >
          {tips?.[1]}
        </Text>
      </Layout.Horizontal>
    )
  }

  return (
    <Text
      color={Color.BLACK}
      font={{ weight: 'light', size: 'small' }}
      padding={{ left: 'large', right: 'large' }}
      className={css.centerText}
    >
      {priceTips}
    </Text>
  )
}

interface GetPriceProps {
  plan: PlanData
  timeType: TimeType
  openMarketoContactSales: () => void
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
}

export function getPrice({ timeType, plan, openMarketoContactSales, getString }: GetPriceProps): React.ReactElement {
  const CUSTOM_PRICING = 'custom pricing'
  const price = timeType === TimeType.MONTHLY ? plan.planProps?.price : plan?.planProps?.yearlyPrice
  if (price?.toLowerCase() === CUSTOM_PRICING) {
    return (
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
        <Button
          onClick={openMarketoContactSales}
          variation={ButtonVariation.LINK}
          className={cx(css.noPadding, css.fontLarge)}
        >
          {getString('common.banners.trial.contactSales')}
        </Button>
        <Text color={Color.BLACK} font={{ size: 'medium' }}>
          {getString('common.customPricing')}
        </Text>
      </Layout.Horizontal>
    )
  }
  return (
    <Text font={{ weight: 'semi-bold', size: 'large' }} color={Color.BLACK}>
      {price}
    </Text>
  )
}
