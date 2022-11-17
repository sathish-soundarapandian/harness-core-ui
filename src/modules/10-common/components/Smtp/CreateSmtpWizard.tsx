/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { NgSmtpDTO } from 'services/cd-ng'
import StepSmtpDetails from './views/StepDetails'
import StepCredentials from './views/StepCredentials'
import StepTestConnection from './views/StepTestConnection'

export interface CreateSmtpWizardProps {
  onSuccess?: (smtp: NgSmtpDTO) => void
  hideModal?: () => void
}

export interface SmtpSharedObj {
  detailsData?: NgSmtpDTO
  isEdit?: boolean
}

const CreateSmtpWizard: React.FC<CreateSmtpWizardProps & SmtpSharedObj> = props => {
  const { getString } = useStrings()

  return (
    <StepWizard icon="smtp" iconProps={{ size: 56, color: Color.WHITE }} title={getString('common.smtp.conifg')}>
      <StepSmtpDetails name={getString('details')} {...props} />
      <StepCredentials name={getString('credentials')} {...props} />
      <StepTestConnection name={getString('common.smtp.testConnection')} {...props} />
    </StepWizard>
  )
}

export default CreateSmtpWizard
