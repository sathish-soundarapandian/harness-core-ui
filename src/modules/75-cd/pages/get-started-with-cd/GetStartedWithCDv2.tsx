/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, Icon, Layout, ButtonVariation, Container, ButtonSize, Card, Heading } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './GetStartedWithCD.module.scss'

export default function GetStartedWithCDV2(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()

  const getStartedClickHandler = (): void => {
    trackEvent(CDOnboardingActions.GetStartedClicked, {})
    history.push(routes.toCDOnboardingWizard({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }

  return (
    <Layout.Vertical>
      <Container className={css.topPage}>
        <Layout.Horizontal flex margin="auto">
          <Layout.Vertical padding="xlarge" style={{ flex: 1, textAlign: 'center' }} className={css.centerAlign}>
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <Icon name="cd-main" size={40} padding="xlarge" />
              <Text font={{ variation: FontVariation.H1, weight: 'semi-bold' }} className={css.centerAlign}>
                {getString('cd.getStartedWithCD.onboardingTitle')}
              </Text>
            </Layout.Horizontal>
            <Container className={css.buttonRow}>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                size={ButtonSize.LARGE}
                text={getString('cd.getStartedWithCD.getStartedBtn')}
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
            <Layout.Horizontal className={css.onboardingcards} spacing={'huge'}>
              <Layout.Vertical className={css.cardGap}>
                <Card className={cx(css.cardWidth, css.cardShadow)}>
                  <Layout.Vertical>
                    <Layout.Horizontal>
                      <Heading
                        margin={{ bottom: 'large' }}
                        color={Color.BLACK}
                        font={{ size: 'medium', weight: 'semi-bold' }}
                      >
                        {getString('cd.getStartedWithCD.whyHarnessCD')}
                      </Heading>
                    </Layout.Horizontal>

                    <WhyCDPoints />
                  </Layout.Vertical>
                </Card>
                <Card className={cx(css.cardWidth, css.cardShadow)}>
                  <Layout.Vertical>
                    <Layout.Horizontal>
                      <Text color={Color.BLACK} font={{ align: 'left' }}>
                        <String
                          stringID="cd.getStartedWithCD.tryCICTA"
                          vars={{
                            ciurl: routes.toCIHome({ accountId }),
                            docurl:
                              'https://developer.harness.io/tutorials/deploy-services/harness-cicd-tutorial/#continuous-integration'
                          }}
                          useRichText
                        />
                      </Text>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </Card>
              </Layout.Vertical>
              <Layout.Vertical className={css.videoCard}>
                <Card className={cx(css.cardWidth, css.cardShadow)}>
                  <Layout.Vertical>
                    <div className={css.videoframe}>
                      <iframe
                        width="200"
                        height="130"
                        src="https://www.youtube.com/embed/vybcppS6MCw"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <Text
                      margin={{ bottom: 'xlarge' }}
                      color={Color.BLACK}
                      font={{ size: 'medium', weight: 'semi-bold', align: 'left' }}
                    >
                      <String stringID="common.learnMore" />
                    </Text>
                    <LearnMoreResources />
                  </Layout.Vertical>
                </Card>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}

function LearnMoreCD(): JSX.Element {
  const { getString } = useStrings()
  const CDResources = [
    {
      label: getString('cd.getStartedWithCD.cdresources.cdtuts'),
      url: 'https://developer.harness.io/tutorials/cd-pipelines'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.cdbasics'),
      url: 'https://developer.harness.io/docs/continuous-delivery/get-started/cd-pipeline-basics'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.firstcdpipeline'),
      url: 'https://developer.harness.io/docs/continuous-delivery/get-started/create-first-pipeline'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.pipelineModeling'),
      url: 'https://developer.harness.io/docs/continuous-delivery/get-started/cd-pipeline-modeling-overview'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.svcinfra'),
      url: 'https://developer.harness.io/docs/continuous-delivery/get-started/services-and-environments-overview'
    },
    {
      label: getString('cd.getStartedWithCD.cdresources.terraformcli'),
      url: 'https://developer.harness.io/docs/platform/resource-development/terraform/automate-harness-onboarding/?utm_source=harness-app&utm_medium=intercom&utm_campaign=cd-welcome-post'
    }
  ]
  return (
    <ul className={css.cdresourcelist}>
      {CDResources.map(data => (
        <Text margin={{ bottom: 'large' }} key={data.label} font={{ align: 'left' }}>
          <li>
            <a target="_blank" href={data.url} rel="noreferrer">
              {data.label}
            </a>
          </li>
        </Text>
      ))}
    </ul>
  )
}
function WhyUseCD(): JSX.Element {
  const { getString } = useStrings()
  const whyCDPointsText = [
    getString('cd.getStartedWithCD.standardization'),
    getString('cd.getStartedWithCD.quality'),
    getString('cd.getStartedWithCD.restore'),
    getString('cd.getStartedWithCD.productivity'),
    getString('cd.getStartedWithCD.frequency'),
    getString('cd.getStartedWithCD.velocity')
  ]
  return (
    <>
      {whyCDPointsText.map((point: string, idx: number) => (
        <Text
          className={css.bodyText}
          key={idx}
          icon="flash"
          color={Color.BLACK}
          font={{ align: 'left' }}
          iconProps={{ color: Color.BLACK, size: 18 }}
        >
          {point}
        </Text>
      ))}
    </>
  )
}
const WhyCDPoints = React.memo(WhyUseCD)
const LearnMoreResources = React.memo(LearnMoreCD)
