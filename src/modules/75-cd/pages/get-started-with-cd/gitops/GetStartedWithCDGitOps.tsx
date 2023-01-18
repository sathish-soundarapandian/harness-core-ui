import React from 'react'
import { Text, Icon, Layout, ButtonVariation, Container, ButtonSize } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingGitopsActions } from '@common/constants/TrackingConstants'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import harnessGitops from '@cd/pages/home/images/harness-gitops.svg'
import css from '@cd/pages/get-started-with-cd/GetStartedWithCD.module.scss'

export default function GetStartedWithCDGitOps(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()

  const getStartedClickHandler = (): void => {
    trackEvent(CDOnboardingGitopsActions.GetStartedClicked, {})
    history.push(routes.toCDOnboardingWizard({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }

  return (
    <Layout.Vertical flex>
      <Container className={css.topPage}>
        <Layout.Horizontal flex margin="auto">
          <Layout.Vertical padding="xlarge" style={{ flex: 1, textAlign: 'center' }} className={css.centerAlign}>
            <Icon name="cd-main" size={40} padding="xlarge" />
            <Text font={{ variation: FontVariation.H1 }} className={css.centerAlign}>
              {getString('cd.getStartedWithCD.onboardingTitleGitops')}
            </Text>
            <Container
              style={{ background: `transparent url(${harnessGitops}) no-repeat` }}
              className={css.harnessGitopsLogo}
            />
            <Text padding="medium" font={{ variation: FontVariation.BODY1 }} className={css.centerAlign}>
              {getString('cd.getStartedWithCD.onBoardingSubTitleGitops')}
            </Text>
            <Container padding="xxlarge" style={{ flex: 1 }} className={css.centerAlign}>
              Need SVG from Design Team
              {/*<Container*/}
              {/*style={{ background: `transparent url(${cdOnboardingSteps}) no-repeat` }}*/}
              {/*className={css.samplePipeline}*/}
              {/*/>*/}
            </Container>
            <Container className={css.buttonRow}>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                size={ButtonSize.LARGE}
                text={getString('getStarted')}
                rightIcon="chevron-right"
                onClick={getStartedClickHandler}
                permission={{
                  // @todo: check permission for GitOps
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
