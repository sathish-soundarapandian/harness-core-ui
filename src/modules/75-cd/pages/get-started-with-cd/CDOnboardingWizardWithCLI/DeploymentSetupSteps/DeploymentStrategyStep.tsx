import React from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, CardSelect, Text, Icon, IconName } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import { DEPLOYMENT_STRATEGY_TYPES, StrategyVideoByType } from '../Constants'
import type { DeploymentStrategyTypes } from '../types'
import css from '../CDOnboardingWizardWithCLI.module.scss'
export default function DeploymentStrategyStep(): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge', top: 'xlarge' }}>
        <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
          <String
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.title"
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
          <String stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.description" />
        </Text>
      </Layout.Vertical>
      <DeploymentStrategySelection />
    </Layout.Vertical>
  )
}

function DeploymentStrategySelection(): JSX.Element {
  const [state, setState] = React.useState<DeploymentStrategyTypes | undefined>()
  const { getString } = useStrings()
  const deploymentStrategies = React.useMemo((): DeploymentStrategyTypes[] => {
    return Object.values(DEPLOYMENT_STRATEGY_TYPES).map((data: DeploymentStrategyTypes) => {
      return data
    })
  }, [])
  const setDeploymentStrategy = (selected: DeploymentStrategyTypes): void => {
    setState(selected)
  }
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} padding={{ top: 'xlarge', bottom: 'large' }}>
        <String
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.title"
        />
      </Text>
      <CardSelect<DeploymentStrategyTypes>
        data={deploymentStrategies}
        cornerSelected
        className={cx(css.serviceTypeCards, css.deploymentStrategyCards)}
        renderItem={(item: DeploymentStrategyTypes) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} size={30} />
            <Text
              className={cx({ [css.bold]: state?.id === item.id })}
              font={{
                variation: FontVariation.BODY2
              }}
              color={state?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
            <Text
              margin={{ top: 'small' }}
              font={{
                variation: FontVariation.BODY2_SEMI
              }}
              color={Color.GREY_800}
            >
              {item.subtitle}
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
          <Layout.Vertical className={css.deploymentStrategySteps}>
            {DEPLOYMENT_STRATEGY_TYPES[state.id].steps?.map((stepText, index) => {
              return (
                <Layout.Vertical key={index} className={css.deploymentStrategyStep}>
                  <Text color={Color.BLACK} className={css.bold}>
                    {stepText.title}:
                  </Text>
                  <Text color={Color.BLACK}>{stepText.description}</Text>
                </Layout.Vertical>
              )
            })}
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}
