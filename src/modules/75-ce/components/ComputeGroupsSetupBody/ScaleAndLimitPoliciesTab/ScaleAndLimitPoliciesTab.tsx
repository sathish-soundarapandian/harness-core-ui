/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Checkbox, Color, Container, FontVariation, FormInput, Layout, Text, useToggle } from '@harness/uicore'
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
        title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.instanceFamiliesSection.header')}
        subTitle={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.instanceFamiliesSection.subHeader')}
      >
        <Container>
          <InstanceFamiliesSelectorTable />
        </Container>
      </ToggleSection>
      <ToggleSection
        title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.header')}
        subTitle={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.subHeader')}
      >
        <FieldContainerWithCheckbox
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.clusterHeadroomTitle')}
          subTitle={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.clusterHeadroomSubtitle'
          )}
        >
          <ClusterHeadroom enable={true} />
        </FieldContainerWithCheckbox>
        <FieldContainerWithCheckbox
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.onDemandFallbackTitle')}
          subTitle=""
        >
          <OnDemandFallback enable={true} />
        </FieldContainerWithCheckbox>
        <FieldContainerWithCheckbox
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.nodeConstraintsTitle')}
          subTitle={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.nodeConstraintsSubtitle'
          )}
        >
          <NodeConstraints enable={true} />
        </FieldContainerWithCheckbox>
        <FieldContainerWithCheckbox
          title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.rootVolRatioTitle')}
          subTitle={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.rootVolRatioSubtitle')}
        >
          <RootVolumeRatio enable={true} />
        </FieldContainerWithCheckbox>
      </ToggleSection>
      <ToggleSection
        title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.header')}
        subTitle={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.subHeader')}
        className={css.nodeDeletionPolicySection}
      >
        <TTLSettings />
      </ToggleSection>
      <ToggleSection
        title={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.header')}
        subTitle={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.subHeader')}
      >
        <CPURange />
      </ToggleSection>
    </Container>
  )
}

const ClusterHeadroom: React.FC<FieldConfigProps> = ({ enable }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing={'huge'}>
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="defaultClusterCpu"
            placeholder={'% ' + getString('ce.common.cpu')}
            label={getString('common.defaultSettings')}
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
            label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.spotNodeSettingsLabel')}
            disabled={!enable}
          />
          <FormInput.Text name="spotClusterMemory" placeholder={'% ' + getString('ce.common.gib')} disabled={!enable} />
        </Layout.Horizontal>
      </Container>
    </Layout.Horizontal>
  )
}

const OnDemandFallback: React.FC<FieldConfigProps> = ({ enable }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex>
      <FormInput.MultiTypeInput
        label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.retryTimeLabel')}
        name="retryTime"
        selectItems={[]}
        disabled={!enable}
        multiTypeInputProps={{
          placeholder: getString('timeMinutes')
        }}
      />
    </Layout.Horizontal>
  )
}

const NodeConstraints: React.FC<FieldConfigProps> = ({ enable }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing={'huge'}>
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="nodeMinCpu"
            placeholder={getString('ce.common.cpu')}
            label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.minCpuLabel')}
            disabled={!enable}
          />
          <FormInput.Text
            name="nodeMinMemory"
            placeholder={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.minMemoryLabel')}
            disabled={!enable}
          />
        </Layout.Horizontal>
      </Container>
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="nodeMaxCpu"
            placeholder={getString('ce.common.cpu')}
            label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.maxCpuLabel')}
            disabled={!enable}
          />
          <FormInput.Text
            name="nodeMaxMemory"
            placeholder={getString('ce.nodeRecommendation.item4')}
            disabled={!enable}
          />
        </Layout.Horizontal>
      </Container>
    </Layout.Horizontal>
  )
}

const RootVolumeRatio: React.FC<FieldConfigProps> = ({ enable }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="huge">
      <Container>
        <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing="large">
          <FormInput.Text
            name="nodeMinCpu"
            placeholder={getString('ce.common.cpu')}
            label={getString('ce.common.cpu')}
            disabled={!enable}
          />
          <FormInput.Text
            name="nodeMinMemory"
            label={getString('ce.common.storage')}
            placeholder={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.unSchedPodsSection.minMemoryLabel')}
            disabled={!enable}
          />
        </Layout.Horizontal>
      </Container>
    </Layout.Horizontal>
  )
}

const TTLSettings: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }} margin={{ left: 'xxlarge' }}>
      <Text font={{ variation: FontVariation.LEAD }}>
        {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.ttlSettingsTitle')}
      </Text>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.ttleSettingsSubtitle')}
      </Text>
      <Container className={css.ttlDropdownSelector}>
        <FormInput.Select
          name="ttl"
          items={[]}
          label={getString(
            'ce.computeGroups.setup.scalingLimitPoliciesTab.nodeDeletionPolicySection.emptyNodeAliveLabel'
          )}
        />
      </Container>
    </Layout.Vertical>
  )
}

const CPURange: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical margin={{ left: 'xxlarge' }}>
      <Text font={{ variation: FontVariation.LEAD }}>
        {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.cpuRangeTitle')}
      </Text>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
        {getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.cpuRangeSubtitle')}
      </Text>
      <Layout.Horizontal spacing="large">
        <FormInput.Text
          name="minCores"
          label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.minCoreLabel')}
          placeholder={getString('ce.common.cpu')}
        />
        <FormInput.Text
          name="maxCores"
          label={getString('ce.computeGroups.setup.scalingLimitPoliciesTab.cpuLimitPolicySection.maxCoreLabel')}
          placeholder={getString('ce.common.cpu')}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const FieldContainerWithCheckbox: React.FC<FieldContainerWithCheckboxProps> = ({ children, title, subTitle }) => {
  const [enable, toggleEnable] = useToggle(false)
  return (
    <Layout.Horizontal>
      <Checkbox checked={enable} onChange={toggleEnable} />
      <Layout.Vertical spacing={'small'}>
        <Container>
          <Text font={{ variation: FontVariation.LEAD }}>{title}</Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {subTitle}
          </Text>
        </Container>
        <Container>{React.cloneElement(children as React.ReactElement<any>, { enable: true })}</Container>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default ScaleAndLimitPoliciesTab
