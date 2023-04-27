import React from 'react'
import cx from 'classnames'
import { Classes, Dialog } from '@blueprintjs/core'
import { Accordion, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { String, useStrings } from 'framework/strings'
import delegateImage from '@cd/modals/images/delegates.svg'
import expandimage from '@cd/modals/images/expandimage.svg'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { getDerivedStateForAccordions } from '../CDOnboardingUtils'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export default function ConnectWithDelegate({
  trackEvent
}: {
  trackEvent: (eventName: string, properties: Record<string, unknown>) => void
}): JSX.Element {
  const panelRefs = React.useRef<string[]>([])
  const { getString } = useStrings()
  const trackActions = (activeIds: string[]): void => {
    const { k8sStatus, delegateStatus } = getDerivedStateForAccordions(activeIds, panelRefs.current)
    if (k8sStatus === 'open') {
      trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
        action: CDOnboardingActions.CD_HELP_CLUSTER_PANEL_EXPANDED
      })
    }
    if (k8sStatus === 'close') {
      trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
        action: CDOnboardingActions.CD_HELP_CLUSTER_PANEL_COLLAPSED
      })
    }

    if (delegateStatus === 'open') {
      trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
        action: CDOnboardingActions.CD_HELP_DELEGATE_PANEL_EXPANDED
      })
    }
    if (delegateStatus === 'close') {
      trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
        action: CDOnboardingActions.CD_HELP_DELEGATE_PANEL_COLLAPSED
      })
    }
    panelRefs.current = activeIds
  }
  const [showImageModal, hideImageModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideImageModal()
        }}
        className={cx(css.diagramdialog, Classes.DIALOG)}
      >
        <Layout.Vertical>
          <Container className={css.closeDialog} onClick={hideImageModal}>
            X
          </Container>

          <img src={delegateImage} className={css.delegateDiagram} />
        </Layout.Vertical>
      </Dialog>
    )
  })

  return (
    <Layout.Vertical className={css.betterHelp}>
      <Layout.Horizontal className={css.videoSection}>
        <Layout.Vertical width={'55%'} className={css.delegateInfo}>
          <Text color={Color.BLACK} font={{ weight: 'bold' }} margin={{ botom: 'medium' }}>
            <String stringID="cd.getStartedWithCD.connectDelegateHeader" />
          </Text>

          <Text color={Color.BLACK}>
            <String stringID="cd.getStartedWithCD.delegateIntroduction" />
          </Text>
        </Layout.Vertical>
        <Layout.Vertical>
          <div className={css.videoframe}>
            <iframe
              width="200"
              height="130"
              src="https://www.youtube.com/embed/qifgw1aN_oU?enablejsapi=1 "
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </Layout.Vertical>
      </Layout.Horizontal>
      <Layout.Vertical>
        <Accordion allowMultiOpen onChange={trackActions}>
          <Accordion.Panel
            id="delegateInfo"
            summary={getString('cd.getStartedWithCD.howDelegateWorks')}
            details={
              <Container>
                <Layout.Horizontal color={Color.BLACK}>
                  <Text color={Color.BLACK} padding={{ top: 'small' }}>
                    <String stringID="cd.getStartedWithCD.delegateWorksInfo" />
                  </Text>
                </Layout.Horizontal>
                <Layout.Vertical padding={{ bottom: 'xxlarge' }} flex={{ alignItems: 'center' }}>
                  <div className={css.delegateDiagram}>
                    <img
                      src={delegateImage}
                      onClick={() => {
                        trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
                          action: CDOnboardingActions.CD_HELP_IMAGE_ENLARGED
                        })
                        showImageModal()
                      }}
                    />
                    <img
                      src={expandimage}
                      className={css.expandIcon}
                      onClick={() => {
                        trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
                          action: CDOnboardingActions.CD_HELP_IMAGE_ENLARGED
                        })
                        showImageModal()
                      }}
                    />
                  </div>
                </Layout.Vertical>
                <Layout.Vertical>
                  <Text color={Color.BLACK} font={{ weight: 'bold' }}>
                    <String stringID="cd.getStartedWithCD.whatDelegateSec" />
                  </Text>
                  <Text color={Color.BLACK} padding={{ top: 'small' }}>
                    <String stringID="cd.getStartedWithCD.delegateSecInfo" />
                  </Text>
                  <Text color={Color.BLACK} padding={{ top: 'small' }}>
                    <String
                      useRichText={true}
                      vars={{
                        sourceCode: 'http://sourcecode.com',
                        faq: 'https://developer.harness.io/docs/first-gen/firstgen-fa-qs/harness-delegate-faqs/',
                        delegateImage: 'https://delimage'
                      }}
                      stringID="cd.getStartedWithCD.delegateSecInfoMore"
                    />
                  </Text>
                </Layout.Vertical>
              </Container>
            }
          />
          <Accordion.Panel
            id="k8sCluster"
            summary={getString('cd.getStartedWithCD.howToPrepareCluster')}
            details={
              <Layout.Vertical>
                <Text color={Color.BLACK}>
                  <String stringID="cd.getStartedWithCD.prepareCluserInfo" />
                </Text>
                <a
                  href="https://developer.harness.io/docs/plg/cd-getting-started-env/?utm_source=harness-app&utm_medium=app&utm_campaign=cd-wizard-connect-help"
                  onClick={() =>
                    trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
                      action: CDOnboardingActions.CD_HELP_LINK_CLICKED
                    })
                  }
                  className={css.textLinks}
                >
                  <String stringID="cd.getStartedWithCD.howtoProvisionK8sCluster" />
                </a>

                <Text color={Color.BLACK}>
                  <String stringID="cd.getStartedWithCD.helmRequired" />
                </Text>
                <a
                  href="https://v3.helm.sh/docs/intro/install/"
                  onClick={() =>
                    trackEvent(CDOnboardingActions.CD_HELP_ENGAGEMENT, {
                      action: CDOnboardingActions.CD_HELP_LINK_CLICKED
                    })
                  }
                  className={css.textLinks}
                >
                  <String stringID="cd.getStartedWithCD.helpInstallSteps" />
                </a>
              </Layout.Vertical>
            }
          />
        </Accordion>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
