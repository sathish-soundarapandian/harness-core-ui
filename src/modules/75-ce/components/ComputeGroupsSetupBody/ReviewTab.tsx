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
      <SchedulingAutoStoppingPreview />
    </Layout.Vertical>
  )
}

const PreviewDataRow: React.FC<PreviewDataRowProps> = ({ title, value, isSavingsRow }) => {
  return (
    <Layout.Horizontal
      spacing={'small'}
      flex={{ alignItems: 'center' }}
      className={cx(css.previewRow, { [css.savingsRow]: isSavingsRow })}
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

const SchedulingAutoStoppingPreview: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'large'}>
      <Text font={{ variation: FontVariation.H6 }}>{getString('ce.computeGroups.setup.schedulingTab.title')}</Text>
      <Container className={css.whiteCard}>
        <PreviewDataRow title={getString('common.scope')} value={'Entire Cluster'} />
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
