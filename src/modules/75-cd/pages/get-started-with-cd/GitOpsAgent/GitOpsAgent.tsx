/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { Button, ButtonVariation, Container, HarnessDocTooltip, Layout, PageSpinner, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useAgentServiceForServerCreate, V1AgentType, useAgentServiceForServerList, V1Agent } from 'services/gitops'
import { useCDOnboardingContext } from '@cd/pages/get-started-with-cd/CDOnboardingStore'
import { GitOpsAgentCard } from './GitOpsAgentCard'
import { AgentProvision } from './AgentProvision'
import css from '../GetStartedWithCD.module.scss'
import createK8sCSS from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import deployCSS from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

const AgentStaticInfo = ({ getString }: { getString: UseStringsReturn['getString'] }) => (
  <Container>
    <ul className={classnames(createK8sCSS.progress, deployCSS.marginTop20)}>
      <li className={classnames(createK8sCSS.progressItem, createK8sCSS.progressItemActive, css.progressItem)}>
        <div className={css.agentFirstSection}>
          <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentExplain')}</Text>
        </div>
        <Text font={{ variation: FontVariation.FORM_INPUT_TEXT }} margin={{ top: 'small' }} color={Color.GREY_800}>
          {getString('cd.getStartedWithCD.hostedAgentExplainContent')}
        </Text>
      </li>
      <li className={classnames(createK8sCSS.progressItem, createK8sCSS.progressItemActive, css.progressItem)}>
        <div>
          <div className={css.agentSecondSection}>
            <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentInstall')}</Text>
          </div>
          <div className={css.installedComponent}>
            <div className={css.blueDot} />
            {getString('cd.getStartedWithCD.gitOpsAgent')}
          </div>
          <div className={css.installedComponent}>
            <div className={css.blueDot} />
            {getString('cd.getStartedWithCD.repoServer')}
          </div>
          <div className={css.installedComponent}>
            <div className={css.blueDot} />
            {getString('cd.getStartedWithCD.redisCache')}
          </div>
          <div className={css.installedComponent}>
            <div className={css.blueDot} />
            {getString('cd.getStartedWithCD.applicationController')}
          </div>
          <div className={classnames(css.installedComponent, css.provisioningText)}>
            {getString('cd.getStartedWithCD.provisioningText')}
          </div>
        </div>
      </li>
    </ul>
  </Container>
)

export const GitOpsAgent = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { getString } = useStrings()
  // isProvisioningScreen is 2nd screen
  const [isProvisioningScreen, setIsProvisioningScreen] = React.useState(false)
  const [selectedAgent, setSelectedAgent] = React.useState<V1Agent | null>(null)
  const [provisionedAgent, setProvisionedAgent] = React.useState<V1Agent | undefined>()
  const { accountId } = useParams<ProjectPathProps>()
  const { saveAgentData } = useCDOnboardingContext()

  const {
    mutate: createAgent,
    loading: agentCreateLoading,
    error: agentCreateError
  } = useAgentServiceForServerCreate({})
  const onProvisionAgent = async () => {
    setIsProvisioningScreen(true)
    const _uuid = uuid().split('-')[0]
    const payload = {
      name: `hostedagent${_uuid}`,
      identifier: `hostedagent${_uuid}`,
      type: 'HOSTED_ARGO_PROVIDER' as V1AgentType,
      metadata: {
        highAvailability: false,
        existingInstallation: false
      },
      accountIdentifier: accountId
    }
    await createAgent(payload)
      .then(agent => {
        setProvisionedAgent(agent)
      })
      .catch(noop)
  }

  const {
    data: agentList,
    loading: loadingAgentsList
    // error: agentFetchError,
    // refetch: refetchAgentsList
  } = useAgentServiceForServerList({
    queryParams: {
      pageIndex: 0,
      pageSize: 10,
      searchTerm: '',
      accountIdentifier: accountId,
      type: 'HOSTED_ARGO_PROVIDER'
    }
    // lazy: true
  })

  React.useEffect(() => {
    if (!loadingAgentsList && agentList?.content?.length) {
      setSelectedAgent(agentList.content[0])
      setIsProvisioningScreen(true)
    }
  }, [loadingAgentsList])

  const renderContent = () => {
    if (loadingAgentsList) {
      return (
        <Container className={createK8sCSS.spinner}>
          <PageSpinner message={getString('cd.fetchingAgent')} />
        </Container>
      )
    }
    if (agentList?.content?.length) {
      return (
        <>
          <Text padding={{ bottom: 'medium' }} color={Color.GREY_800} font={{ weight: 'semi-bold' }}>
            {getString('cd.getStartedWithCD.gitopsOnboardingSelectAgent')}
          </Text>
          <div>
            {agentList.content.map(agent => (
              <GitOpsAgentCard
                key={agent.identifier}
                agent={agent}
                selectedAgent={selectedAgent as V1Agent}
                setSelectedAgent={setSelectedAgent}
              />
            ))}
          </div>
        </>
      )
    }

    return (
      <>
        {isProvisioningScreen ? (
          <AgentProvision agent={provisionedAgent} loading={agentCreateLoading} error={agentCreateError?.message} />
        ) : (
          <AgentStaticInfo getString={getString} />
        )}
      </>
    )
  }

  return (
    <>
      <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Layout.Vertical width="70%">
          <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xlarge' }} color={Color.GREY_900}>
            {getString('cd.getStartedWithCD.gitopsOnboardingAgentStep')}
            <HarnessDocTooltip tooltipId="cdOnboardGitopsAgent" useStandAlone={true} />
          </Text>
          {renderContent()}
        </Layout.Vertical>
      </Container>
      <Layout.Vertical className={classnames(deployCSS.footer, deployCSS.width70)}>
        <hr className={deployCSS.divider} />
        <Layout.Horizontal spacing="medium" padding={{ top: 'medium', bottom: 'large' }} width="100%">
          {isProvisioningScreen ? (
            <>
              <>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  minimal
                  onClick={onBack}
                />
                <Button
                  text={`${getString('next')}: ${getString('connectors.ceAws.curExtention.stepB.step1.p1')}`}
                  variation={ButtonVariation.PRIMARY}
                  rightIcon="chevron-right"
                  onClick={() => {
                    saveAgentData((selectedAgent || provisionedAgent) as V1Agent)
                    onNext()
                  }}
                  disabled={Boolean(agentCreateLoading || agentCreateError)}
                  loading={false}
                />
              </>
            </>
          ) : (
            <>
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                minimal
                onClick={onBack}
              />
              <Button
                text={getString('common.gitops.startProvisioning')}
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                onClick={onProvisionAgent}
                disabled={loadingAgentsList}
              />
            </>
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </>
  )
}
