/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Button, Layout, StepProps } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useCreateDelegateGroup } from 'services/portal'

import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import { DelegateTypes } from '@delegates/constants'
import StepProcessing from '../../components/StepProcessing/StepProcessing'
import type { DockerDelegateWizardData } from '../CreateDockerDelegate'

import css from '../Step1Setup/Step1Setup.module.scss'

interface StepSuccessVerificationProps {
  onClose?: any
}

const Step3Verify: React.FC<StepProps<DockerDelegateWizardData> & StepSuccessVerificationProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [isVerifiedSuccessfully, setIsVerifiedSuccessfully] = useState(false)
  const { previousStep, prevStepData } = props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()

  const onClickBack = (): void => {
    if (previousStep) {
      previousStep(prevStepData)
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
      ...prevStepData
    })
    if (!isVerifiedSuccessfully) {
      const dockerData = {
        delegateType: 'DOCKER',
        orgIdentifier,
        projectIdentifier,
        name: prevStepData?.name,
        identifier: prevStepData?.identifier,
        description: prevStepData?.description,
        tags: prevStepData?.tags,
        tokenName: prevStepData?.tokenName
      } as any
      const response = (await createDelegateGroup(dockerData)) as any
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

  return (
    <>
      <Layout.Horizontal className={css.baseContainer}>
        <Layout.Vertical className={css.leftPanel}>
          <StepProcessing
            delegateType={DelegateTypes.DOCKER}
            name={props?.prevStepData?.name}
            replicas={1}
            onSuccessHandler={() => setIsVerifiedSuccessfully(true)}
          />
        </Layout.Vertical>
      </Layout.Horizontal>
      <Layout.Horizontal padding="xxxlarge">
        <Button
          id="stepReviewScriptBackButton"
          text={getString('back')}
          onClick={onClickBack}
          icon="chevron-left"
          margin={{ right: 'small' }}
        />
        <Button text={getString('done')} intent="primary" padding="small" onClick={onClickDone} />
      </Layout.Horizontal>
    </>
  )
}

export default Step3Verify
