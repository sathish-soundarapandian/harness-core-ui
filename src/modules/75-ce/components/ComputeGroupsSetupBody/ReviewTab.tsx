/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import css from './ComputeGroupsSetupBody.module.scss'

interface PreviewDataRowProps {
  title: string
  value: string
  isSavingsRow?: boolean
  underlineItem?: boolean
}

const ReviewTab: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'xxlarge'}>
      <Layout.Horizontal spacing={'large'} padding={'large'} background={Color.PRIMARY_1}>
        <Container className={css.whiteCard}>
          <Layout.Vertical spacing={'large'}>
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.totalSpend')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{'$2345'}</Text>
          </Layout.Vertical>
        </Container>
        <Container className={css.whiteCard}>
          <Layout.Vertical spacing={'large'}>
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.potentialSpendByPolicies')}
            </Text>
            <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'end' }}>
              <Text
                font={{ variation: FontVariation.H3 }}
                icon="money-icon"
                iconProps={{ size: 30 }}
                color={Color.GREEN_700}
              >
                {formatCost(16500, { decimalPoints: 0 })}
              </Text>
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREEN_700}>
                (72.38%)
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
      <SpotInstancesPreview />
      <PreferencesPreview />
      <SchedulingAutoStoppingPreview />
    </Layout.Vertical>
  )
}

const PreviewDataRow: React.FC<PreviewDataRowProps> = ({ title, value, isSavingsRow, underlineItem }) => {
  return (
    <Layout.Horizontal
      spacing={'small'}
      flex={{ alignItems: 'center' }}
      className={cx(css.previewRow, { [css.savingsRow]: isSavingsRow, [css.underlineItem]: underlineItem })}
    >
      <Text>{title}</Text>
      <Text font={{ variation: FontVariation.LEAD }}>{value}</Text>
    </Layout.Horizontal>
  )
}

const SpotInstancesPreview: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'large'}>
      <Text font={{ variation: FontVariation.H6 }}>{getString('ce.computeGroups.setup.spotInstancesTab.title')}</Text>
      <Container className={css.whiteCard}>
        <PreviewDataRow
          title={getString('ce.computeGroups.setup.spotInstancesTab.workloadToRunOnSpot')}
          value={'3/24'}
        />
        <PreviewDataRow
          title={getString('ce.computeGroups.setup.reviewTab.savingsBySpotInstances')}
          value="$321.12"
          isSavingsRow
        />
      </Container>
    </Layout.Vertical>
  )
}

const PreferencesPreview: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'xlarge'}>
      <Text font={{ variation: FontVariation.H6 }}>{getString('preferences')}</Text>
      <Container className={css.whiteCard}>
        <Text font={{ variation: FontVariation.LEAD }}>
          {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.header')}
        </Text>
        <PreviewDataRow
          title={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.clusterBufferTitle'
          )}
          value={'On-Demand (xx% CPU , xx%GPU)       Spot (xx% CPU , xx%GPU)'}
          underlineItem
        />
        <PreviewDataRow
          title={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.reverseFallbackTitle'
          )}
          value={'1 hour'}
          underlineItem
        />
        <PreviewDataRow
          title={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.nodeDeletionDelayTitle'
          )}
          value={'10 minutes'}
          underlineItem
        />
        <PreviewDataRow
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.binPackingTitle')}
          value={''}
          underlineItem
        />
        <PreviewDataRow
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.cpuLimitTitle')}
          value={'CPU range (xx min, xx max)'}
        />
        <Text font={{ variation: FontVariation.LEAD }}>
          {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.header')}
        </Text>
        <PreviewDataRow
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.nodeSelectionLabel')}
          value={'Node constraints:   min(xx CPU , xx mem)                                  max(xx CPU , xx mem)'}
        />
      </Container>
    </Layout.Vertical>
  )
}

const SchedulingAutoStoppingPreview: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'large'}>
      <Text font={{ variation: FontVariation.H6 }}>{getString('ce.computeGroups.setup.schedulingTab.title')}</Text>
      <Container className={css.whiteCard}>
        <PreviewDataRow title={getString('common.scope')} value={'Entire Cluster'} underlineItem />
        <PreviewDataRow
          title={getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.fixedSchedule')}
          value="2/11/2021-17/11/2021 | 12.00AM-6.00AM | S S M T W T F"
        />
        <PreviewDataRow
          title={getString('ce.computeGroups.setup.reviewTab.savingsByScheduling')}
          value="$321.12"
          isSavingsRow
        />
      </Container>
    </Layout.Vertical>
  )
}

export default ReviewTab
