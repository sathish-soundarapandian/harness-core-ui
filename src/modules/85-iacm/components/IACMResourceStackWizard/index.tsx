/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepProps, StepWizard, StepWizardProps } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import StackRepoTypeStep from './StackRepoTypeStep'
import StackProvisionerDetailsStep from './StackProvisionerDetailsStep'
import StackProvisionerTypeStep from './StackProvisionerTypeStep'
import StackRepoDetailsStep from './StackRepoDetailsStep'
import css from './StackWizard.module.scss'

export type IACMResourceStack = {
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

export type IACMResourceStackWizardProps = StackWizardProps
type StackWizardProps = StepWizardProps<unknown> & {
  onSubmit: (data?: IACMResourceStack) => void
}

export type StackWizardStepProps = StepProps<IACMResourceStack>

const IACMResourceStackWizard: React.FC<Partial<IACMResourceStackWizardProps>> = (props): JSX.Element => {
  const { getString } = useStrings()
  const onCompleteWizard = (data?: IACMResourceStack): void => {
    const { onSubmit } = props
    onSubmit?.(data)
  }

  return (
    <StepWizard
      icon="docs"
      iconProps={{
        size: 37
      }}
      title={getString('iacm.createStack')}
      className={css.scriptWizard}
      onCompleteWizard={onCompleteWizard}
    >
      <StackProvisionerTypeStep name={getString('iacm.stackWizard.provisionerType')} identifier={'provisioner_type'} />
      <StackProvisionerDetailsStep
        name={getString('iacm.stackWizard.provisionerDetails')}
        identifier={'provisioner_details'}
      />
      <StackRepoTypeStep name={getString('repository')} identifier={'repo_type'} />
      <StackRepoDetailsStep name={getString('iacm.stackWizard.repoDetails')} identifier={'repo_details'} />
    </StepWizard>
  )
}

export default IACMResourceStackWizard
