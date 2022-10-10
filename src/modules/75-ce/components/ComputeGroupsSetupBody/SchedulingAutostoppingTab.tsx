/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Color, Container, FontVariation, Layout, TableV2, Text } from '@harness/uicore'
import type { CellProps, Column } from 'react-table'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import CopyButton from '@ce/common/CopyButton'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import ToggleSection from './ToggleSection'
import FixedSchedules from '../COGatewayConfig/steps/AdvancedConfiguration/FixedSchedules'
import type { FixedScheduleClient } from '../COCreateGateway/models'
import css from './ComputeGroupsSetupBody.module.scss'
import cgBodyCss from '../ComputeGroupsBody/ComputeGroupsBody.module.scss'

const SchedulingAutostoppingTab: React.FC = () => {
  const { getString } = useStrings()
  const [selectedVal, setSelectedVal] = useState<string>('none')
  return (
    <Container>
      {/* {selectedVal === 'none' && (
        <Container className={css.noteContainer}>
          <Text icon="info-messaging" iconProps={{ size: 28, margin: { right: 'medium' } }} color={Color.GREY_800}>
            <String stringID="ce.computeGroups.setup.schedulingTab.enableNote" useRichText />
          </Text>
        </Container>
      )} */}
      <ToggleSection
        title={getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.setupHeader')}
        alwaysOpen={selectedVal !== 'none'}
        hideCollapseIcon={true}
        hideToggle={true}
        mainContent={
          <Layout.Vertical spacing={'medium'} margin={{ top: 'large' }}>
            <Text font={{ variation: FontVariation.LEAD }}>
              {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.selectScopeLabel')}
            </Text>
            <RadioGroup
              selectedValue={selectedVal}
              onChange={(e: FormEvent<HTMLInputElement>) => setSelectedVal(e.currentTarget.value)}
            >
              <Radio label={getString('ce.computeGroups.noneLabel')} value="none" />
              <Radio
                label={getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.entireCluster')}
                value="all"
              />
              <Radio
                label={getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.specificWorkloads')}
                value="specific"
              />
            </RadioGroup>
          </Layout.Vertical>
        }
        secondaryContent={
          <Layout.Horizontal spacing={'large'}>
            <Layout.Vertical spacing={'medium'} className={css.whiteCard}>
              <Text font={{ variation: FontVariation.H6 }}>
                {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.totalSpend')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }}>{formatCost(2345)}</Text>
            </Layout.Vertical>
            <Layout.Vertical spacing={'medium'} className={css.whiteCard}>
              <Text font={{ variation: FontVariation.H6 }}>
                {getString('ce.computeGroups.setup.schedulingTab.potentialSpendByScheduling')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }} icon="money-icon" iconProps={{ size: 30 }}>
                {formatCost(16500, { decimalPoints: 0 })}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical spacing={'medium'} className={css.whiteCard}>
              <Text font={{ variation: FontVariation.H6 }}>
                {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.savingsPercentage')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }}>{'72.38%'}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
      >
        {selectedVal === 'all' && <SchedulingForAllWorkloads />}
        {selectedVal === 'specific' && <SpecificWorkloadsAutostopping />}
      </ToggleSection>
    </Container>
  )
}

const SchedulingForAllWorkloads: React.FC = () => {
  const { getString } = useStrings()
  const [schedules, setSchedules] = useState<FixedScheduleClient[]>([])
  return (
    <Layout.Vertical spacing={'medium'}>
      <Text font={{ variation: FontVariation.H5 }}>
        {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.specifyScheduleHeader')}
      </Text>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.specifyScheduleSubheader')}
      </Text>
      <FixedSchedules addSchedules={scheds => setSchedules(scheds)} schedules={schedules} hideDescription />
    </Layout.Vertical>
  )
}

const NameIdCell = (tableProps: CellProps<any>) => {
  return (
    <Container>
      <Text>{tableProps.row.original.name}</Text>
      <Layout.Horizontal spacing={'small'} flex={{ justifyContent: 'flex-start' }}>
        <Text>{tableProps.row.original.id}</Text>
        <CopyButton textToCopy={tableProps.row.original.id} />
      </Layout.Horizontal>
    </Container>
  )
}

const AutoStoppingStatusCell = (tableProps: CellProps<any>) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
      {tableProps.value ? (
        <Container className={cgBodyCss.enableCell}>
          <Text font={{ variation: FontVariation.LEAD }} iconProps={{ size: 14 }} icon="command-artifact-check">
            {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.autoStoppingEnabledLabel')}
          </Text>
        </Container>
      ) : (
        <Button
          text={getString('ce.cloudIntegration.enableAutoStopping')}
          variation={ButtonVariation.SECONDARY}
          icon="plus"
          rightIcon="main-share"
          onClick={() => {
            window.open(
              `${window.location.origin}${window.location.pathname}#${routes.toCECOCreateGateway({ accountId })}`,
              '_blank'
            )
          }}
        />
      )}
    </Layout.Vertical>
  )
}

const SpecificWorkloadsAutostopping: React.FC = () => {
  const { getString } = useStrings()
  const data = [
    {
      name: 'ui-server',
      id: 'ID 1',
      replicas: 4,
      cost: 234,
      status: true
    },
    {
      name: 'redis-cache',
      id: 'ID 2',
      replicas: 3,
      cost: 644,
      status: false
    }
  ]
  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.workloadHeader'),
        width: '25%',
        Cell: NameIdCell
        // serverSortProps: getServerSortProps({
        //   enableServerSort: true,
        //   accessor: 'name',
        //   sortByObj: sortObj,
        //   setSortByObj: handleSort
        // })
      },
      {
        accessor: 'replicas',
        Header: getString('ce.computeGroups.replicas'),
        width: '25%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'cost',
        Header: getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.costPerMonthHeader'),
        width: '25%',
        Cell: tableProps => <Text>{formatCost(tableProps.value)}</Text>
      },
      {
        accessor: 'status',
        Header: getString('action'),
        width: '25%',
        Cell: AutoStoppingStatusCell
      }
    ],
    []
  )
  return (
    <Layout.Vertical spacing={'medium'}>
      <TableV2 columns={columns} data={data} />
    </Layout.Vertical>
  )
}

export default SchedulingAutostoppingTab
