/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { Button, ButtonVariation, Container, HarnessDocTooltip, Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
// import { HelpPanel } from '@harness/help-panel'
import { useStrings, UseStringsReturn } from 'framework/strings'
import css from '../GetStartedWithCD.module.scss'
import createK8sCSS from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

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
      <li className={classnames(createK8sCSS.progressItem, createK8sCSS.progressItemActive, css.progressItem)}>
        <div className={css.agentThirdSection}>
          <Text className={css.aboutHarnessAdapterAnswer}>{getString('cd.getStartedWithCD.hostedAgentInfoTitle')}</Text>
        </div>
      </li>
    </ul>
  </Container>
)

export const GitOpsAgent = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { getString } = useStrings()
  return (
    <>
      {' '}
      <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Layout.Vertical width="70%">
          <Text
            font={{ variation: FontVariation.H3 }}
            padding={{ bottom: 'large' }}
            color={Color.GREY_600}
            // data-tooltip-id="cdOnboardGitopsAgent"
          >
            {getString('cd.getStartedWithCD.gitopsOnboardingAgentStep')}
            <HarnessDocTooltip tooltipId="cdOnboardGitopsAgent" useStandAlone={true} />
          </Text>
          <div className={css.agentDiagram} />
          <AgentStaticInfo getString={getString} />
        </Layout.Vertical>

        {/*<Container className={css.helpPanelContainer}>*/}
        {/*<HelpPanel referenceId="cdOnboardGitopsAgent" />*/}
        {/*</Container>*/}
      </Container>
      <Layout.Vertical padding={{ left: 'huge' }}>
        {/*className={css.footer}*/}
        <Layout.Horizontal spacing="medium" padding={{ top: 'medium', bottom: 'large' }} width="100%">
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            minimal
            onClick={onBack}
          />
          <Button
            text={'Start Provisioning'}
            variation={ButtonVariation.PRIMARY}
            rightIcon="chevron-right"
            onClick={onNext}
            // disabled={disableBtn}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </>
  )
}
