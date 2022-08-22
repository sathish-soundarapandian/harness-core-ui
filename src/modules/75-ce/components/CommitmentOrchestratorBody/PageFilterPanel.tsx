/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Select, SelectOption } from '@harness/uicore'
import TimeRangePicker from '@ce/common/TimeRangePicker/TimeRangePicker'
import type { TimeRangeFilterType } from '@ce/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useFetchFilters } from 'services/lw-co'
import { ApplyFilterOptionsProps, useFilterContext } from './FilterContext'
import css from './CommitmentOrchestrationBody.module.scss'

interface PageFilterPanelProps {
  applyFilter: (options: ApplyFilterOptionsProps) => void
}

const PageFilterPanel: React.FC<PageFilterPanelProps> = ({ applyFilter }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { timeRange: filterTimeRange } = useFilterContext()

  const DEFAULT_ACCOUNT_ID_OPTION: SelectOption = {
    label: getString('ce.commitmentOrchestration.filterPanel.allAccounts'),
    value: ''
  }
  const DEFAULT_INSTANCE_FAMILY_OPTION: SelectOption = {
    label: getString('ce.commitmentOrchestration.filterPanel.allInstanceFamilies'),
    value: ''
  }
  const DEFAULT_REGION_OPTION: SelectOption = {
    label: getString('ce.allRegions'),
    value: ''
  }

  const [timeRange, setTimeRange] = useState<TimeRangeFilterType>(filterTimeRange)
  const [accountIds, setAccountIds] = useState<SelectOption[]>([DEFAULT_ACCOUNT_ID_OPTION])
  const [instanceFamilies, setInstanceFamilies] = useState<SelectOption[]>([DEFAULT_INSTANCE_FAMILY_OPTION])
  const [regions, setRegions] = useState<SelectOption[]>([DEFAULT_REGION_OPTION])

  const { mutate: fetchFilters } = useFetchFilters({
    accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    fetchFilters({}).then(res => {
      const { region, instance_family, account_id } = res.response as any
      setRegions([
        DEFAULT_REGION_OPTION,
        ...region.map((reg: string) => ({
          label: reg,
          value: reg
        }))
      ])
      setInstanceFamilies([
        DEFAULT_INSTANCE_FAMILY_OPTION,
        ...instance_family.map((opt: string) => ({
          label: opt,
          value: opt
        }))
      ])
      setAccountIds([
        DEFAULT_ACCOUNT_ID_OPTION,
        ...account_id.map((opt: string) => ({
          label: opt,
          value: opt
        }))
      ])
    })
  }, [])

  return (
    <Container padding={{ top: 'large', bottom: 'large', left: 'xlarge', right: 'xlarge' }} className={css.filterPanel}>
      <Layout.Horizontal flex>
        <Layout.Horizontal spacing={'medium'}>
          <Select
            name="accountId"
            items={accountIds}
            defaultSelectedItem={DEFAULT_ACCOUNT_ID_OPTION}
            onChange={item => applyFilter({ account: item.value as string })}
          />
          <Select
            name="instanceFamily"
            items={instanceFamilies}
            defaultSelectedItem={DEFAULT_INSTANCE_FAMILY_OPTION}
            onChange={item => applyFilter({ instanceFamily: item.value as string })}
          />
          <Select
            name="region"
            items={regions}
            defaultSelectedItem={DEFAULT_REGION_OPTION}
            onChange={item => applyFilter({ region: item.value as string })}
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'medium'}>
          <TimeRangePicker
            timeRange={timeRange}
            setTimeRange={range => {
              setTimeRange(range)
              applyFilter({ timeRange: range })
            }}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default PageFilterPanel
