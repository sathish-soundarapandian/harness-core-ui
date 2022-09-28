/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { ButtonVariation, Card, Color, FontVariation, Icon, IconName, Layout, Text } from '@harness/uicore'
import { defaultTo, lowerCase } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import { getModuleIcon } from '@common/utils/utils'
import type { Module, ModuleName } from 'framework/types/ModuleName'
import { DynamicPopover, DynamicPopoverHandlerBinding } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { InvoiceDetailDTO, ItemDTO, SubscriptionDetailDTO } from 'services/cd-ng'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import {
  getQuantityFromValue,
  getTitleByModule,
  PLAN_TYPES,
  toDollars
} from '@auth-settings/components/Subscription/subscriptionUtils'
import type { StringsMap } from 'stringTypes'
import { TimeType } from '@common/constants/SubscriptionTypes'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './BillingPage.module.scss'
interface SubscriptionTableProps {
  data?: SubscriptionDetailDTO[]
  frequency?: TimeType
}

interface PriceDetails {
  tax?: number
  premiumSupport?: number
  maus?: ItemDTO
  developers?: ItemDTO
}
const getParsedData = (items?: ItemDTO[]): PriceDetails => {
  const priceBreakdown = {
    tax: 0,
    premiumSupport: 0,
    maus: {} as ItemDTO,
    developers: {} as ItemDTO
  }
  items?.forEach(item => {
    if (item.description?.includes('Sales Tax')) {
      priceBreakdown.tax = defaultTo(item.amount, 0) as number
    }
    if (item.price?.metaData?.type === PLAN_TYPES.MAU) {
      priceBreakdown.maus = item as ItemDTO
    }
    if (item.price?.metaData?.type === PLAN_TYPES.DEVELOPERS) {
      priceBreakdown.developers = item as ItemDTO
    }

    if (item.price?.metaData?.type?.includes('SUPPORT')) {
      priceBreakdown.premiumSupport += defaultTo(item.amount, 0) as number
    }
  })
  return priceBreakdown
}

function SubscriptionTable({ data = [], frequency }: SubscriptionTableProps): JSX.Element {
  const { getString } = useStrings()

  const annualTotal = React.useMemo((): number => {
    let finalAmount = 0
    data.forEach((subscription: SubscriptionDetailDTO) => {
      finalAmount += defaultTo(subscription.latestInvoiceDetail?.amountDue, 0)
    })
    return finalAmount
  }, [data])

  return (
    <Card className={css.subscriptionTable}>
      <div className={cx(css.subscriptionGrid, css.tableTitle)}>
        <div>
          <Text font={{ variation: FontVariation.H4 }}>
            {frequency === TimeType.YEARLY
              ? getString('authSettings.billingInfo.annualSubscriptions')
              : getString('authSettings.billingInfo.monthlySubscriptions')}
          </Text>
        </div>
        <Layout.Vertical className={css.totalSpend}>
          <Text font={{ variation: FontVariation.H4 }}>
            {' '}
            {frequency === TimeType.YEARLY
              ? getString('authSettings.billingInfo.annualTotal')
              : getString('authSettings.billingInfo.monthlyTotal')}
            {`$${toDollars(annualTotal)}`}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }}>
            {getString('authSettings.billingInfo.nextBillingDate', {
              billingDate: data[0]?.latestInvoiceDetail?.periodEnd
                ? moment(data[0].latestInvoiceDetail?.periodEnd * 1000).format('MMMM d, YYYY')
                : ''
            })}
          </Text>
        </Layout.Vertical>
      </div>
      <TableHeader />
      {data.map(row => (
        <TableRow
          key={row.moduletype}
          data={row}
          module={row?.moduletype as ModuleName}
          name={lowerCase(row.moduletype || '')}
        />
      ))}
    </Card>
  )
}

