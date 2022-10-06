/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  HarnessDocTooltip,
  Layout,
  Tabs,
  Text,
  useConfirmationDialog
} from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'
import cx from 'classnames'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, CDOnboardingActions } from '@common/constants/TrackingConstants'
import { CreateK8sDelegate } from '../CreateKubernetesDelegateWizard/CreateK8sDelegate'
import { CreateDockerDelegate } from '../CreateDockerDelegateWizard/CreateDockerDelegate'
import { GoogleK8sService } from '../HelpTexts/GoogleK8sService'
import { AmazonElasticK8sService } from '../HelpTexts/AmazonElasticK8sService'
import { AzureK8sService } from '../HelpTexts/AzureK8sService'
import { Minikube } from '../HelpTexts/Minikube'
import type { DelegateSuccessHandler } from '../CDOnboardingUtils'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export interface DelegateTypeSelectorProps {
  onClickBack: () => void
}

const DOCUMENT_URL = 'https://www.harness.io/technical-blog/deploy-in-5-minutes-with-a-delegate-first-approach'

export const DelegateSelectorWizard = ({ onClickBack }: DelegateTypeSelectorProps): JSX.Element => {
  const [delegateType, setDelegateType] = React.useState<string>('')
  const [disableBtn, setDisableBtn] = React.useState<boolean>(true)
  const [isDelegateInstalled, setIsDelegateInstalled] = React.useState<boolean>(false)
  const [helpPanelVisible, setHelpPanelVisible] = React.useState<boolean>(false)
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const successRefHandler = useRef<(() => void) | null>(null)
  const delegateName = useRef<string>()

  const onSuccessHandler = ({ delegateCreated, delegateInstalled }: DelegateSuccessHandler): void => {
    setDisableBtn(!delegateCreated)
    setIsDelegateInstalled(Boolean(delegateInstalled))
  }

  const deletionContentText = React.useMemo(
    () => (
      <Text color={Color.BLACK} padding="medium">
        {getString('cd.getStartedWithCD.delegateRequiredWarning')}{' '}
        <a rel="noreferrer" target="_blank" href={DOCUMENT_URL}>
          {getString('pipeline.createPipeline.learnMore')}
        </a>
      </Text>
    ),
    [getString]
  )

  const { openDialog: showDelegateRequiredWarning } = useConfirmationDialog({
    contentText: deletionContentText,
    titleText: 'Create Pipeline',
    confirmButtonText: getString('continue'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        createPipelineHandler()
      }
    }
  })
  const createPipelineHandler = (): void => {
    successRefHandler?.current?.()
    trackEvent(CDOnboardingActions.delegateInstallWizardEnd, {
      category: Category.DELEGATE,
      data: {
        delegateName: delegateName.current,
        delegateType: delegateType
      }
    })
    history.push(
      routes.toPipelineStudio({
        accountId: accountId,
        module: 'cd',
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier: '-1'
      })
    )
  }

  const isHelpPanelVisible = (): void => {
    setHelpPanelVisible(true)
  }
  const { trackEvent } = useTelemetry()

  const conditionalContent = (): JSX.Element => {
    switch (delegateType) {
      case 'kubernetes':
        return (
          <CreateK8sDelegate
            onSuccessHandler={onSuccessHandler}
            handleHelpPanel={isHelpPanelVisible}
            successRef={successRefHandler}
            delegateNameRef={delegateName}
          />
        )
      case 'docker':
        return (
          <CreateDockerDelegate
            onSuccessHandler={onSuccessHandler}
            successRef={successRefHandler}
            delegateNameRef={delegateName}
          />
        )
      default:
        return <></>
    }
  }

  return (
    <Layout.Horizontal>
      <Layout.Vertical width={'55%'} padding={'huge'} height={'100vh'}>
        <Container height={'200px'}>
          <Text
            font={{ variation: FontVariation.H2, weight: 'semi-bold' }}
            data-tooltip-id="cdOnboardingInstallDelegate"
          >
            {getString('cd.installDelegate')}
            <HarnessDocTooltip tooltipId="cdOnboardingInstallDelegate" useStandAlone={true} />
          </Text>
          <div className={css.borderBottomClass} />
          <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.marginBottomClass}>
            {getString('cd.runDelegate')}
          </Text>
          <Button
            onClick={() => setDelegateType('kubernetes')}
            className={cx(css.kubernetes, delegateType === 'kubernetes' ? css.active : undefined)}
          >
            {getString('kubernetesText')}
          </Button>
          <Button
            onClick={() => {
              setDelegateType('docker')
              setHelpPanelVisible(false)
            }}
            className={cx(css.docker, delegateType === 'docker' ? css.active : undefined)}
          >
            {getString('delegate.cardData.docker.name')}
          </Button>
          <div className={css.marginTopClass} />
        </Container>
        <Layout.Vertical className={css.bodyClass}>
          <div className={css.marginTop} />
          {conditionalContent()}
        </Layout.Vertical>
        <Container height={'10%'} className={css.footer}>
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            minimal
            onClick={() => {
              trackEvent(CDOnboardingActions.BackOnboardingDelgateCreation, {
                category: Category.DELEGATE,
                data: {
                  delegateName: delegateName.current,
                  delegateType: delegateType
                }
              })
              onClickBack()
            }}
          />
          <Button
            // eslint-disable-next-line strings-restrict-modules
            text={getString('ci.getStartedWithCI.createPipeline')}
            variation={ButtonVariation.PRIMARY}
            rightIcon="chevron-right"
            disabled={disableBtn}
            className={css.createPipelineBtn}
            onClick={() => {
              if (isDelegateInstalled) {
                createPipelineHandler()
              } else {
                showDelegateRequiredWarning()
              }
            }}
          />
        </Container>
      </Layout.Vertical>
      {helpPanelVisible ? (
        <Layout.Vertical width={'45%'} padding={'large'} background={Color.PRIMARY_1} flex={{ alignItems: 'center' }}>
          <div className={css.tabs}>
            <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.marginBottomClass}>
              {getString('cd.instructionsCluster')}
            </Text>
            <Tabs
              id={'horizontalTabs'}
              defaultSelectedTabId={'googleK8sService'}
              tabList={[
                { id: 'googleK8sService', title: getString('cd.googleK8sService'), panel: <GoogleK8sService /> },
                {
                  id: 'amazonElasticK8sService',
                  title: getString('cd.amazonElasticK8sService'),
                  panel: <AmazonElasticK8sService />
                },
                { id: 'azureK8sService', title: getString('cd.azureK8sService'), panel: <AzureK8sService /> },
                { id: 'minikube', title: getString('cd.minikube'), panel: <Minikube /> }
              ]}
            />
          </div>
        </Layout.Vertical>
      ) : null}
    </Layout.Horizontal>
  )
}
