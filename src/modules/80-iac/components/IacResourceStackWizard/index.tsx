/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepProps, StepWizard, StepWizardProps } from '@harness/uicore'
import StackRepoTypeStep from './StackRepoTypeStep'
import StackProvisionerDetailsStep from './StackProvisionerDetailsStep'
import StackProvisionerTypeStep from './StackProvisionerTypeStep'
import StackRepoDetailsStep from './StackRepoDetailsStep'
import css from './StackWizard.module.scss'

export type IacResourceStack = {
  name?: string
  identifier?: string
  description?: string
  connector?: string
  provisionerType?: string
  provisionerVersion?: string
  workspace?: string
  autoApprove?: boolean
  ttl?: string
  repoConnectorType?: string
  repoConnector?: string
  branch?: string
  scriptsPath?: string
}

export type IacResourceStackWizardProps = StackWizardProps
type StackWizardProps = StepWizardProps<unknown> & {
  onSubmit: (data?: IacResourceStack) => void
}

export type StackWizardStepProps = StepProps<IacResourceStack>

const IacResourceStackWizard: React.FC<IacResourceStackWizardProps> = (props): JSX.Element => {
  const onCompleteWizard = (data?: IacResourceStack): void => {
    const { onSubmit } = props
    onSubmit(data)
  }

  return (
    <StepWizard
      icon={'docs'}
      iconProps={{
        size: 37
      }}
      title={'Stack step wizard'}
      className={css.scriptWizard}
      onCompleteWizard={onCompleteWizard}
    >
      <StackProvisionerTypeStep name={'Provisioner Type'} identifier={'provisioner_type'} />
      <StackProvisionerDetailsStep name={'Provisioner Details'} identifier={'provisioner_details'} />
      <StackRepoTypeStep name={'Repository'} identifier={'repo_type'} />
      <StackRepoDetailsStep name={'Repository Details'} identifier={'repo_details'} />
    </StepWizard>
  )
}

export default IacResourceStackWizard
