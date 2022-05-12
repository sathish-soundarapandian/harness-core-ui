/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { ExpandingSearchInput, Layout, Table, Text } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ExistingCURDetails } from './OverviewStep'
import css from '../CreateCeAwsConnector.module.scss'

interface ExistingCURDetailsProps {
  existingCurReports: ExistingCURDetails[]
}

const CostUsageReportExisting: React.FC<ExistingCURDetailsProps> = props => {
  const { getString } = useStrings()
  const [curReports, setCurReports] = useState(props.existingCurReports)

  const onChange = (searchVal: string) => {
    let filteredReports = props.existingCurReports
    if (searchVal) {
      filteredReports = filteredReports.filter(item => item.reportName.includes(searchVal))
    }
    setCurReports(filteredReports)
  }

  return (
    <div>
      <Layout.Vertical>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY }}>
          {getString('connectors.ceAws.curExising.subHeading', { reportCount: props.existingCurReports.length })}
        </Text>
        <div className={css.existingCurTable}>
          <ExpandingSearchInput
            onChange={/* istanbul ignore next */ text => onChange(text.trim())}
            alwaysExpanded={false}
            placeholder={getString('connectors.ceAws.curExising.searchCUR')}
          />
          <Table
            data={curReports}
            columns={[
              {
                accessor: 'awsAccountId',
                Header: getString('connectors.ceAws.curExising.accountID'),
                id: 'awsAccountId',
                width: '26%'
              },
              {
                accessor: 'reportName',
                Header: getString('connectors.ceAws.cur.reportName'),
                width: '37%'
              },
              {
                accessor: 's3BucketName',
                Header: getString('connectors.ceAws.cur.bucketName'),
                width: '37%'
              }
            ]}
            bpTableProps={{ bordered: true, condensed: true, striped: false }}
          ></Table>
        </div>
      </Layout.Vertical>
    </div>
  )
}

export default CostUsageReportExisting
