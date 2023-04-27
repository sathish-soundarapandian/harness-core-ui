/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  getErrorInfoFromErrorObject,
  HarnessDocTooltip,
  Layout,
  PageSpinner,
  Text,
  TextInput,
  useToaster
} from '@harness/uicore'
import { FontVariation, Intent } from '@harness/design-system'
import { isEmpty, noop } from 'lodash-es'
import * as Yup from 'yup'
import { useGetInstallationCommand } from 'services/portal'
import { DelegateCommonProblemTypes, DelegateDefaultName, DelegateNameLengthLimit } from '@delegates/constants'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import HelmChartCommands from '@delegates/pages/delegates/delegateCommandLineCreation/components/HelmChartCommands'
import VerifyDelegateConnection from '@delegates/pages/delegates/delegateCommandLineCreation/components/VerifyDelegateConnection'
import { delegateNameRegex } from '@delegates/components/CreateDelegate/DockerDelegate/Step1Setup/Step1Setup'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { DelegateSuccessHandler, DeploymentType } from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import css from './CreateK8sDelegate.module.scss'
export interface CreateK8sDelegateProps {
  onSuccessHandler: (data: DelegateSuccessHandler) => void
  handleHelpPanel: () => void
  successRef: React.MutableRefObject<(() => void) | null>
  delegateNameRef: React.MutableRefObject<string | undefined>
  disableNextBtn: () => void
  enableNextBtn: () => void
}

