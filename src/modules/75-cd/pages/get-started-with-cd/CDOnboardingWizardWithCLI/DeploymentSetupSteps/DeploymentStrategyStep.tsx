import React from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, CardSelect, Text, Icon, IconName } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import { DEPLOYMENT_STRATEGY_TYPES, EntityType, StrategyVideoByType } from '../Constants'
import css from '../CDOnboardingWizardWithCLI.module.scss'
export default function DeploymentStrategyStep(): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge', top: 'xlarge' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.title"
        />
        <String stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.description" />
      </Layout.Vertical>
      <DeploymentStrategySelection />
    </Layout.Vertical>
  )
}

function DeploymentStrategySelection(): JSX.Element {
  const [state, setState] = React.useState<EntityType | undefined>()
  const { getString } = useStrings()
  const deploymentStrategies = React.useMemo((): EntityType[] => {
    return Object.values(DEPLOYMENT_STRATEGY_TYPES).map((data: EntityType) => {
      return data
    })
  }, [])
  const setDeploymentStrategy = (selected: EntityType): void => {
    setState(selected)
  }
  return (
    <Layout.Vertical>
      <String
        className={css.marginBottomLarge}
        stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.title"
      />
      <CardSelect<EntityType>
        data={deploymentStrategies}
        cornerSelected
        className={cx(css.serviceTypeCards, css.deploymentStrategyCards)}
        renderItem={(item: EntityType) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} size={30} />
            <Text
              className={cx({ [css.bold]: state?.id === item.id })}
              font={{
                variation: state?.id === item.id ? FontVariation.FORM_TITLE : FontVariation.BODY
              }}
              color={state?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
          </Layout.Vertical>
        )}
        selected={state}
        onChange={setDeploymentStrategy}
      />

      {state && (
        <Layout.Horizontal>
          <video key={state.id} className={css.videoPlayer} autoPlay data-testid="videoPlayer">
            <source src={StrategyVideoByType[state.id]} type="video/mp4"></source>
            <Text tooltipProps={{ dataTooltipId: 'videoNotSupportedError' }}>
              {getString('common.videoNotSupportedError')}
            </Text>
          </video>
          <Layout.Vertical></Layout.Vertical>
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}
