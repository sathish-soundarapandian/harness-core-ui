/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
// import cx from 'classnames'
import { Text, FontVariation, Icon, Layout, Button, ButtonVariation, Container, ButtonSize } from '@harness/uicore'
// import type { IconProps } from '@harness/icons'
// import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
// import type { StringsMap } from 'stringTypes'
// import type { GitQueryParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
// import { useQueryParams } from '@common/hooks'
// import { DeployProvisioningWizard } from './DeployProvisioningWizard/DeployProvisioningWizard'
import bgImageURL from '../home/images/cd.svg'
// import bgBannerImageURL from '../home/images/cd-onboarding-banner.svg'
import delegateImageURL from '../home/images/cd-delegates-banner.svg'
// import { CDOnboardingProvider } from './CDOnboardingStore'
import { DelegateTypeSelector } from './DelegateTypeSelectorWizard/delegateTypeSelector'
import css from './GetStartedWithCD.module.scss'
// import { right } from '@popperjs/core'

export default function GetStartedWithCI(): React.ReactElement {
  const { getString } = useStrings()
  const [showWizard, setShowWizard] = useState<boolean>(false)
  // const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  // const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  // const renderBuildPipelineStep = React.useCallback(
  //   ({ iconProps, label, isLastStep }: { iconProps: IconProps; label: keyof StringsMap; isLastStep?: boolean }) => (
  //     <Layout.Horizontal flex padding={{ right: 'xsmall' }} spacing="small">
  //       <Icon name={iconProps.name} size={iconProps.size} className={iconProps.className} />
  //       <Text font={{ size: 'small' }} padding={{ left: 'xsmall', right: 'xsmall' }}>
  //         {getString(label)}
  //       </Text>
  //       {!isLastStep ? <Icon name="arrow-right" size={12} className={css.arrow} /> : null}
  //     </Layout.Horizontal>
  //   ),
  //   []
  // )
  const closeWizard = (): void => {
    setShowWizard(false)
  }

  return showWizard ? (
    <DelegateTypeSelector onClickBack={closeWizard} />
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
            <Layout.Horizontal>
              <Layout.Vertical width="50%">
                <Text font={{ variation: FontVariation.H6 }} padding={{ bottom: 'medium' }}>
                  Welcome to Harness
                </Text>
                <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }}>
                  Install the Delegate to deploy your cluster
                </Text>
                <Layout.Horizontal>
                  <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} width={'85%'}>
                    Harness Delegates are worker processes that runs on your infrastructure execute tasks on your
                    infrastructure on behalf of Harness platform.
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Container className={css.buttonRow}>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      size={ButtonSize.LARGE}
                      text="Install the Delegate"
                      onClick={() => setShowWizard(true)}
                    />
                  </Container>
                </Layout.Horizontal>
              </Layout.Vertical>
              <img
                className={css.buildImg}
                title={getString('common.getStarted.buildPipeline')}
                src={delegateImageURL}
                width="50%"
                height={260}
              />
            </Layout.Horizontal>
          </Container>
        </Container>
      </Layout.Vertical>
      <img src={bgImageURL} className={css.image} />
    </>
  )
}
