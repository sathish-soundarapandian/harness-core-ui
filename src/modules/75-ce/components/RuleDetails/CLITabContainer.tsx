/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo } from 'lodash-es'
import { Container, FontVariation, Layout, Tab, Tabs, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import CommandBlock from '@ce/common/CommandBlock/CommandBlock'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { Provider } from '@ce/components/COCreateGateway/models'
import { allProviders, ceConnectorTypes } from '@ce/constants'
import { Utils } from '@ce/common/Utils'
import DownloadCLI from '../DownloadCLI/DownloadCLI'
import css from './RuleDetailsBody.module.scss'

interface CLITabContainerProps {
  ruleName: string
  connectorData?: ConnectorInfoDTO
}

const DownloadCliStep = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Text className={css.sshStepIndicator} font={{ variation: FontVariation.H6 }}>
        {getString('ce.co.ruleDetails.sshTab.step1.indicator') + ':'}
      </Text>
      <Layout.Vertical spacing={'small'} className={css.sshStepText}>
        <Container>
          <Text font={{ variation: FontVariation.H6 }}>
            {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.download')}
          </Text>
          <Text font={{ variation: FontVariation.BODY }}>{getString('ce.co.ruleDetails.sshTab.step1.info')}</Text>
        </Container>
        <DownloadCLI showInfoText={false} />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const ApplyCommandsStep = ({ ruleName, connectorData }: { ruleName: string; connectorData?: ConnectorInfoDTO }) => {
  const { getString } = useStrings()
  const cloudProvider = connectorData?.type && ceConnectorTypes[connectorData.type]
  const provider = useMemo(() => allProviders.find(item => item.value === cloudProvider), [cloudProvider])
  const isGcpProvider = Utils.isProviderGcp(defaultTo(provider, {}) as Provider)
  const isAwsProvider = Utils.isProviderAws(defaultTo(provider, {}) as Provider)
  return (
    <Container>
      <Layout.Horizontal>
        <Text className={css.sshStepIndicator} font={{ variation: FontVariation.H6 }}>
          {getString('ce.co.ruleDetails.sshTab.step2.indicator') + ':'}
        </Text>
        <Layout.Vertical spacing={'small'} className={css.sshStepText}>
          <Container>
            <Text font={{ variation: FontVariation.H6 }}>{getString('ce.co.ruleDetails.sshTab.step2.title')}</Text>
            <Text font={{ variation: FontVariation.BODY }}>{getString('ce.co.ruleDetails.sshTab.step2.info')}</Text>
          </Container>
          <Container className={css.sshTabs}>
            <Tabs id={'requirements'}>
              <Tab
                id={'ssh'}
                title="SSH"
                panel={
                  <CommandBlock
                    allowCopy
                    commandSnippet={`harness ssh --name ${ruleName} --user ubuntu -- <any_ssh_params>`}
                  />
                }
              />
              <Tab
                id="rdp"
                title="RDP"
                panel={<CommandBlock allowCopy commandSnippet={`harness rdp --name ${ruleName}`} />}
              />
              {isAwsProvider && (
                <Tab
                  id="ssm"
                  title="SSM"
                  panel={
                    <CommandBlock
                      allowCopy
                      commandSnippet={`harness smm start-session --name ${ruleName} -- --document-name AWS-StartPortForwardingSession --parameters "localPortNumber=54321,portNumber=22" --region ap-south-1`}
                    />
                  }
                />
              )}
              {isGcpProvider && (
                <Tab
                  id="gcloud"
                  title="gcloud"
                  panel={
                    <CommandBlock
                      allowCopy
                      commandSnippet={`harness gcloud ssh --name ${ruleName} -- --project=<gcp_project_name>`}
                    />
                  }
                />
              )}
            </Tabs>
          </Container>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Container>
  )
}

const CLITabContainer: React.FC<CLITabContainerProps> = props => {
  const { getString } = useStrings()

  return (
    <Container className={css.tabRowContainer}>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H6 }}>{getString('ce.co.ruleDetails.sshTab.header')}</Text>
        <Text font={{ variation: FontVariation.BODY }}>{getString('ce.co.ruleDetails.sshTab.description')}</Text>
      </Layout.Vertical>
      <Layout.Vertical spacing="medium" margin={{ top: 'medium' }}>
        <DownloadCliStep />
        <ApplyCommandsStep ruleName={props.ruleName} connectorData={props.connectorData} />
      </Layout.Vertical>
    </Container>
  )
}

export default CLITabContainer