const TableHeader = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <div className={css.tableHeader}>
      <Text font={{ variation: FontVariation.BODY }}>{getString('common.moduleLabel')}</Text>
      <Text font={{ variation: FontVariation.BODY }}>{getString('common.subscribed')}</Text>
      <Text font={{ variation: FontVariation.BODY }}>{getString('authSettings.costCalculator.using')}</Text>
      <Text font={{ variation: FontVariation.BODY }}>{getString('action')}</Text>
      <Text font={{ variation: FontVariation.BODY }}>{getString('common.perModule')}</Text>
    </div>
  )
}
interface TableRowProps {
  module: ModuleName
  subscribed?: string
  using?: string
  name: string
  data: SubscriptionDetailDTO
}
const TableRow = ({ name, using = '-', module, data }: TableRowProps): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()

  const { accountId } = useParams<AccountPathProps>()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    | DynamicPopoverHandlerBinding<{ priceData?: InvoiceDetailDTO; hideDialog?: () => void; moduleName: Module }>
    | undefined
  >()

  const priceDetails = getParsedData(data.latestInvoiceDetail?.items)
  const renderPopover = ({ priceData }: { priceData?: InvoiceDetailDTO }): JSX.Element => {
    return (
      <PriceBreakdownTooltipFF
        moduleName={name as Module}
        priceData={priceData}
        icon={getModuleIcon(module)}
        hideDialog={dynamicPopoverHandler?.hide}
        priceDetails={priceDetails}
      />
    )
  }
  const showBreakdown = (e: any): void => {
    dynamicPopoverHandler?.show(e.target as Element, {
      priceData: data.latestInvoiceDetail,
      hideDialog: dynamicPopoverHandler.hide,
      moduleName: name as Module
    })
  }

  return (
    <div className={css.tableRow}>
      <Text font={{ variation: FontVariation.BODY }} iconProps={{ size: 22 }} icon={getModuleIcon(module)}>
        {getString(getTitleByModule(name as Module).title as keyof StringsMap)}
      </Text>
      <Text font={{ variation: FontVariation.BODY }}>{`${priceDetails.developers?.quantity} ${getString(
        'common.subscriptions.usage.developers'
      )} / ${getQuantityFromValue(
        priceDetails.maus?.price?.metaData?.max as string,
        priceDetails.maus?.price?.metaData?.sampleMultiplier as string,
        priceDetails.maus?.price?.metaData?.sampleUnit as string
      )} ${getString('authSettings.costCalculator.maus')}`}</Text>
      <Text font={{ variation: FontVariation.BODY }}> {`${using}`}</Text>
      <Text font={{ variation: FontVariation.BODY }}>
        <RbacButton
          text={getString('common.plans.manageSubscription')}
          className={css.mangeButton}
          variation={ButtonVariation.LINK}
          permission={{
            permission: PermissionIdentifier.EDIT_LICENSE,
            resource: {
              resourceType: ResourceType.LICENSE
            }
          }}
          onClick={() => history.push(routes.toSubscriptions({ accountId, moduleCard: 'cf' }))}
        />
      </Text>
      <Layout.Vertical className={css.lastCol}>
        <Text font={{ variation: FontVariation.BODY, weight: 'bold' }}>{`$${toDollars(
          data.latestInvoiceDetail?.amountDue
        )}`}</Text>
        <Text
          onClick={showBreakdown}
          className={cx(css.breakdown)}
          font={{ variation: FontVariation.SMALL }}
          color={Color.PRIMARY_6}
        >
          {getString('authSettings.billingInfo.priceBreakdown')}
        </Text>
      </Layout.Vertical>
      <DynamicPopover darkMode={false} render={renderPopover} bind={setDynamicPopoverHandler} />
    </div>
  )
}

