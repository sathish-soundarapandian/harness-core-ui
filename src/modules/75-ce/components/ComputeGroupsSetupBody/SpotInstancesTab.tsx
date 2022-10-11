/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useMemo, useState } from 'react'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { get } from 'lodash-es'
import {
  Button,
  Color,
  Container,
  FontVariation,
  Icon,
  Layout,
  Select,
  TableV2,
  Text,
  TextInput,
  Utils
} from '@harness/uicore'
import type { CellProps, Column } from 'react-table'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import ToggleSection from './ToggleSection'
import CEChart from '../CEChart/CEChart'
import css from './ComputeGroupsSetupBody.module.scss'
import cgBodyCss from '../CGClusterDetailsBody/CGClusterDetailsBody.module.scss'

const dummyData = [
  {
    name: 'ui-server',
    account_id: 'kmpySmUISimoRrJL6NL73w',
    cloud_account_id: 'ccm-demo-1',
    cluster_id: 'clust-ccm-demo-1',
    type: 'Deployment',
    namespace: 'default',
    replica: 3,
    total_cost: 0,
    spot_count: 0,
    on_demand_count: 3
  },
  {
    name: 'redis-cache',
    account_id: 'kmpySmUISimoRrJL6NL73w',
    cloud_account_id: 'ccm-demo-1',
    cluster_id: 'clust-ccm-demo-1',
    type: 'Deployment',
    namespace: 'default',
    replica: 3,
    total_cost: 0,
    spot_count: 1,
    on_demand_count: 2
  },
  {
    name: 'postgres',
    account_id: 'kmpySmUISimoRrJL6NL73w',
    cloud_account_id: 'ccm-demo-1',
    cluster_id: 'clust-ccm-demo-1',
    type: 'Deployment',
    namespace: 'default',
    replica: 3,
    total_cost: 0,
    spot_count: 2,
    on_demand_count: 1
  }
]

