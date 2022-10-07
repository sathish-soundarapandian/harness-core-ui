/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Checkbox, Color, Container, FontVariation, FormInput, Layout, Radio, Text, useToggle } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import ToggleSection from '../ToggleSection'
import InstanceFamiliesSelectorTable from './InstanceFamiliesSelectorTable'
import css from './ScaleAndLimitPoliciesTab.module.scss'

interface FieldContainerWithCheckboxProps {
  title: string
  subTitle: string
}

interface FieldConfigProps {
  enable: boolean
}

const ScaleAndLimitPoliciesTab: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.scaleLimitPoliciesTabContainer}>
      <ToggleSection
        hideToggle
        title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.header')}
      >
        <FieldContainerWithCheckbox
          title={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.clusterBufferTitle'
          )}
          subTitle={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.clusterBufferSubtitle'
          )}
        >
          <ClusterBuffer enable={true} />
        </FieldContainerWithCheckbox>
        <FieldContainerWithCheckbox
          title={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.reverseFallbackTitle'
          )}
          subTitle={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.reverseFallbackSubtitle'
          )}
        >
          <OnDemandFallback enable={true} />
        </FieldContainerWithCheckbox>
        <FieldContainerWithCheckbox
          title={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.nodeDeletionDelayTitle'
          )}
          subTitle={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.nodeDeletionDelaySubtitle'
          )}
        >
          <NodeDeletionDelay enable={true} />
        </FieldContainerWithCheckbox>
        <FieldContainerWithCheckbox
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.binPackingTitle')}
          subTitle=""
        />
        <FieldContainerWithCheckbox
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.cpuLimitTitle')}
          subTitle={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.cpuLimitsSubtitle'
          )}
        >
          <RootVolumeRatio enable={true} />
        </FieldContainerWithCheckbox>
      </ToggleSection>
      <ToggleSection
        hideToggle
        title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.header')}
        className={css.nodeDeletionPolicySection}
      >
        <NodePreferences />
      </ToggleSection>
      {/* <ToggleSection
        hideToggle
        title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.header')}
        subTitle={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.subHeader')}
      >
        <CPURange />
      </ToggleSection> */}
    </Container>
  )
}

const ClusterBuffer: React.FC<FieldConfigProps> = ({ enable }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing={'huge'}>
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="defaultClusterCpu"
            placeholder={'% ' + getString('ce.common.cpu')}
            label={getString(
              'ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.onDemandNodesLabel'
            )}
            disabled={!enable}
          />
          <FormInput.Text
            name="defaultClusterMemory"
            placeholder={'% ' + getString('ce.common.gib')}
            disabled={!enable}
          />
        </Layout.Horizontal>
      </Container>
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="spotClusterCpu"
            placeholder={'% ' + getString('ce.common.cpu')}
            label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.spotNodesLabel')}
            disabled={!enable}
          />
          <FormInput.Text name="spotClusterMemory" placeholder={'% ' + getString('ce.common.gib')} disabled={!enable} />
        </Layout.Horizontal>
      </Container>
    </Layout.Horizontal>
  )
}

const OnDemandFallback: React.FC<FieldConfigProps> = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'end' }} spacing={'large'}>
      <FormInput.Text
        name="retryTimeValue"
        label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.retryTimeLabel')}
      />
      <FormInput.Select name="retryTimeUnit" items={[]} />
    </Layout.Horizontal>
  )
}

const NodeDeletionDelay: React.FC<FieldConfigProps> = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'end' }} spacing={'large'}>
      <FormInput.Text
        name="delayTimeValue"
        label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.delayTimeLabel')}
      />
      <FormInput.Select name="delayTimeUnit" items={[]} />
    </Layout.Horizontal>
  )
}

const RootVolumeRatio: React.FC<FieldConfigProps> = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="huge">
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="nodeMinCpu"
            placeholder={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.min')}
            label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.cpuRangeLabel')}
          />
          <FormInput.Text
            name="nodeMaxCpu"
            placeholder={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.max')}
          />
        </Layout.Horizontal>
      </Container>
    </Layout.Horizontal>
  )
}

