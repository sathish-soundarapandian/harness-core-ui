/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import CopyButton from '@ce/common/CopyButton'
import css from './ComputeGroupsSetupBody.module.scss'

const infoSteps = [
  'ce.computeGroups.setup.clusterPermissionsTab.info1',
  'ce.computeGroups.setup.clusterPermissionsTab.info2',
  'ce.computeGroups.setup.clusterPermissionsTab.info3',
  'ce.computeGroups.setup.clusterPermissionsTab.info4'
]

interface CopyCodeSectionProps {
  snippet: string
}

const ClusterPermissionsTab: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'large'}>
      <Container className={css.noteContainer}>
        <Text icon="info-messaging" iconProps={{ size: 28, margin: { right: 'medium' } }} color={Color.GREY_800}>
          <String stringID="ce.computeGroups.setup.clusterPermissionsTab.note" useRichText />
        </Text>
      </Container>
      <Layout.Vertical className={css.independentSection} spacing="xlarge">
        <Layout.Vertical spacing={'medium'}>
          <Text font={{ variation: FontVariation.LEAD }}>
            {getString('connectors.ceK8.providePermissionsStep.fileDescription.heading')}
          </Text>
          {infoSteps.map((stepId, i) => (
            <Text key={stepId}>{`${i + 1}. ${getString(stepId as keyof StringsMap)}`}</Text>
          ))}
        </Layout.Vertical>
        <Container>
          <Layout.Vertical spacing={'large'}>
            <Container>
              <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start' }}>
                <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7}>
                  STEP 1
                </Text>
                <Text>{getString('ce.cloudIntegration.autoStoppingModal.installComponents.step1')}</Text>
                <Button variation={ButtonVariation.SECONDARY} rightIcon="command-install">
                  {getString('connectors.ceK8.providePermissionsStep.downloadYamlBtnText')}
                </Button>
                <Button variation={ButtonVariation.SECONDARY} rightIcon="main-share">
                  {getString('ce.cloudIntegration.autoStoppingModal.installComponents.previewYaml')}
                </Button>
              </Layout.Horizontal>
            </Container>
            <Container>
              <Layout.Horizontal spacing={'medium'}>
                <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7}>
                  STEP 2
                </Text>
                <Container>
                  <Text>{getString('ce.cloudIntegration.autoStoppingModal.installComponents.step2')}</Text>
                  <CopyCodeSection snippet="kubectl create namespace harness-autostopping" />
                </Container>
              </Layout.Horizontal>
            </Container>
            <Container>
              <Layout.Horizontal spacing={'medium'}>
                <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7}>
                  STEP 3
                </Text>
                <Text>{getString('ce.computeGroups.setup.clusterPermissionsTab.testConnection')}</Text>
              </Layout.Horizontal>
            </Container>
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

const CopyCodeSection: React.FC<CopyCodeSectionProps> = ({ snippet }) => {
  return (
    <Container flex={{ justifyContent: 'space-between', alignItems: 'center' }} className={css.copyCommand}>
      <Text>{snippet}</Text>
      <CopyButton textToCopy={snippet} />
    </Container>
  )
}

export default ClusterPermissionsTab
