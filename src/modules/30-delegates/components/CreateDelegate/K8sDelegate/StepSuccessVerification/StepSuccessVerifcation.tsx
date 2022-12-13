/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'

import { Button, Layout, StepProps, Heading, Text, Container } from '@harness/uicore'

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import { useCreateDelegateGroup } from 'services/portal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { K8sDelegateWizardData } from '../DelegateSetupStep/DelegateSetupStep'
import StepProcessing from '../../components/StepProcessing/StepProcessing'

import { DelegateType } from '../DelegateSetupStep/DelegateSetupStep.types'
import css from '../CreateK8sDelegate.module.scss'

interface StepSuccessVerifcationProps {
  onClose?: any
}
const StepSuccessVerification: React.FC<StepProps<K8sDelegateWizardData> & StepSuccessVerifcationProps> = props => {
  const { previousStep, prevStepData } = props
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const delegateType = prevStepData?.delegateYaml?.delegateType || DelegateType.KUBERNETES
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [isVerifiedSuccessfully, setIsVerifiedSuccessfully] = useState(false)
  const onClickBack = (): void => {
    if (previousStep) {
      previousStep(props?.prevStepData)
    }
  }
  const { mutate: createDelegateGroup } = useCreateDelegateGroup({
    queryParams: {
      accountId
    }
  })
  const onClickDone = async () => {
    trackEvent(DelegateActions.SaveCreateDelegate, {
      category: Category.DELEGATE,
      ...prevStepData?.delegateYaml
    })
    if (!isVerifiedSuccessfully) {
      const delegateSetupDetails = {
        delegateType: prevStepData?.delegateYaml?.delegateType,
        orgIdentifier,
        projectIdentifier,
        name: prevStepData?.name,
        identifier: prevStepData?.delegateYaml?.identifier,
        description: prevStepData?.delegateYaml?.description,
        tags: prevStepData?.delegateYaml?.tags === null ? [] : prevStepData?.delegateYaml?.tags,
        tokenName: prevStepData?.delegateYaml?.tokenName,
        size: prevStepData?.delegateYaml?.size,
        k8sConfigDetails: prevStepData?.delegateYaml?.k8sConfigDetails
      } as any
      const response = (await createDelegateGroup(delegateSetupDetails)) as any
      if (response?.ok) {
        props?.onClose()
      } else {
        const err = (response as any)?.responseMessages?.[0]?.message
        showError(err)
      }
    } else {
      props?.onClose()
    }
  }

  const insert = (str: string, index: number, value: string | any): string => {
    return str.slice(0, index) + value + str.slice(index)
  }
  // TODO: Create common components for label and command and use it at all the places
  const helmDelegateInstructions = (
    <Layout.Horizontal className={css.verificationBody}>
      <Layout.Vertical className={css.panelLeft}>
        <Layout.Horizontal>
          <Heading level={2} className={css.titleYamlVerification}>
            {getString('delegate.successVerification.applyYAMLTitle')}
          </Heading>
        </Layout.Horizontal>
        <Layout.Horizontal className={css.descriptionVerificationWrapper}>
          <Text font="normal" width={408}>
            {getString('delegates.successVerification.applyYAMLTitleForHelm')}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal>
          <Text font="normal" width={408}>
            {getString('delegates.successVerification.addHelmRepoLabel')}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal width={530} spacing="small" className={css.verificationFieldWrapper}>
          <Container
            intent="primary"
            padding="small"
            font={{
              align: 'left'
            }}
            flex
            className={css.verificationField}
          >
            <Text style={{ marginRight: 'var(--spacing-xlarge)' }} font="small">
              {getString('delegates.successVerification.addHelmRepoCmd')}
            </Text>
            <CopyToClipboard content={getString('delegates.successVerification.addHelmRepoCmd').slice(2)} />
          </Container>
        </Layout.Horizontal>
        <Layout.Horizontal>
          <Text font="normal" width={408}>
            {getString('delegates.successVerification.installHelmChartLabel')}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal width={530} spacing="small" className={css.verificationFieldWrapper}>
          <Container
            intent="primary"
            padding="small"
            font={{
              align: 'left'
            }}
            flex
            className={css.verificationField}
          >
            <Text style={{ marginRight: 'var(--spacing-xlarge)' }} font="small">
              {insert(getString('delegates.successVerification.installHelmChartCmd'), 15, prevStepData?.name)}
            </Text>
            <CopyToClipboard
              content={insert(
                getString('delegates.successVerification.installHelmChartCmd'),
                15,
                prevStepData?.name
              ).slice(2)}
            />
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
      <Layout.Vertical>
        <hr className={css.verticalLine} />
      </Layout.Vertical>
      <Layout.Vertical>
        <StepProcessing
          name={props.prevStepData?.name}
          replicas={props.prevStepData?.replicas}
          onSuccessHandler={() => setIsVerifiedSuccessfully(true)}
        />
      </Layout.Vertical>
    </Layout.Horizontal>
  )

  return (
    <>
      {delegateType === DelegateType.HELM_CHART ? (
        helmDelegateInstructions
      ) : (
        <Layout.Horizontal className={css.verificationBody}>
          <Layout.Vertical className={css.panelLeft}>
            <Layout.Horizontal>
              <Heading level={2} className={css.titleYamlVerification}>
                {getString('delegate.successVerification.applyYAMLTitle')}
              </Heading>
            </Layout.Horizontal>
            <Layout.Horizontal className={css.descriptionVerificationWrapper}>
              <Text font="normal" width={408}>
                {getString('delegate.successVerification.description1')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal>
              <Text font={{ weight: 'bold', size: 'normal' }} width={408}>
                {getString('delegate.successVerification.description2')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="medium" className={css.verificationFieldWrapper}>
              <Container
                intent="primary"
                padding="small"
                font={{
                  align: 'center'
                }}
                flex
                className={css.verificationField}
              >
                <Text style={{ marginRight: 'var(--spacing-xlarge)' }} font="small">
                  {getString('delegate.verifyDelegateYamlCmnd')}
                </Text>
                <CopyToClipboard content={getString('delegate.verifyDelegateYamlCmnd').slice(2)} />
              </Container>
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Vertical>
            <hr className={css.verticalLine} />
          </Layout.Vertical>
          <Layout.Vertical>
            <StepProcessing
              name={props.prevStepData?.name}
              replicas={props.prevStepData?.replicas}
              onSuccessHandler={() => setIsVerifiedSuccessfully(true)}
            />
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
      <Layout.Horizontal padding="xxxlarge">
        <Button
          id="stepReviewScriptBackButton"
          text={getString('back')}
          onClick={() => {
            onClickBack()
            trackEvent(DelegateActions.VerificationBack, {
              category: Category.DELEGATE,
              data: props.prevStepData
            })
          }}
          icon="chevron-left"
          margin={{ right: 'small' }}
        />
        <Button text={getString('done')} intent="primary" padding="small" onClick={onClickDone} />
      </Layout.Horizontal>
    </>
  )
}

export default StepSuccessVerification
