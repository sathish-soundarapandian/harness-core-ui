/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useState } from 'react'
import { Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import ToggleSection from './ToggleSection'
import FixedSchedules from '../COGatewayConfig/steps/AdvancedConfiguration/FixedSchedules'
import type { FixedScheduleClient } from '../COCreateGateway/models'
import css from './ComputeGroupsSetupBody.module.scss'

const SchedulingAutostoppingTab: React.FC = () => {
  const { getString } = useStrings()
  const [selectedVal, setSelectedVal] = useState<string>()
  const [schedules, setSchedules] = useState<FixedScheduleClient[]>([])
  return (
    <Container className={css.scheduleAutostoppingContainer}>
      <ToggleSection
        title={getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.setupHeader')}
        mainContent={
          <Layout.Vertical spacing={'medium'} margin={{ top: 'large' }}>
            <Text font={{ variation: FontVariation.LEAD }}>
              {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.selectScopeLabel')}
            </Text>
            <RadioGroup
              selectedValue={selectedVal}
              onChange={(e: FormEvent<HTMLInputElement>) => setSelectedVal(e.currentTarget.value)}
            >
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
            <Container className={css.whiteCard}>
              <Text font={{ variation: FontVariation.H6 }}>
                {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.totalSpend')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }}>{'$2345'}</Text>
            </Container>
            <Container className={css.whiteCard}>
              <Text font={{ variation: FontVariation.H6 }}>
                {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.potentialSpendByPolicies')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }} icon="money-icon" iconProps={{ size: 30 }}>
                {formatCost(16500, { decimalPoints: 0 })}
              </Text>
            </Container>
            <Container className={css.whiteCard}>
              <Text font={{ variation: FontVariation.H6 }}>
                {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.savingsPercentage')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }}>{'72.38 %'}</Text>
            </Container>
          </Layout.Horizontal>
        }
      >
        <Layout.Vertical spacing={'medium'}>
          <Text font={{ variation: FontVariation.H5 }}>
            {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.specifyScheduleHeader')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.specifyScheduleSubheader')}
          </Text>
          <FixedSchedules addSchedules={scheds => setSchedules(scheds)} schedules={schedules} hideDescription />
        </Layout.Vertical>
      </ToggleSection>
    </Container>
  )
}

export default SchedulingAutostoppingTab