const SpotInstancesTab: React.FC = () => {
  const { getString } = useStrings()
  const [selectedVal, setSelectedVal] = useState<string>('none')
  return (
    <Container>
      {/* <Container className={css.noteContainer}>
        <Text icon="info-messaging" iconProps={{ size: 28, margin: { right: 'medium' } }} color={Color.GREY_800}>
          <String stringID="ce.computeGroups.setup.spotInstancesTab.enableNote" useRichText />
        </Text>
      </Container> */}
      <ToggleSection
        title={getString('ce.computeGroups.setup.spotInstancesTab.useSpotSection.header')}
        subTitle={getString('ce.computeGroups.setup.spotInstancesTab.useSpotSection.subHeader')}
        alwaysOpen={selectedVal !== 'none'}
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
              <Radio label={getString('ce.computeGroups.noneLabel')} value="none" />
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
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                style={{ marginRight: 'var(--spacing-xlarge)' }}
              >
                <Layout.Vertical spacing={'medium'}>
                  <Text font={{ variation: FontVariation.H6 }}>
                    {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.totalSpend')}
                  </Text>
                  <Text font={{ variation: FontVariation.H3 }}>{formatCost(2345)}</Text>
                </Layout.Vertical>
                <Layout.Vertical spacing={'medium'}>
                  <Text font={{ variation: FontVariation.H6 }}>
                    {getString('ce.computeGroups.setup.spotInstancesTab.potentialSpendBySpot')}
                  </Text>
                  <Text
                    font={{ variation: FontVariation.H3 }}
                    icon="money-icon"
                    iconProps={{ size: 30 }}
                    color={Color.GREEN_700}
                  >
                    {formatCost(1688, { decimalPoints: 0 })}
                  </Text>
                </Layout.Vertical>
              </Layout.Vertical>
              <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text font={{ variation: FontVariation.H6 }}>
                  {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.savingsPercentage')}
                </Text>
                <Container flex={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                  <CEChart
                    options={
                      {
                        chart: {
                          type: 'pie',
                          width: 180,
                          height: 150
                        },
                        title: {
                          text: `${72.3}%`,
                          align: 'center',
                          verticalAlign: 'middle',
                          y: 85,
                          x: 0
                        },
                        plotOptions: {
                          pie: {
                            slicedOffset: 0,
                            size: '100%',
                            center: ['50%', '120%'],
                            borderWidth: 0,
                            startAngle: -90,
                            dataLabels: {
                              enabled: false
                            },
                            endAngle: 90
                          },
                          series: {
                            states: {
                              hover: {
                                enabled: false,
                                brightness: 0
                              }
                            },
                            enableMouseTracking: false
                          }
                        },
                        tooltip: {
                          enabled: false
                        },
                        series: [
                          {
                            innerSize: '75%',
                            data: [
                              {
                                name: 'Savings',
                                y: 72.3,
                                borderWidth: 0,
                                borderColor: '#00ADE4',
                                color: '#06B7C3'
                              },
                              {
                                name: 'Total',
                                y: 100 - 72.3,
                                color: '#F3F3F3'
                              }
                            ]
                          }
                        ]
                      } as unknown as Highcharts.Options
                    }
                  />
                </Container>
              </Layout.Vertical>
            </Layout.Horizontal>
            <Container className={css.whiteCard}>
              <Layout.Vertical flex={{ alignItems: 'baseline' }} spacing="medium">
                <Text font={{ variation: FontVariation.H6 }}>
                  {getString('ce.computeGroups.setup.spotInstancesTab.workloadToRunOnSpot')}
                </Text>
                <Layout.Horizontal flex style={{ width: '100%' }}>
                  <Container>
                    <Text font={{ variation: FontVariation.H2 }} inline>
                      3/
                    </Text>
                    <Text font={{ variation: FontVariation.H5 }} inline>
                      24
                    </Text>
                  </Container>
                  <CEChart
                    options={{
                      chart: { height: 100, width: 100 },
                      tooltip: {
                        useHTML: true,
                        enabled: true,
                        headerFormat: '',
                        pointFormatter: function (this: Record<string, string | any>) {
                          return `<b>${this.name}</b>: ${this.y}`
                        }
                      },
                      plotOptions: {
                        pie: {
                          allowPointSelect: true,
                          cursor: 'pointer',
                          dataLabels: {
                            enabled: false
                          }
                        }
                      },
                      series: [
                        {
                          name: 'Cost',
                          innerSize: 0,
                          type: 'pie',
                          data: [
                            { name: 'Spot-friendly', id: 'spot', y: 3 },
                            { name: 'Not spot-friendly', id: 'noSpot', y: 21 }
                          ]
                        }
                      ],
                      colors: [Utils.getRealCSSColor(Color.PRIMARY_2), Utils.getRealCSSColor(Color.PRIMARY_4)]
                    }}
                  />
                </Layout.Horizontal>
                <Container flex>
                  <Text
                    font={{ variation: FontVariation.SMALL }}
                    icon="full-circle"
                    iconProps={{ size: 12, color: Color.PRIMARY_4 }}
                    margin={{ right: 'large' }}
                  >
                    {getString('ce.computeGroups.setup.spotInstancesTab.notSpotFriendly') + '(21)'}
                  </Text>
                  <Text
                    font={{ variation: FontVariation.SMALL }}
                    icon="full-circle"
                    iconProps={{ size: 12, color: Color.PRIMARY_2 }}
                  >
                    {getString('ce.computeGroups.setup.spotInstancesTab.spotFriendly') + '(3)'}
                  </Text>
                </Container>
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>
        }
      >
        {selectedVal !== 'none' && <SpotReadyWorkloads />}
      </ToggleSection>
    </Container>
  )
}

const DistributionCell = (tableProps: CellProps<any>) => {
  const { getString } = useStrings()
  const [isEditable, setIsEditable] = useState(false)
  const [spotVal, setSpotVal] = useState<number>(get(tableProps, 'row.original.spot_count', 0) as number)
  const [onDemandVal, setOnDemandVal] = useState<number>(get(tableProps, 'row.original.on_demand_count', 0) as number)
  const total = spotVal + onDemandVal
  const spotPercentage = ((spotVal / total) * 100).toFixed(2)
  const onDemandPercentage = ((onDemandVal / total) * 100).toFixed(2)
  return (
    <Container>
      <Layout.Horizontal spacing={'large'} className={cgBodyCss.distributionCell}>
        <Container>
          <Text className={cgBodyCss.head}>{getString('ce.nodeRecommendation.spot')}</Text>
          {isEditable ? (
            <TextInput
              value={`${spotVal}`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const updatedSpotVal = Number(e.target.value)
                setSpotVal(updatedSpotVal)
                setOnDemandVal(total - updatedSpotVal)
              }}
            />
          ) : (
            <Text className={cgBodyCss.value}>{`${spotVal} (${spotPercentage}%)`}</Text>
          )}
        </Container>
        <Container>
          <Text className={cgBodyCss.head}>{getString('ce.nodeRecommendation.onDemand')}</Text>
          {isEditable ? (
            <TextInput
              value={`${onDemandVal}`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const updatedOnDemandVal = Number(e.target.value)
                setOnDemandVal(updatedOnDemandVal)
                setSpotVal(total - updatedOnDemandVal)
              }}
            />
          ) : (
            <Text className={cgBodyCss.value}>{`${onDemandVal} (${onDemandPercentage}%)`}</Text>
          )}
        </Container>
        <Container flex={{ justifyContent: 'center' }}>
          {!isEditable && <Icon name="Edit" onClick={() => setIsEditable(true)} style={{ cursor: 'pointer' }} />}
        </Container>
      </Layout.Horizontal>
      {isEditable && <Button text={getString('save')} onClick={() => setIsEditable(false)} />}
    </Container>
  )
}

