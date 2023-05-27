import React from 'react'
import cx from 'classnames'
import { Container, Layout } from '@harness/uicore'
import { Stepper } from '@common/components/Stepper/Stepper'
import { useStrings } from 'framework/strings'
import WhatToDeploy from './WhatToDeploy'
import WhereAndHowToDepoy from './WhereAndHowToDepoy'
import DeploymentSetupSteps from './DeploymentSetupSteps/DeploymentSetupSteps'
import css from '../GetStartedWithCD.module.scss'

export default function CDOnboardingWizardWithCLI(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical flex={{ alignItems: 'start' }}>
      <Container className={cx(css.topPage, css.oldGetStarted)}>
        <Stepper
          id="createSLOTabs"
          isStepValid={() => true}
          runValidationOnMount={false}
          onStepChange={console.log}
          stepList={[
            {
              id: 'what',
              title: getString('cd.getStartedWithCD.flowbyquestions.what.title'),
              // subTitle: 'subs',
              panel: <WhatToDeploy />,
              // preview: <div>prebiew</div>,
              helpPanelReferenceId: 'aaa',
              errorMessage: ['error']
            },
            {
              id: 'howNwhere',
              title: getString('cd.getStartedWithCD.flowbyquestions.howNwhere.title'),
              // subTitle: 'subs',
              panel: <WhereAndHowToDepoy />,
              // preview: <div>prebiew</div>,
              helpPanelReferenceId: 'aaa',
              errorMessage: ['error']
            },
            {
              id: 'stepsToDeploy',
              title: getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.title'),
              // subTitle: 'subs',
              panel: <DeploymentSetupSteps />,
              // preview: <div>prebiew</div>,
              helpPanelReferenceId: 'aaa',
              errorMessage: ['error']
            }
          ]}
        ></Stepper>
      </Container>
    </Layout.Vertical>
  )
}
