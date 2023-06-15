import {
  Button,
  Text,
  Layout,
  ButtonSize,
  ButtonVariation,
  useToaster,
  getErrorInfoFromErrorObject
} from '@harness/uicore'

import { FontVariation, Color } from '@harness/design-system'
import React, { useEffect, useState } from 'react'

import { TextArea } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { DelegateCommonProblemTypes } from '@delegates/constants'
import { useAddFeedback } from 'services/portal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import TerraformTroubleShooting from './troubleShooting/TerraformTroubleShooting'
import KubernetesManfiestTroubleShooting from './troubleShooting/KubernetesManfiestTroubleShooting'
import DockerTroubleShooting from './troubleShooting/DockerTroubleShooting'
import HelmTroubleShooting from './troubleShooting/HelmTroubleShooting'
import css from '../DelegateCommandLineCreation.module.scss'

interface CommonProblemsForDelegateProps {
  delegateType?: DelegateCommonProblemTypes
}

const troubleShootingURL = 'https://developer.harness.io/docs/troubleshooting/troubleshooting-nextgen'
const mailtoHarness = 'mailto:support@harness.io'
const CommonProblemsForDelegate: React.FC<CommonProblemsForDelegateProps> = ({ delegateType }) => {
  const { getString } = useStrings()
  const [feedBack, setFeedBack] = useState<string>()
  const [problemSolved, setProblemSolved] = useState<boolean>()
  const [problemSolvedOrNotText, setProblemSolvedOrNotText] = useState<string>('')
  const { trackEvent } = useTelemetry()

  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { mutate: addFeedback, error: feedBackError, loading } = useAddFeedback({ queryParams: { accountId } })
  useEffect(() => {
    if (feedBackError) {
      showError(getErrorInfoFromErrorObject(feedBackError))
    }
  }, [])

  const saveFeedBack = () => {
    trackEvent(`${DelegateActions.DelegateCommandLineTroubleShootProblemFeedBackSaved} ${delegateType}`, {
      category: Category.DELEGATE
    })
    addFeedback({
      accountId,
      feedback: feedBack,
      orgId: orgIdentifier,
      projectId: projectIdentifier
    }).then(data => {
      if (data.resource) {
        showSuccess(getString('delegates.commandLineCreation.feedBackSaved'))
      } else {
        showError(getString('delegates.commandLineCreation.feedBackNotSaved'))
      }
    })
  }
  const getDelegateTroubleShootSteps = (delegateTypeLocal: DelegateCommonProblemTypes) => {
    switch (delegateTypeLocal) {
      case DelegateCommonProblemTypes.DOCKER:
        return <DockerTroubleShooting />
      case DelegateCommonProblemTypes.HELM_CHART:
        return <HelmTroubleShooting />
      case DelegateCommonProblemTypes.KUBERNETES_MANIFEST:
        return <KubernetesManfiestTroubleShooting />
      case DelegateCommonProblemTypes.TERRAFORM:
        return <TerraformTroubleShooting />
    }
  }
  return (
    <Layout.Vertical
      spacing={'none'}
      className={css.troubleShootingContainer}
      margin={{ bottom: 'xlarge' }}
      padding={{ bottom: 'xxlarge', top: 'xxlarge', left: 'xxxlarge', right: 'xxxlarge' }}
    >
      <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'xxlarge' }}>
        {getString('delegates.delegateNotInstalled.tabs.troubleshooting')}
      </Text>
      {delegateType && getDelegateTroubleShootSteps(delegateType)}
      <Layout.Horizontal
        spacing={'medium'}
        margin={{ bottom: 'xlarge' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Text font={{ variation: FontVariation.H6 }}>
          {getString('delegates.commandLineCreation.didDelegateComeUp')}
        </Text>

        <Button
          size={ButtonSize.SMALL}
          text={getString('yes')}
          intent={problemSolved ? 'primary' : 'none'}
          round
          onClick={() => {
            setProblemSolved(true)
            trackEvent(`${DelegateActions.DelegateCommandLineTroubleShootProblemSolved} ${delegateType}`, {
              category: Category.DELEGATE
            })
            setProblemSolvedOrNotText(getString('delegates.commandLineCreation.delegateFixed'))
          }}
        />
        <Button
          size={ButtonSize.SMALL}
          intent={problemSolved === false ? 'primary' : 'none'}
          round
          text={getString('no')}
          onClick={() => {
            trackEvent(`${DelegateActions.DelegateCommandLineTroubleShootProblemNotSolved} ${delegateType}`, {
              category: Category.DELEGATE
            })
            setProblemSolved(false)

            setProblemSolvedOrNotText(getString('delegates.commandLineCreation.delegateNotFixed'))
          }}
        />
      </Layout.Horizontal>
      {problemSolvedOrNotText && (
        <Layout.Vertical spacing="none" margin={{ bottom: 'xlarge' }}>
          <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.FORM_LABEL }}>
            {problemSolvedOrNotText}
          </Text>
          <Layout.Vertical spacing="none" margin={{ bottom: 'medium' }}>
            <TextArea
              placeholder={getString('delegates.commandLineCreation.enterYourResponse')}
              maxLength={2048}
              autoFocus={true}
              value={feedBack}
              onChange={e => {
                setFeedBack((e.currentTarget as HTMLTextAreaElement).value.trim())
              }}
            />
          </Layout.Vertical>
          <Layout.Horizontal spacing="none" margin={{ bottom: 'xlarge' }}>
            <Button
              margin={{ right: 'medium' }}
              width={100}
              variation={ButtonVariation.SECONDARY}
              disabled={loading || !feedBack || !feedBack.length}
              text={getString('save')}
              onClick={saveFeedBack}
            />
            <Button
              width={100}
              variation={ButtonVariation.TERTIARY}
              disabled={loading || !feedBack || !feedBack.length}
              text={getString('common.clear')}
              onClick={() => {
                setFeedBack('')
              }}
            />
          </Layout.Horizontal>
          {problemSolved === false && (
            <>
              <Text
                margin={{ bottom: 'medium' }}
                font={{ variation: FontVariation.YAML }}
                rightIcon="launch"
                color={Color.PRIMARY_7}
                rightIconProps={{
                  className: css.iconPointer,
                  onClick: () => {
                    window.open(mailtoHarness, '_blank', 'noreferrer')
                  }
                }}
              >
                <a target="_blank" rel="noreferrer" href={mailtoHarness}>
                  {getString('delegates.delegateNotInstalled.contactHarness')}
                </a>
              </Text>
              <Text
                margin={{ bottom: 'medium' }}
                font={{ variation: FontVariation.YAML }}
                rightIcon="launch"
                color={Color.PRIMARY_7}
                rightIconProps={{
                  className: css.iconPointer,
                  onClick: () => {
                    window.open(troubleShootingURL, '_blank', 'noreferrer')
                  }
                }}
              >
                <a target="_blank" rel="noreferrer" href={troubleShootingURL}>
                  {getString('delegates.harnessDocs')}
                </a>
              </Text>
            </>
          )}
        </Layout.Vertical>
      )}
    </Layout.Vertical>
  )
}
export default CommonProblemsForDelegate
