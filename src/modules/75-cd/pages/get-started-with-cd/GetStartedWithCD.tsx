/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Text, Icon, Layout, ButtonVariation, Container, ButtonSize, PageSpinner } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { FFContextProvider, useFeatureFlag } from '@harnessio/ff-react-client-sdk'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import cdOnboardingSteps from '../home/images/cd-onboarding-steps.svg'
import css from './GetStartedWithCD.module.scss'
enum FLAGS {
  TRACK_EXPOSURE = 'TRACK_EXPOSURE',
  CD_ONBOARDING_FLOW_TYPE = 'CD_ONBOARDING_FLOW_TYPE'
}
enum EXPERIMENTS {
  CD_ONBOARDING = 'CD_ONBOARDING'
}
enum FLAG_VARIANTS {
  GET_STARTED = 'GET_STARTED',
  CD_ONBOARDING_WIZARD = 'CD_ONBOARDING_WIZARD'
}

export function GetStartedWithCD(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()

  const getStartedClickHandler = (): void => {
    trackEvent(CDOnboardingActions.GetStartedClicked, {})
    history.push(routes.toGetStartedWithCD({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }
  const TRACK_EXPOSURE = useFeatureFlag(FLAGS.TRACK_EXPOSURE)
  const CD_ONBOARDING_FLOW_TYPE = useFeatureFlag(FLAGS.CD_ONBOARDING_FLOW_TYPE)

  useEffect(() => {
    TRACK_EXPOSURE &&
      trackEvent('$exposure', { flag_key: FLAGS.CD_ONBOARDING_FLOW_TYPE, variant: CD_ONBOARDING_FLOW_TYPE })
  }, [])
  return CD_ONBOARDING_FLOW_TYPE === FLAG_VARIANTS.CD_ONBOARDING_WIZARD ? (
    <Redirect to={routes.toCDOnboardingWizard({ accountId, orgIdentifier, projectIdentifier, module: 'cd' })} />
  ) : (
    <Layout.Vertical flex>
      <Container className={css.topPage}>
        <Layout.Horizontal flex margin="auto">
          <Layout.Vertical padding="xlarge" style={{ flex: 1, textAlign: 'center' }} className={css.centerAlign}>
            <Icon name="cd-main" size={40} padding="xlarge" />
            <Text font={{ variation: FontVariation.H1 }} className={css.centerAlign}>
              {getString('cd.getStartedWithCD.onboardingTitle')}
            </Text>
            <Text padding="medium" font={{ variation: FontVariation.BODY1 }} className={css.centerAlign}>
              {getString('cd.getStartedWithCD.onBoardingSubTitle')}
            </Text>
            <Container padding="xxlarge" style={{ flex: 1 }} className={css.centerAlign}>
              <Container
                style={{ background: `transparent url(${cdOnboardingSteps}) no-repeat` }}
                className={css.samplePipeline}
              />
            </Container>
            <Container className={css.buttonRow}>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                size={ButtonSize.LARGE}
                text={getString('getStarted')}
                rightIcon="chevron-right"
                onClick={getStartedClickHandler}
                permission={{
                  permission: PermissionIdentifier.EDIT_PIPELINE,
                  resource: {
                    resourceType: ResourceType.PIPELINE
                  }
                }}
              />
            </Container>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}
export default function GetStartedWithCDWithFF(): React.ReactElement {
  const { currentUserInfo } = useAppStore()
  return (
    <FFContextProvider
      target={{
        identifier: currentUserInfo.email || '',
        attributes: {
          experiment: EXPERIMENTS.CD_ONBOARDING
        }
      }}
      fallback={<PageSpinner />}
      apiKey={window.featureFlagsToken}
    >
      <GetStartedWithCD />
    </FFContextProvider>
  )
}
