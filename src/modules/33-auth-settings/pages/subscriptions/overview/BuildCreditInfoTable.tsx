/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance, Column } from 'react-table'
import { Text, TableV2, Layout, Card, Heading, NoDataCard } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings, StringKeys } from 'framework/strings'
import moment from 'moment'
import type { LicenseUsageDTO, CreditDTO, ModuleLicenseDTO, CIModuleLicenseDTO } from 'services/cd-ng'
import { getInfoIcon } from './UsageInfoCard'
import pageCss from '../SubscriptionsPage.module.scss'
import { getSummaryCardRenderers } from './ServiceLicenseGraphs'
import { creditSum } from './CIUsageInfo'

interface SummaryCardData {
  title: string
  count: number | string
  className: string
}
type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D>
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}
type CellType = Renderer<CellTypeWithActions<CreditDTO>>
export interface BuildCreditInfoTableProps {
  data: CreditDTO[]
  licenseData: CIModuleLicenseDTO | undefined
}

export function BuildCreditInfoTable({ data, licenseData }: BuildCreditInfoTableProps): React.ReactElement {
  const { getString } = useStrings()
  let totalCredits = 0
  if (data && data.length > 0) {
    totalCredits = creditSum(data)
  }
  const NameHeader = (headerName: StringKeys, tooltip?: StringKeys) => {
    return (
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
        <Text font={{ size: 'small' }} color={Color.GREY_700}>
          {getString(headerName)}
        </Text>
        {tooltip && getInfoIcon(getString(tooltip))}
      </Layout.Horizontal>
    )
  }

  const starTimeCell: CellType = ({ row }) => {
    const data = row.original
    const formattedStartTime = moment(data.purchaseTime).format('MMM DD YYYY')
    return (
      <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
        {formattedStartTime}
      </Text>
    )
  }
  const expiryTimeCell: CellType = ({ row }) => {
    const data = row.original
    const formattedExpiryTime = moment(data.expiryTime).format('MMM DD YYYY')
    return (
      <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
        {formattedExpiryTime}
      </Text>
    )
  }
  const entitlementCell: CellType = ({ row }) => {
    const data = row.original
    return (
      <Text color={Color.GREY_900} font={{ size: 'small' }} lineClamp={1}>
        {data.quantity}
      </Text>
    )
  }

  const columns: Column<LicenseUsageDTO>[] = React.useMemo(() => {
    return [
      {
        Header: NameHeader('common.startDateCredit'),
        accessor: 'storeType',
        disableSortBy: true,
        width: '33%',
        Cell: starTimeCell
      },

      {
        Header: NameHeader('common.expiryDateCredit'),
        accessor: 'identifier',
        disableSortBy: true,
        width: '38%',
        Cell: expiryTimeCell
      },
      {
        Header: NameHeader('common.entitlement'),
        accessor: 'serviceInstances',
        width: '33%',
        Cell: entitlementCell
      }
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [])

  const summaryCardsData: SummaryCardData[] = useMemo(() => {
    return [
      {
        title: getString('common.subscriptions.usage.allCredits'),
        count: totalCredits || 0,
        className: pageCss.peakClass
      },
      {
        title: getString('common.plans.subscription'),
        count: licenseData?.numberOfCommitters || 0,
        className: pageCss.subClass
      },
      {
        title: getString('common.nextExpiringDate'),
        count: moment(data[0].expiryTime).format('MMM DD YYYY'),
        className: pageCss.overUseClass
      }
    ]
  }, [])
  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical>
            <Heading color={Color.BLACK} font={{ size: 'medium' }}>
              {getString('common.subscriptions.usage.buildCredits')}
            </Heading>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical className={pageCss.badgesContainer} flex={{ justifyContent: 'space-between' }}>
          <div>{getSummaryCardRenderers(summaryCardsData, true)}</div>
        </Layout.Vertical>
        {data.length > 0 ? (
          <TableV2 className={pageCss.table} columns={columns} data={data} />
        ) : (
          <NoDataCard
            message={getString('common.noCreditInfoData')}
            className={pageCss.noDataCard}
            containerClassName={pageCss.noDataCardContainer}
          />
        )}
      </Layout.Vertical>
    </Card>
  )
}
