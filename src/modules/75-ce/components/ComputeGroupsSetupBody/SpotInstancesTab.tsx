/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useMemo, useState } from 'react'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { Color, Container, FontVariation, Label, Layout, Select, TableV2, Text } from '@harness/uicore'
import type { CellProps, Column } from 'react-table'
import { String, useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import CopyButton from '@ce/common/CopyButton'
import ToggleSection from './ToggleSection'
import css from './ComputeGroupsSetupBody.module.scss'

const SpotInstancesTab: React.FC = () => {
  const { getString } = useStrings()
  const [selectedVal, setSelectedVal] = useState<string>('none')
  return (
    <Container>
      <Container className={css.noteContainer}>
        <Text icon="info-messaging" iconProps={{ size: 28, margin: { right: 'medium' } }} color={Color.GREY_800}>
          <String stringID="ce.computeGroups.setup.spotInstancesTab.enableNote" useRichText />
        </Text>
      </Container>
      <ToggleSection
        title={getString('ce.computeGroups.setup.spotInstancesTab.useSpotSection.header')}
        subTitle={getString('ce.computeGroups.setup.spotInstancesTab.useSpotSection.subHeader')}
        alwaysOpen={selectedVal === 'specific'}
        hideCollapseIcon={true}
        hideToggle={true}
        mainContent={
          <Layout.Vertical spacing={'medium'} margin={{ top: 'large' }}>
            <Text font={{ variation: FontVariation.LEAD }}>
              {getString('ce.computeGroups.setup.spotInstancesTab.useSpotSection.selectWorkloadLabel')}
            </Text>
            <RadioGroup
              selectedValue={selectedVal}
              onChange={(e: FormEvent<HTMLInputElement>) => setSelectedVal(e.currentTarget.value)}
            >
              <Radio label={getString('ce.anomalyDetection.filters.groupByNoneValue')} value="none" />
              <Radio
                label={getString('ce.computeGroups.setup.spotInstancesTab.useSpotSection.allWorkloads')}
                value="all"
              />
              <Radio
                label={getString('ce.computeGroups.setup.spotInstancesTab.useSpotSection.spotReadyWorkloads')}
                value="specific"
              />
            </RadioGroup>
          </Layout.Vertical>
        }
        secondaryContent={
          <Layout.Horizontal spacing={'large'}>
            <Layout.Horizontal className={css.whiteCard} spacing="large">
              <Layout.Vertical spacing={'large'}>
                <Container>
                  <Text font={{ variation: FontVariation.H6 }}>
                    {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.totalSpend')}
                  </Text>
                  <Text font={{ variation: FontVariation.H3 }}>{'$2345'}</Text>
                </Container>
                <Container>
                  <Text font={{ variation: FontVariation.H6 }}>
                    {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.potentialSpendByPolicies')}
                  </Text>
                  <Text
                    font={{ variation: FontVariation.H3 }}
                    icon="money-icon"
                    iconProps={{ size: 30 }}
                    color={Color.GREEN_700}
                  >
                    {formatCost(16500, { decimalPoints: 0 })}
                  </Text>
                </Container>
              </Layout.Vertical>
              <Container>
                <Text font={{ variation: FontVariation.H6 }}>
                  {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.savingsPercentage')}
                </Text>
                <Text font={{ variation: FontVariation.H3 }}>{'72.38 %'}</Text>
              </Container>
            </Layout.Horizontal>
            <Container className={css.whiteCard}>
              <Layout.Vertical flex={{ alignItems: 'baseline' }} spacing="xlarge">
                <Text font={{ variation: FontVariation.H6 }}>
                  {getString('ce.computeGroups.setup.spotInstancesTab.workloadToRunOnSpot')}
                </Text>
                <Container flex>
                  <Container>
                    <Text font={{ variation: FontVariation.H2 }} inline>
                      3/
                    </Text>
                    <Text font={{ variation: FontVariation.H5 }} inline>
                      24
                    </Text>
                  </Container>
                </Container>
                <Container flex>
                  <Text font={{ variation: FontVariation.SMALL }}>
                    {getString('ce.computeGroups.setup.spotInstancesTab.notSpotFriendly') + '(21)'}
                  </Text>
                  <Text font={{ variation: FontVariation.SMALL }}>
                    {getString('ce.computeGroups.setup.spotInstancesTab.spotFriendly') + '(3)'}
                  </Text>
                </Container>
                <Container></Container>
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>
        }
      >
        {selectedVal === 'specific' && <SpotReadyWorkloads />}
      </ToggleSection>
    </Container>
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

const CurrentWorkloadDistribution = (tableProps: CellProps<any>) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing={'medium'}>
      <Text>{`${tableProps.row.original.current.spot} ${getString('ce.nodeRecommendation.spot')}`}</Text>
      <Text>{`${tableProps.row.original.current.onDemand} ${getString('ce.nodeRecommendation.onDemand')}`}</Text>
    </Layout.Horizontal>
  )
}

const UpdatedWorkloadDistribution = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Container>
        <Label>{getString('ce.nodeRecommendation.spot')}</Label>
        <Select items={[]} />
      </Container>
      <Container>
        <Label>{getString('ce.nodeRecommendation.onDemand')}</Label>
        <Select items={[]} />
      </Container>
    </Layout.Horizontal>
  )
}

const SpotReadyWorkloads: React.FC = () => {
  const { getString } = useStrings()
  const data = [
    {
      name: 'Workload 1',
      id: 'ID 1',
      replicas: 4,
      current: {
        spot: 2,
        onDemand: 2
      }
    },
    {
      name: 'Workload 2',
      id: 'ID 2',
      replicas: 3,
      current: {
        spot: 4,
        onDemand: 4
      }
    }
  ]
  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('ce.overview.workload'),
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
        Header: getString('delegates.replicaText'),
        width: '25%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'current',
        Header: getString('common.current'),
        width: '25%',
        Cell: CurrentWorkloadDistribution
      },
      {
        accessor: 'id',
        Header: getString('ce.common.updated'),
        width: '25%',
        Cell: UpdatedWorkloadDistribution
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

export default SpotInstancesTab