const StrategyCell = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'small'} className={cgBodyCss.strategyCell}>
      <Select
        defaultSelectedItem={{
          label: getString('ce.recommendation.detailsPage.costOptimized'),
          value: 'costOptimized'
        }}
        items={[
          { label: getString('ce.recommendation.detailsPage.costOptimized'), value: 'costOptimized' },
          { label: getString('ce.computeGroups.leastInterrupted'), value: 'leastInterrupted' }
        ]}
      />
      <TextInput placeholder={getString('ce.computeGroups.baseOnDemandCapacity')} />
    </Layout.Vertical>
  )
}

const ReplicasCell = (tableProps: CellProps<any>) => {
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
      <Text>{tableProps.value}</Text>
      <CEChart
        options={{
          chart: { height: 100, width: 100 },
          tooltip: {
            useHTML: true,
            enabled: true,
            headerFormat: '',
            pointFormatter: function (this: Record<string, string | any>) {
              return `<b>${this.name}</b>: ${this.y}`
            }
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: false
              }
            }
          },
          series: [
            {
              name: 'Cost',
              innerSize: 0,
              type: 'pie',
              data: [
                { name: 'Spot', id: 'spot', y: get(tableProps, 'row.original.spot_count', 0) as number },
                { name: 'On-demand', id: 'on-demand', y: get(tableProps, 'row.original.on_demand_count', 0) as number }
              ]
            }
          ],
          colors: [Utils.getRealCSSColor(Color.PRIMARY_2), Utils.getRealCSSColor(Color.PRIMARY_4)]
        }}
      />
    </Layout.Horizontal>
  )
}

const SpotReadyWorkloads: React.FC = () => {
  const { getString } = useStrings()

  const columns: Column<any>[] = useMemo(
    // TODO: replace type here
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        width: '20%',
        Cell: tableProps => (
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.LEAD }}>{tableProps.value}</Text>
            <Text>{`${getString('typeLabel')}: ${tableProps.row.original.type}`}</Text>
          </Layout.Vertical>
        )
        // serverSortProps: getServerSortProps({
        //   enableServerSort: true,
        //   accessor: 'name',
        //   sortByObj: sortObj,
        //   setSortByObj: handleSort
        // })
      },
      {
        accessor: 'namespace',
        Header: getString('common.namespace'),
        width: '10%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'replica',
        Header: getString('ce.computeGroups.replicas'),
        width: '15%',
        Cell: ReplicasCell
      },
      {
        accessor: 'id',
        Header: getString('ce.nodeRecommendation.distribution'),
        width: '20%',
        Cell: DistributionCell
      },
      {
        accessor: 'type',
        Header: getString('ce.computeGroups.strategy'),
        width: '20%',
        Cell: StrategyCell
      },
      {
        accessor: 'total_cost',
        Header: getString('ce.overview.totalCost'),
        width: '10%',
        Cell: tableProps => <Text>{formatCost(tableProps.value)}</Text>
      },
      {
        accessor: 'someother',
        Header: getString('ce.recommendation.sideNavText'),
        width: '15%',
        Cell: () => (
          <Text
            rightIcon="main-share"
            rightIconProps={{ size: 12, color: Color.PRIMARY_7 }}
            color={Color.PRIMARY_7}
          >{`Save upto $323`}</Text>
        )
      }
    ],
    []
  )

  return (
    <Layout.Vertical spacing={'medium'}>
      <TableV2 columns={columns} data={dummyData} />
    </Layout.Vertical>
  )
}

export default SpotInstancesTab
