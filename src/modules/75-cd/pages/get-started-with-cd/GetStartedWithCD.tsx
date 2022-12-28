/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, Layout, ButtonVariation, Container, ButtonSize, Button } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
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

export default function GetStartedWithCD(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()

  const getStartedClickHandler = (): void => {
    trackEvent(CDOnboardingActions.GetStartedClicked, {})
    history.push(routes.toCDOnboardingWizard({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }
  return (
    <Layout.Vertical flex>
      <Button
        minimal
        icon="cross"
        iconProps={{ size: 20 }}
        onClick={() => history.push(routes.toPipelines({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))}
        className={css.closeWizard}
        data-testid={'close-cd-onboarding-wizard'}
      />
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
