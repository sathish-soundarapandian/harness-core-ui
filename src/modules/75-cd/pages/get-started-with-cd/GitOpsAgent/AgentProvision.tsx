import React from 'react'
import classnames from 'classnames'
import { noop } from 'lodash-es'
import { Icon } from '@harness/uicore'
import type { IconName } from '@harness/icons'
import { useAgentServiceForServerGet, V1Agent } from 'services/gitops'
import { useStrings } from 'framework/strings'
import css from './GitOpsAgentCard.module.scss'
import deployCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

const maxRetryCount = 30 // 5 minutes
const pollingInterval = 10000
export const depSuccessLegacy = 'deployment-success-legacy'
export const danger = 'danger-icon'

export const AgentProvision = ({
  agent,
  loading: agentCreateLoading,
  error: agentCreateError
}: {
  agent?: V1Agent
  loading: boolean
  error?: string
}) => {
  const { getString } = useStrings()

  const [retryCount, setRetryCount] = React.useState(0)
  const [unhealthyIcon, setUnhealthyIcon] = React.useState<IconName>('steps-spinner') // stepSpinner
  const { data, loading, refetch } = useAgentServiceForServerGet({
    identifier: agent?.identifier || '',
    queryParams: {
      accountIdentifier: agent?.accountIdentifier || ''
      // projectIdentifier: projectIdentifier,
      // orgIdentifier: orgIdentifier
    }
  })

  const isHealthy = data?.health?.harnessGitopsAgent?.status === 'HEALTHY'

  React.useEffect(() => {
    if (agentCreateLoading || agentCreateError || isHealthy) return
    let id: number | null

    if (retryCount >= maxRetryCount) {
      setUnhealthyIcon(danger)
      return () => noop
    }

    if (!loading) {
      setRetryCount(retryCount + 1)
      id = window.setTimeout(() => refetch(), pollingInterval)
    }
    return () => {
      if (id) {
        window.clearTimeout(id)
      }
    }
  }, [loading, data, agentCreateLoading, agentCreateError])

  React.useEffect(() => {
    if (agentCreateError) {
      setUnhealthyIcon(danger)
    }
  }, [agentCreateError])

  return (
    <div>
      {agentCreateError ? (
        <div className={classnames(css.verificationStep, deployCss.marginBottom20, deployCss.marginTop20)}>
          <Icon name="danger-icon" />
          <span className={css.stepDesc}>{agentCreateError}</span>
        </div>
      ) : (
        <div className={classnames(css.verificationStep, deployCss.marginBottom20, deployCss.marginTop20)}>
          <Icon name={isHealthy ? depSuccessLegacy : unhealthyIcon} />
          <span className={css.stepDesc}>
            {isHealthy
              ? getString('cd.getStartedWithCD.agentProvisionedSuccessfully')
              : getString('cd.getStartedWithCD.checkAgentStatus')}
          </span>
        </div>
      )}
      <hr className={classnames(css.divider, deployCss.width50)} />
      <div className={css.verificationStep}>
        <Icon name={data?.health?.lastHeartbeat ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('delegate.successVerification.heartbeatReceived')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={isHealthy ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.agentInstalled')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.argoRepoServer?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.repoServerInstalled')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.argoRedisServer?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.redisCacheInstalled')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.argoAppController?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.appControllerInstalled')}</span>
      </div>
    </div>
  )
}
