/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { SecretDTOV2 } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, SecretActions } from '@common/constants/TrackingConstants'
import StepSSHDetails from './views/StepDetails'
import StepAuthentication from './views/StepAuthentication'
import StepVerify from './views/StepVerify'

import type { DetailsForm } from './views/StepDetails'
import type { SSHConfigFormData } from './views/StepAuthentication'

interface CreateSSHCredWizardProps {
  onSuccess?: (secret: SecretDTOV2) => void
  hideModal?: () => void
}

export interface SSHCredSharedObj {
  detailsData?: DetailsForm
  authData?: SSHConfigFormData
  isEdit?: boolean
}

const CreateSSHCredWizard: React.FC<CreateSSHCredWizardProps & SSHCredSharedObj> = props => {
  const { isEdit } = props
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  React.useEffect(() => {
    trackEvent(SecretActions.StartCreateSecret, {
      category: Category.PROJECT
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <StepWizard<SSHCredSharedObj> icon="secret-ssh" iconProps={{ size: 37 }} title={getString('ssh.sshCredential')}>
      <StepSSHDetails name={getString('secrets.createSSHCredWizard.titleDetails')} {...props} />
      <StepAuthentication name={getString('configuration')} onSuccess={props.onSuccess} isEdit={isEdit} />
      <StepVerify name={getString('secrets.stepTitleVerify')} closeModal={props.hideModal} />
    </StepWizard>
  )
}

export default CreateSSHCredWizard
