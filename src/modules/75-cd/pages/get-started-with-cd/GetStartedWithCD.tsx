/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, FontVariation, Icon, Layout, Button, ButtonVariation, Container, ButtonSize } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, CDOnboardingActions } from '@common/constants/TrackingConstants'
import bgImageURL from '../home/images/cd.svg'
import delegateImageURL from '../home/images/cd-delegates-banner.svg'
import { DelegateSelectorWizard } from './DelegateSelectorWizard/DelegateSelectorWizard'
import css from './GetStartedWithCD.module.scss'

export default function GetStartedWithCI(): React.ReactElement {
  const { getString } = useStrings()
  const [showWizard, setShowWizard] = useState<boolean>(false)
  const closeWizard = (): void => {
    setShowWizard(false)
  }

  const { trackEvent } = useTelemetry()

  return showWizard ? (
    <DelegateSelectorWizard onClickBack={closeWizard} />
  ) : (
    <>
      <Layout.Vertical flex>
        <Container className={css.topPage}>
          <Container className={css.buildYourOwnPipeline}>
            <Container>
              <Layout.Horizontal flex className={css.ciLogo}>
                <Icon name="cd-main" size={42} />
                <Layout.Vertical flex padding={{ left: 'xsmall' }}>
                  <Text font={{ variation: FontVariation.BODY2 }} className={css.label}>
                    {getString('common.purpose.ci.continuousLabel')}
                  </Text>
                  <Text font={{ variation: FontVariation.BODY2 }} className={css.label}>
                    {getString('common.purpose.cd.delivery')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
            </Container>

            <Text font={{ variation: FontVariation.H5, weight: 'light' }} padding={{ bottom: 'medium' }}>
              {getString('cd.welcomeMessage')}
            </Text>

            <Layout.Horizontal>
              <Layout.Vertical width="50%">
                <Text font={{ variation: FontVariation.H3, weight: 'semi-bold' }} padding={{ bottom: 'large' }}>
                  {getString('cd.delegateInstallation')}
                </Text>
                <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} width={'90%'}>
                  {getString('cd.getStartedWithCD.delegateInfo')}
                </Text>
                <Layout.Horizontal className={css.buttonRow}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    size={ButtonSize.LARGE}
                    text={getString('cd.installDelegate')}
                    className={css.btn}
                    onClick={() => {
                      setShowWizard(true)
                      trackEvent(CDOnboardingActions.delegateInstallWizardStart, {
                        category: Category.DELEGATE
                      })
                    }}
                  />
                  <a
                    href="https://docs.harness.io/article/2k7lnc7lvl-delegates-overview"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_6} className={css.linkText}>
                      {getString('cd.learnMoreDelegate')}
                    </Text>
                  </a>
                </Layout.Horizontal>
              </Layout.Vertical>
              <img
                className={css.buildImg}
                title={getString('common.getStarted.buildPipeline')}
                src={delegateImageURL}
                width="50%"
              />
            </Layout.Horizontal>
          </Container>
        </Container>
      </Layout.Vertical>
      <img src={bgImageURL} className={css.image} />
    </>
  )
}
