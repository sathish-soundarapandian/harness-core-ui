import React from 'react'
import cx from 'classnames'
import produce from 'immer'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Stepper } from '@common/components/Stepper/Stepper'
import { useStrings } from 'framework/strings'
import WhatToDeploy from './Steps/WhatToDeploy'
import WhereAndHowToDepoy from './Steps/WhereAndHowToDepoy'
import DeploymentSetupSteps from './Steps/DeploymentSetupSteps/DeploymentSetupSteps'
import WhatToDeployPreview from './Previews/WhatToDeployPreview'
import { StepsProgress, useOnboardingStore } from './Store/OnboardingStore'
import { CDOnboardingSteps } from './Constants'
import css from '../GetStartedWithCD.module.scss'

export default function CDOnboardingWizardWithCLI(): JSX.Element {
  const { getString } = useStrings()
  const { updateOnboardingStore, ...state } = useOnboardingStore()
  const onStepChange = (stepId: string): void => {
    const updatedStepsProgress = produce(state.stepsProgress, (draft: StepsProgress) => {
      draft[stepId] = { ...state.stepsProgress[stepId], isComplete: true }
    })
    console.log({ updatedStepsProgress })
    updateOnboardingStore({ stepsProgress: updatedStepsProgress })
  }

  const saveProgress = (stepId: string, data: any): void => {
    const updatedStepsProgress = produce(state.stepsProgress, (draft: StepsProgress) => {
      draft[stepId] = { ...state.stepsProgress[stepId], stepData: data }
    })
    updateOnboardingStore({ stepsProgress: updatedStepsProgress })
  }
  return (
    <Layout.Vertical flex={{ alignItems: 'start' }}>
      <Container className={cx(css.topPage, css.oldGetStarted, css.cdwizardcli)}>
        <Layout.Vertical>
          <Layout.Horizontal className={css.alignicon}>
            <Icon name="cd-main" size={30} />
            <Text padding={{ left: 'xxlarge' }} font={{ variation: FontVariation.H1 }}>
              {getString('cd.getStartedWithCD.title')}
            </Text>
          </Layout.Horizontal>
          <Text className={css.descriptionLeftpad} font={{ variation: FontVariation.BODY1 }}>
            {getString('cd.getStartedWithCD.description')}
          </Text>
        </Layout.Vertical>
        <Stepper
          id="createSLOTabs"
          isStepValid={() => true}
          runValidationOnMount={false}
          onStepChange={onStepChange}
          stepList={[
            {
              id: CDOnboardingSteps.WHAT_TO_DEPLOY,
              title: getString('cd.getStartedWithCD.flowbyquestions.what.title'),
              // subTitle: 'subs',
              panel: <WhatToDeploy saveProgress={saveProgress} />,
              preview: <WhatToDeployPreview />,
              helpPanelReferenceId: 'aaa',
              errorMessage: ['error']
            },
            {
              id: CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY,
              title: getString('cd.getStartedWithCD.flowbyquestions.howNwhere.title'),
              // subTitle: 'subs',
              panel: <WhereAndHowToDepoy saveProgress={saveProgress} />,
              // preview: <div>prebiew</div>,
              helpPanelReferenceId: 'aaa',
              errorMessage: ['error']
            },
            {
              id: CDOnboardingSteps.DEPLOYMENT_STEPS,
              title: getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.title'),
              // subTitle: 'subs',
              panel: <DeploymentSetupSteps saveProgress={saveProgress} />,
              // preview: <div>prebiew</div>,
              helpPanelReferenceId: 'aaa',
              errorMessage: ['error'],
              nextButtonTitle: 'Verify'
            }
          ]}
        ></Stepper>
      </Container>
    </Layout.Vertical>
  )
}