const PriceBreakdownTooltipFF = ({
  priceData,
  moduleName,
  icon,
  hideDialog,
  isMonthly,
  priceDetails
}: {
  priceData?: InvoiceDetailDTO
  hideDialog?: () => void
  moduleName: Module
  icon: string
  isMonthly?: boolean
  priceDetails: PriceDetails
}): JSX.Element => {
  const { getString } = useStrings()

  return (
    <>
      <Layout.Horizontal flex className={css.title} padding={{ top: 'large', left: 'large', right: 'large' }}>
        <Text font={{ variation: FontVariation.BODY }} iconProps={{ size: 22 }} icon={icon as IconName} width={350}>
          {`${getString(getTitleByModule(moduleName as Module).title as keyof StringsMap)} ${getString(
            'authSettings.priceBreakdown'
          )}`}
        </Text>
        <Icon name="main-close" onClick={hideDialog} className={css.pointer} />
      </Layout.Horizontal>
      <Layout.Vertical className={css.breakDownTable} spacing={'large'} padding="large">
        <Layout.Vertical flex className={css.breakdownRow} data-testid="developers">
          <Layout.Horizontal flex className={css.fullWidth}>
            <Text color={Color.BLACK} width={200}>{`${priceDetails.developers?.quantity} ${getString(
              'common.subscriptions.usage.developers'
            )}`}</Text>
            <Text color={Color.BLACK} className={css.right}>
              ${toDollars(priceDetails.developers?.amount)}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex className={css.fullWidth}>
            <Text color={Color.BLACK} font={{ size: 'small' }} width={200}>{`${
              priceDetails.developers?.quantity
            } ${lowerCase(getString('common.subscriptions.usage.developers'))} x $${toDollars(
              priceDetails.developers?.price?.unitAmount
            )} ${
              isMonthly ? getString('common.perMonthWithoutSlash') : getString('common.perYearWithoutSlash')
            }`}</Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical flex className={css.breakdownRow} data-testid="maus">
          <Layout.Horizontal className={cx(css.fullWidth, css.alignSpace)}>
            <Text color={Color.BLACK} width={200}>{`${getQuantityFromValue(
              priceDetails.maus?.price?.metaData?.max as string,
              priceDetails.maus?.price?.metaData?.sampleMultiplier as string,
              priceDetails.maus?.price?.metaData?.sampleUnit as string
            )} ${getString('authSettings.costCalculator.maus')}`}</Text>
            <Text color={Color.BLACK} className={css.right}>
              ${toDollars(priceDetails.maus?.amount)}
            </Text>
          </Layout.Horizontal>
          {/* <Layout.Horizontal flex className={css.fullWidth}>
            <Text color={Color.BLACK} font={{ size: 'small' }} width={200}>
              {`${getQuantityFromValue(
                priceDetails.maus?.price?.metaData?.max as string,
                priceDetails.maus?.price?.metaData?.sampleMultiplier as string,
                priceDetails.maus?.price?.metaData?.sampleUnit as string
              )} x $${toDollars(priceDetails.developers?.price?.unitAmount)} ${getString(
                'common.per'
              )} ${getSampleMinValue(priceDetails.maus?.price?.metaData?.sampleUnit)} ${getString(
                'authSettings.costCalculator.maus'
              )}  ${isMonthly ? getString('common.perMonth') : getString('common.perYearWithoutSlash')}`}
            </Text>
          </Layout.Horizontal> */}
        </Layout.Vertical>
        {toDollars(priceDetails.premiumSupport) > 0 && (
          <Layout.Horizontal flex className={css.breakdownRow} data-testid="support">
            <Text color={Color.BLACK} width={200}>
              {getString('authSettings.costCalculator.premiumSupport')}
            </Text>
            <Text color={Color.BLACK} className={css.right}>
              ${toDollars(priceDetails.premiumSupport)}
            </Text>
          </Layout.Horizontal>
        )}
        {toDollars(priceDetails.tax) > 0 && (
          <Layout.Horizontal flex className={css.breakdownRow} data-testid="tax">
            <Text color={Color.BLACK} width={200}>
              {getString('authSettings.costCalculator.tax')}
            </Text>
            <Text color={Color.BLACK} className={css.right}>
              ${toDollars(priceDetails.tax)}
            </Text>
          </Layout.Horizontal>
        )}
        <Layout.Horizontal flex className={css.breakdownRow} data-testid="tax">
          <Text color={Color.BLACK} font={{ weight: 'bold' }}>
            {getString('total')}
          </Text>
          <Text color={Color.BLACK} font={{ weight: 'bold' }} className={css.right}>
            ${toDollars(priceData?.totalAmount)}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    </>
  )
}
export default SubscriptionTable
