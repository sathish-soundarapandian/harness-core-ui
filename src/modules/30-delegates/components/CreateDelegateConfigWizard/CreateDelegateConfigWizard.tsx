/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { StepWizard, useToaster, tagsType } from '@harness/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { DelegateProfileDetailsNg, UseAddDelegateProfileNgV2Props } from 'services/cd-ng'
import { useAddDelegateProfileNgV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import DelegateConfigOverviewStep from './steps/DelegateConfigOverviewStep'
import DelegateConfigScriptStep from './steps/DelegateConfigScriptStep'

export interface dataObj {
  name?: string
  description?: string
  script?: string
  tags?: tagsType
  identifier?: string
}

import css from './CreateDelegateConfigWizard.module.scss'

interface CreateDelegateConfigWizardProps {
  onClose: () => void
  onSuccess: () => void
}

export const CreateDelegateConfigWizard: React.FC<CreateDelegateConfigWizardProps> = ({ onClose, onSuccess }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: addDelegateProfile } = useAddDelegateProfileNgV2({
    accountId
  } as UseAddDelegateProfileNgV2Props)
  const { showSuccess, showError } = useToaster()

  const onFinish = async (delegateProfileData: DelegateProfileDetailsNg): Promise<void> => {
    try {
      await addDelegateProfile(delegateProfileData)
      showSuccess(getString('delegates.newDelegateConfigWizard.successMessage'))
      onSuccess()
    } catch (error) {
      showError(error.message)
    } finally {
      onClose()
    }
  }

  const { getString } = useStrings()
  return (
    <StepWizard className={css.delegateConfigWizard} title="Delegate Configuration">
      <DelegateConfigOverviewStep name={getString('overview')} />
      <DelegateConfigScriptStep name={getString('delegates.newDelegateConfigWizard.scriptTitle')} onFinish={onFinish} />
    </StepWizard>
  )
}
