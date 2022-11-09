/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, Layout, Button, ButtonVariation, Container, ButtonSize } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import cdOnboardingSteps from '../home/images/cd-onboarding-steps.svg'
import css from './GetStartedWithCD.module.scss'

export default function GetStartedWithCD(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()

  return (
    <Layout.Vertical flex>
      <Container className={css.topPage}>
        <Layout.Horizontal flex margin="auto">
          <Layout.Vertical padding="xlarge" style={{ flex: 1, textAlign: 'center' }} className={css.centerAlign}>
            <Icon name="cd-main" size={40} padding="xlarge" />
            <Text font={{ variation: FontVariation.H1 }} className={css.centerAlign}>
              {getString('cd.getStartedWithCD.onboardingTitle')}
            </Text>
            <Text padding="medium" font={{ variation: FontVariation.BODY1 }} className={css.centerAlign}>
              {getString('common.purpose.cd.description')}
            </Text>
            <Container padding="xxlarge" style={{ flex: 1 }} className={css.centerAlign}>
              <Container
                style={{ background: `transparent url(${cdOnboardingSteps}) no-repeat` }}
                className={css.samplePipeline}
              />
            </Container>
            <hr className={css.separator} />
            <Container className={css.buttonRow}>
              <Button
                variation={ButtonVariation.PRIMARY}
                size={ButtonSize.LARGE}
                text={getString('getStarted')}
                rightIcon="chevron-right"
                onClick={() => {
                  history.push(
                    routes.toCDOnboardingWizard({ accountId, orgIdentifier, projectIdentifier, module: 'cd' })
                  )
                }}
              />
            </Container>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}
