/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useStrings } from 'framework/strings'
import { WizardWithProgress } from '@common/components/WizardWithProgress/WizardWithProgress'
import { Status } from '@common/components/WizardWithProgress/WizardHelper'

import { GetDelegateTitleTextByType } from '@delegates/pages/delegates/utils/DelegateHelper'

import type { DelegateInfoDTO } from '@delegates/DelegateInterface'
import { DelegateTypes } from '@delegates/constants'
import DelegateSetupStep from './DelegateSetupStep/DelegateSetupStep'
import Stepk8ReviewScript from './StepReviewScript/Stepk8sReviewScript'
import StepSuccessVerification from './StepSuccessVerification/StepSuccessVerifcation'
import css from './CreateK8sDelegate.module.scss'

interface CreateK8sDelegateProps {
  delegateInfo?: DelegateInfoDTO | void
  onBack: any
  onClose?: any
}

const CreateK8sDelegate: React.FC<CreateK8sDelegateProps> = props => {
  const { getString } = useStrings()
  const panels = [
    {
      tabTitle: getString('delegates.delSetup'),
      id: 'delegateSetup',
      status: Status.INPROGRESS
    },
    { tabTitle: getString('delegates.reviewYAML'), id: 'reviewScript', status: Status.TODO },
    {
      tabTitle: getString('delegates.verification'),
      id: 'verifications',
      status: Status.TODO
    }
  ]
  return (
    <>
      <WizardWithProgress
        title={GetDelegateTitleTextByType(DelegateTypes.KUBERNETES_CLUSTER)}
        isNavMode={false}
        className={css.stepWizard}
        panels={panels}
      >
        <DelegateSetupStep
          onBack={() => {
            props?.onBack()
          }}
        />
        <Stepk8ReviewScript />

        <StepSuccessVerification
          onClose={() => {
            props?.onClose()
          }}
        />
      </WizardWithProgress>
    </>
  )
}

export default CreateK8sDelegate