const NodePreferences: React.FC = () => {
  const { getString } = useStrings()
  const [selectedOption, setSelectedOption] = useState('instanceFamily')
  return (
    <Layout.Vertical spacing={'large'}>
      <Text font={{ variation: FontVariation.LEAD }}>
        {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.nodeSelectionLabel')}
      </Text>
      <Radio
        label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.byInstanceFamilies')}
        checked={selectedOption === 'instanceFamily'}
        value={'instanceFamily'}
        onChange={() => setSelectedOption('instanceFamily')}
      />
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.byInstanceFamiliesSubtitle')}
      </Text>
      {selectedOption === 'instanceFamily' && <InstanceFamiliesSelectorTable />}
      <Radio
        label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.byNodeConstraints')}
        checked={selectedOption === 'constraint'}
        value={'constraint'}
        onChange={() => setSelectedOption('constraint')}
      />
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.clusterPreferencesSection.cpuLimitsSubtitle')}
      </Text>
      {selectedOption === 'constraint' && <NodeConstraints />}
    </Layout.Vertical>
  )
}

const NodeConstraints: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing={'huge'}>
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="nodeMinCpu"
            placeholder={getString('ce.common.cpu')}
            label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.minCpuLabel')}
          />
          <FormInput.Text
            name="nodeMinMemory"
            placeholder={getString(
              'ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.minMemoryLabel'
            )}
          />
        </Layout.Horizontal>
      </Container>
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="nodeMaxCpu"
            placeholder={getString('ce.common.cpu')}
            label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodePreferencesSection.maxCpuLabel')}
          />
          <FormInput.Text name="nodeMaxMemory" placeholder={getString('ce.nodeRecommendation.item4')} />
        </Layout.Horizontal>
      </Container>
    </Layout.Horizontal>
  )
}

// const TTLSettings: React.FC = () => {
//   const { getString } = useStrings()
//   return (
//     <Layout.Vertical flex={{ alignItems: 'flex-start' }} margin={{ left: 'xxlarge' }}>
//       <Text font={{ variation: FontVariation.LEAD }}>
//         {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.ttlSettingsTitle')}
//       </Text>
//       <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
//         {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.ttleSettingsSubtitle')}
//       </Text>
//       <Container className={css.ttlDropdownSelector}>
//         <FormInput.Select
//           name="ttl"
//           items={[]}
//           label={getString(
//             'ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.emptyNodeAliveLabel'
//           )}
//         />
//       </Container>
//     </Layout.Vertical>
//   )
// }

// const CPURange: React.FC = () => {
//   const { getString } = useStrings()
//   return (
//     <Layout.Vertical margin={{ left: 'xxlarge' }}>
//       <Text font={{ variation: FontVariation.LEAD }}>
//         {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.cpuRangeTitle')}
//       </Text>
//       <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
//         {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.cpuRangeSubtitle')}
//       </Text>
//       <Layout.Horizontal spacing="large">
//         <FormInput.Text
//           name="minCores"
//           label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.minCoreLabel')}
//           placeholder={getString('ce.common.cpu')}
//         />
//         <FormInput.Text
//           name="maxCores"
//           label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.maxCoreLabel')}
//           placeholder={getString('ce.common.cpu')}
//         />
//       </Layout.Horizontal>
//     </Layout.Vertical>
//   )
// }

const FieldContainerWithCheckbox: React.FC<FieldContainerWithCheckboxProps> = ({ children, title, subTitle }) => {
  const [enable, toggleEnable] = useToggle(false)
  return (
    <Layout.Horizontal>
      <Checkbox checked={enable} onChange={toggleEnable} />
      <Layout.Vertical spacing={'small'}>
        <Container>
          <Text font={{ variation: FontVariation.LEAD }}>{title}</Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} style={{ width: '60%' }}>
            {subTitle}
          </Text>
        </Container>
        <Container>{children && React.cloneElement(children as React.ReactElement<any>, { enable: true })}</Container>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default ScaleAndLimitPoliciesTab
