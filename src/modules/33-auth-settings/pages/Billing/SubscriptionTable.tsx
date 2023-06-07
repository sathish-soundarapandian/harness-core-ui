/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { ButtonVariation, Card, Icon, IconName, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, get, lowerCase } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import { getModuleIcon } from '@common/utils/utils'
import { Module, ModuleName } from 'framework/types/ModuleName'
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
  dataPerModule?: ItemDTO[]
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
      priceBreakdown.premiumSupport += defaultTo((item.quantity || 0) * (item.price.unitAmount || 0), 0) as number
    }
  })
  return priceBreakdown
}

function SubscriptionTable({ data = [], dataPerModule = [], frequency }: SubscriptionTableProps): JSX.Element {
  const { getString } = useStrings()

  const annualTotal = React.useMemo((): number => {
    let finalAmount = 0
    data.forEach((subscription: SubscriptionDetailDTO) => {
      finalAmount += defaultTo(subscription.latestInvoiceDetail?.amountDue, 0)
    })
    return finalAmount
  }, [data])
  const subscriptionByModuleMap = {
    [ModuleName.CF]: [] as ItemDTO[],
    [ModuleName.CI]: [] as ItemDTO[]
  }
  dataPerModule.forEach(data => {
    if (get(data, 'price.metaData.module') === ModuleName.CF) {
      subscriptionByModuleMap[ModuleName.CF].push(data)
    }
    if (get(data, 'price.metaData.module') === ModuleName.CI) {
      subscriptionByModuleMap[ModuleName.CI].push(data)
    }
  })

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
      {subscriptionByModuleMap[ModuleName.CF].length > 0 ? (
        <TableRow
          row={subscriptionByModuleMap[ModuleName.CF]}
          key={ModuleName.CF.toLowerCase()}
          data={data[0]}
          module={ModuleName.CF.toLowerCase() as ModuleName}
          name={ModuleName.CF.toLowerCase() || ''}
        />
      ) : null}

      {subscriptionByModuleMap[ModuleName.CI].length > 0 ? (
        <TableRow
          row={subscriptionByModuleMap[ModuleName.CI]}
          key={ModuleName.CI.toLowerCase()}
          data={data[0]}
          module={ModuleName.CI.toLowerCase() as ModuleName}
          name={ModuleName.CI.toLowerCase() || ''}
        />
      ) : null}
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
  module?: ModuleName
  subscribed?: string
  using?: string
  name: string
  data: SubscriptionDetailDTO
  row?: ItemDTO[]
}

const calculateModulePrice = (row: ItemDTO[], mauQty: number) => {
  let totalCost = 0
  row?.forEach(r => {
    let qty = r.quantity
    if (r.price?.metaData?.type === 'MAU' || r.price?.metaData?.type === 'MAU_SUPOPRT') {
      qty = mauQty
    }
    totalCost += (qty || 0) * toDollars(r.price?.unitAmount || 0)
  })
  return totalCost
}
const TableRow = ({ name = 'cf', using = '-', module = ModuleName.CF, data, row }: TableRowProps): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()

  const { accountId } = useParams<AccountPathProps>()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    | DynamicPopoverHandlerBinding<{ priceData?: InvoiceDetailDTO; hideDialog?: () => void; moduleName: Module }>
    | undefined
  >()
  const items = data?.items?.filter(item => item.price?.metaData?.module?.toLowerCase() === module)
  const priceDetails = getParsedData(items)
  const mauQtyString =
    name.toLowerCase() === 'cf'
      ? getQuantityFromValue(
          priceDetails.maus?.price?.metaData?.max as string,
          priceDetails.maus?.price?.metaData?.sampleMultiplier as string,
          priceDetails.maus?.price?.metaData?.sampleUnit as string
        )
      : ''
  const mauQty = Number(mauQtyString)
  const totalPrice = calculateModulePrice(row || [], mauQty)
  const renderPopover = ({ priceData }: { priceData?: InvoiceDetailDTO }): JSX.Element => {
    return (
      <PriceBreakdownTooltipFF
        mauQtyString={mauQtyString}
        mauQty={mauQty}
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
  const unit = priceDetails.maus?.price?.metaData?.sampleUnit as string
  const ffString = `${priceDetails.developers?.quantity} ${getString(
    'common.subscriptions.usage.developers'
  )} / ${mauQtyString}${unit} ${getString('authSettings.costCalculator.maus')}`
  const ciString = `${priceDetails.developers?.quantity} ${getString('common.subscriptions.usage.developers')}`
  return (
    <div className={css.tableRow}>
      <Text font={{ variation: FontVariation.BODY }} iconProps={{ size: 22 }} icon={getModuleIcon(module)}>
        {getString(getTitleByModule(name as Module)?.title as keyof StringsMap)}
      </Text>
      <Text font={{ variation: FontVariation.BODY }}>
        {module === ModuleName.CF.toLowerCase() ? ffString : ciString}
      </Text>
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
          onClick={() => history.push(routes.toSubscriptions({ accountId, moduleCard: name as Module }))}
        />
      </Text>
      <Layout.Vertical className={css.lastCol}>
        <Text font={{ variation: FontVariation.BODY, weight: 'bold' }}>{`$${totalPrice}`}</Text>
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
  mauQtyString,
  mauQty,
  moduleName,
  icon,
  hideDialog,
  priceDetails
}: {
  mauQtyString?: string
  mauQty?: number
  priceData?: InvoiceDetailDTO
  hideDialog?: () => void
  moduleName: Module
  icon: string
  isMonthly?: boolean
  priceDetails: PriceDetails
}): JSX.Element => {
  const { getString } = useStrings()
  const unit = priceDetails.maus?.price?.metaData?.sampleUnit as string
  const mauQtyStringWithUnit = `${mauQtyString}${unit}`

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
              ${(priceDetails.developers?.quantity || 0) * toDollars(priceDetails.developers?.price?.unitAmount)}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        {moduleName.toLowerCase() === 'cf' ? (
          <Layout.Vertical flex className={css.breakdownRow} data-testid="maus">
            <Layout.Horizontal className={cx(css.fullWidth, css.alignSpace)}>
              <Text color={Color.BLACK} width={200}>{`${mauQtyStringWithUnit} ${getString(
                'authSettings.costCalculator.maus'
              )}`}</Text>
              <Text color={Color.BLACK} className={css.right}>
                ${(mauQty || 0) * toDollars(priceDetails.maus?.price?.unitAmount)}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        ) : null}
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
            $
            {toDollars(priceDetails.premiumSupport) +
              (mauQty || 0) * toDollars(priceDetails.maus?.price?.unitAmount) +
              (priceDetails.developers?.quantity || 0) * toDollars(priceDetails.developers?.price?.unitAmount)}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    </>
  )
}
export default SubscriptionTable
