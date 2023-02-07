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
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  HarnessDocTooltip,
  Layout,
  PageSpinner,
  Text
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Spinner } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useAgentServiceForServerCreate, V1AgentType, useAgentServiceForServerList, V1Agent } from 'services/gitops'
import { useCDOnboardingContext } from '@cd/pages/get-started-with-cd/CDOnboardingStore'
import { GitOpsAgentCard } from './GitOpsAgentCard'
import css from '../GetStartedWithCD.module.scss'
import createK8sCSS from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import deployCSS from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

const AgentStaticInfo = ({ getString }: { getString: UseStringsReturn['getString'] }) => (
  <Container>
    <ul className={createK8sCSS.progress}>
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

const ProvisioningStaticInfo = ({
  loading,
  errorMessage,
  getString,
  onProvisionAgent
}: {
  loading: boolean
  errorMessage?: string
  getString: UseStringsReturn['getString']
  onProvisionAgent: () => void
}) => (
  <Container>
    <div className={css.provisioningInfo}>
      {loading ? (
        <Spinner size={24} />
      ) : errorMessage ? (
        <>
          <div className={css.error}>{errorMessage}</div>
          <Button
            text={getString('retry')}
            variation={ButtonVariation.SECONDARY}
            onClick={onProvisionAgent}
            margin={{ left: 'medium' }}
            size={ButtonSize.SMALL}
          />
        </>
      ) : (
        <div>{getString('cd.getStartedWithCD.agentProvisionedSuccessfully')}</div>
      )}
    </div>
  </Container>
)

export const GitOpsAgent = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { getString } = useStrings()
  // isProvisioningScreen is 2nd screen
  const [isProvisioningScreen, setIsProvisioningScreen] = React.useState(false)
  const [selectedAgent, setSelectedAgent] = React.useState<V1Agent | null>(null)
  const [provisionedAgent, setProvisionedAgent] = React.useState<V1Agent | null>(null)
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
      accountIdentifier: accountId
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
          <Text padding={{ bottom: 'medium' }} color={Color.GREY_800}>
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
          <ProvisioningStaticInfo
            loading={agentCreateLoading}
            errorMessage={agentCreateError?.message}
            getString={getString}
            onProvisionAgent={onProvisionAgent}
          />
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
          <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
            {getString('cd.getStartedWithCD.gitopsOnboardingAgentStep')}
            <HarnessDocTooltip tooltipId="cdOnboardGitopsAgent" useStandAlone={true} />
          </Text>
          {renderContent()}
        </Layout.Vertical>
      </Container>
      <Layout.Vertical className={deployCSS.footer}>
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
