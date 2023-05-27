import React from 'react'
import cx from 'classnames'
import { FontVariation, Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { Layout, CardSelect, Text, Icon, IconName, Button, ButtonVariation } from '@harness/uicore'
import { useGetDelegatesHeartbeatDetailsV2 } from 'services/portal'
import { useStrings } from 'framework/strings'
import useCreateDelegateViaCommandsModal from '@delegates/pages/delegates/delegateCommandLineCreation/components/useCreateDelegateViaCommandsModal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DeploymentFlowType, DEPLOYMENT_FLOW_TYPES } from './Constants'
import css from './CDOnboardingWizardWithCLI.module.scss'
import { usePolling } from '@common/hooks/usePolling'

function WhereAndHowToDepoy(): JSX.Element {
  const [selected, setSelected] = React.useState(DEPLOYMENT_FLOW_TYPES.CDPipeline)
  const [delegateName, setDelegateName] = React.useState('')

  const { getString } = useStrings()
  const setType = (selectedType: DeploymentFlowType): void => {
    setSelected(selectedType)
  }

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const {
    data,
    loading,
    refetch: verifyHeartBeat,
    cancel
  } = useGetDelegatesHeartbeatDetailsV2({
    queryParams: {
      accountId,
      projectId: projectIdentifier,
      orgId: orgIdentifier,
      delegateName: ''
    },
    debounce: 200,
    lazy: true
  })

  const { openDelegateModalWithCommands } = useCreateDelegateViaCommandsModal({
    hideDocker: true,
    onClose: (delegateName?: string) =>
      verifyHeartBeat({ queryParams: { accountId, projectId: projectIdentifier, orgId: orgIdentifier, delegateName } })
  })
  const deploymentTypes = React.useMemo((): DeploymentFlowType[] => {
    return Object.values(DEPLOYMENT_FLOW_TYPES).map((deploymentType: DeploymentFlowType) => {
      return deploymentType
    })
  }, [])

  const openDelagateDialog = (_event: React.MouseEvent<Element, MouseEvent>): void => {
    cancel()
    openDelegateModalWithCommands()
  }
  return (
    <Layout.Vertical className={css.whatToDeploySection}>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.title')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.description')}
      </Text>
      <CardSelect<DeploymentFlowType>
        data={deploymentTypes}
        cornerSelected
        className={cx(css.serviceTypeCards, css.flowcards)}
        renderItem={(item: DeploymentFlowType) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} size={30} padding={{ bottom: 'xxlarge' }} />
            <Layout.Vertical>
              <Text
                padding={{ bottom: 'small' }}
                font={{ variation: selected.id === item.id ? FontVariation.FORM_TITLE : FontVariation.BODY }}
                color={selected.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
              >
                {item.label}
              </Text>
              <Text font={{ variation: FontVariation.BODY2_SEMI }} color={Color.GREY_500}>
                {item.subtitle}
              </Text>
            </Layout.Vertical>
          </Layout.Vertical>
        )}
        selected={selected}
        onChange={setType}
      />
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.title')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.description1')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.description2')}
      </Text>
      <Button variation={ButtonVariation.PRIMARY} width={'fit-content'} onClick={openDelagateDialog}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.installDelegate')}
      </Button>
      {loading && (
        <Layout.Horizontal padding="large">
          <Icon size={16} name="steps-spinner" color={Color.BLUE_800} style={{ marginRight: '12px' }} />
          <Text font="small">{getString('delegates.commandLineCreation.clickDoneAndCheckLater')}</Text>
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}

export default WhereAndHowToDepoy
