/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, ExpandingSearchInput, Table, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { CEAzureConnector } from 'services/cd-ng'
import css from '../../CreateCeAzureConnector_new.module.scss'

interface Props {
  existingBillingExports: CEAzureConnector[]
}

const ExistingBillingExports = (props: Props) => {
  const { getString } = useStrings()
  const [billingReports, setBillingReports] = useState(props.existingBillingExports)

  const onChange = (searchVal: string) => {
    let filteredReports = props.existingBillingExports
    if (searchVal) {
      filteredReports = filteredReports.filter(item => item.reportName.includes(searchVal))
    }
    setBillingReports(filteredReports)
  }

  return (
    <>
      <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY }} padding={{ bottom: 'small' }}>
        {getString('connectors.ceAzure.existingExports.instruction', {
          reportCount: props.existingBillingExports.length
        })}
      </Text>
      <Container className={css.existingBeTable}>
        <ExpandingSearchInput
          onChange={text => onChange(text.trim())}
          alwaysExpanded={false}
          placeholder={getString('connectors.ceAzure.existingExports.searchBillingReports')}
        />
        <Table
          data={billingReports}
          bpTableProps={{ bordered: true, condensed: true, striped: false }}
          columns={[
            {
              accessor: 'tenantId',
              Header: getString('connectors.ceAzure.existingExports.tenantId')
            },
            {
              accessor: 'billingExportSpec.storageAccountName',
              Header: getString('connectors.ceAzure.billing.storageAccountName')
            },
            {
              accessor: 'billingExportSpec.containerName',
              Header: getString('connectors.ceAzure.billing.containerName')
            },
            {
              accessor: 'billingExportSpec.directoryName',
              Header: getString('connectors.ceAzure.billing.directoryName')
            },
            {
              accessor: 'billingExportSpec.reportName',
              Header: getString('connectors.ceAzure.billing.reportName')
            },
            {
              accessor: 'billingExportSpec.subscriptionId',
              Header: getString('connectors.ceAzure.existingExports.subscriptionId')
            }
          ]}
        />
      </Container>
    </>
  )
}

export default ExistingBillingExports