export const CreateK8sDelegateV2 = ({
  onSuccessHandler,
  delegateNameRef,
  disableNextBtn,
  enableNextBtn
}: CreateK8sDelegateProps): JSX.Element => {
  const {
    state: { delegate: delegateData }
  } = useCDOnboardingContext()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()

  const getDelegateName = useMemo(
    (): string =>
      !isEmpty(delegateData?.environmentEntities?.delegate)
        ? (delegateData?.environmentEntities?.delegate as string)
        : DelegateDefaultName.HELM,
    [delegateData?.environmentEntities?.delegate]
  )

  const [errorDelegateNameLength, setErrorDelegateNameLength] = useState<boolean>(false)
  const [errorDelegateName, setErrorDelegateName] = useState<boolean>(false)
  const [command, setCommand] = useState<string>('')
  const [originalCommand, setOriginalCommand] = useState<string>('')
  const [verifyButtonClicked, setVerifyButtonClicked] = useState<boolean>(
    !isEmpty(delegateData?.environmentEntities?.delegate)
  )
  const [delegateName, setDelegateName] = useState<string>(getDelegateName)
  const [showVerifyButton, setShowVerifyButton] = useState<boolean>(
    isEmpty(delegateData?.environmentEntities?.delegate)
    //true
  )

  const linkRef = useRef<HTMLAnchorElement>(null)

  const delegateSuccessHandler = useCallback(
    () => onSuccessHandler({ delegateCreated: true, delegateInstalled: true }),
    [onSuccessHandler]
  )

  const {
    loading: commandLoading,
    data: commandData,
    error
  } = useGetInstallationCommand({
    queryParams: { accountId, commandType: 'HELM', orgId: orgIdentifier, projectId: projectIdentifier }
  })

  useEffect(() => {
    if (commandData && commandData?.resource && commandData?.resource['command']) {
      setCommand(commandData?.resource['command'])
      setOriginalCommand(commandData?.resource['command'])
    }
  }, [commandData])

  useEffect(() => {
    delegateNameRef.current = delegateName
  }, [delegateName, delegateNameRef])

  useEffect(() => {
    if (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }, [error, showError])

  useEffect(() => {
    showVerifyButton ? disableNextBtn() : enableNextBtn()
  }, [disableNextBtn, enableNextBtn, showVerifyButton])

  const onDelegateError = (): void => {
    setShowVerifyButton(false)
    onSuccessHandler({
      delegateCreated: true,
      delegateInstalled: false
    })
  }
  const checkIfErrorBlockAlreadyVisible = (): void => {
    if (!showVerifyButton && verifyButtonClicked) {
      setShowVerifyButton(true)
    }
    setVerifyButtonClicked(false)
  }

  const delegateNameError = (): string | undefined => {
    let errorMessage = undefined
    if (errorDelegateName) {
      errorMessage = getString('delegates.delegateNameRegexIssue')
    }
    if (errorDelegateNameLength) {
      const lengthMessage = getString('delegates.delegateNameLength', { length: DelegateNameLengthLimit })
      errorMessage = errorMessage ? `${errorMessage}${lengthMessage}` : lengthMessage
    }
    return errorMessage
  }

  const delegateNameInput = (
    <Layout.Vertical margin={{ bottom: 'xlarge' }} width={300}>
      <TextInput
        value={delegateName}
        errorText={delegateNameError()}
        maxLength={DelegateNameLengthLimit + 1}
        placeholder={getString('delegate.delegateName')}
        intent={errorDelegateName || errorDelegateNameLength ? Intent.DANGER : Intent.NONE}
        onChange={e => {
          const latestValue = (e.currentTarget as HTMLInputElement).value.trim()
          const delegateNameSchema = Yup.object({
            name: Yup.string().trim().matches(delegateNameRegex)
          })
          const delegateLengthSchema = Yup.object({
            name: Yup.string().trim().max(DelegateNameLengthLimit)
          })
          const validText = delegateNameSchema.isValidSync({ name: latestValue })
          const validTextLength = delegateLengthSchema.isValidSync({ name: latestValue })
          setErrorDelegateNameLength(!validTextLength)
          setErrorDelegateName(!validText)
          checkIfErrorBlockAlreadyVisible()
          setDelegateName(latestValue)
          setCommand(originalCommand.replace(new RegExp(DelegateDefaultName.HELM, 'g'), latestValue)) // delegateDefaultName
        }}
      />
    </Layout.Vertical>
  )

  if (commandLoading) {
    return (
      <Container className={css.spinner} margin={{ bottom: 'large' }}>
        <PageSpinner message={getString('cd.loadingDelegate')} />
      </Container>
    )
  }

  const verifyDelegateConnection = (
    <>
      {
        <>
          {showVerifyButton && (
            <>
              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                spacing="none"
                margin={{ bottom: 'xlarge' }}
              >
                <Button
                  disabled={!delegateName || errorDelegateName || errorDelegateNameLength}
                  variation={ButtonVariation.SECONDARY}
                  text={getString('verify')}
                  onClick={() => {
                    trackEvent(CDOnboardingActions.StartOnboardingDelegateCreation, {
                      deployment_type: DeploymentType.K8s
                    })
                    onSuccessHandler({
                      delegateCreated: true,
                      delegateInstalled: false
                    })
                    setVerifyButtonClicked(true)
                    setShowVerifyButton(false)
                  }}
                  margin={{ right: 'xlarge' }}
                />
                <Text font={{ variation: FontVariation.BODY }}>
                  {getString('delegates.commandLineCreation.verifyInfo')}
                </Text>
              </Layout.Horizontal>
            </>
          )}
          {verifyButtonClicked && (
            <VerifyDelegateConnection
              onErrorHandler={onDelegateError}
              onSuccessHandler={delegateSuccessHandler}
              onDone={noop}
              name={delegateName}
              delegateType={DelegateCommonProblemTypes.HELM_CHART}
              showDoneButton={false}
              verificationInProgressLabel={'delegate.successVerification.checkDelegateInstalled'}
            />
          )}
        </>
      }
    </>
  )

  return (
    <>
      <Layout.Vertical className={css.marginBottomClass}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
          {getString('cd.instructionsDelegate')}
        </Text>
        <ul className={css.progress}>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Text
              font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
              className={css.subHeading}
              data-tooltip-id="cdOnboardingDelegateName"
            >
              {getString('delegate.delegateName')}
              <HarnessDocTooltip tooltipId="cdOnboardingDelegateName" useStandAlone={true} />
            </Text>
            {delegateNameInput}
          </li>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Text
              font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
              className={css.subHeading}
              data-tooltip-id="cdOnboardingDelegateInstructions"
            >
              {getString('cd.getStartedWithCD.installationInstructions')}
              <HarnessDocTooltip tooltipId="cdOnboardingDelegateInstructions" useStandAlone={true} />
            </Text>
            <HelmChartCommands command={command} combineAllCommands />
          </li>

          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
                {getString('delegates.commandLineCreation.verifyDelegateConnection')}
              </Text>
              {verifyDelegateConnection}
            </Layout.Vertical>
          </li>
        </ul>
      </Layout.Vertical>
      <a className="hide" ref={linkRef} target={'_blank'} />
    </>
  )
}
