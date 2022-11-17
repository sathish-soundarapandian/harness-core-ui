/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import type { StepProps } from '@harness/uicore'
import GitSyncRepoForm, {
  gitSyncFormDefaultInitialData,
  GitSyncFormInterface,
  GitSyncRepoFormProps
} from '@gitsync/components/gitSyncRepoForm/GitSyncRepoForm'
import type { GitSyncConfig } from 'services/cd-ng'

interface GitSyncRepoFormStepProps extends GitSyncRepoFormProps {
  onClose?: () => void
}

interface StepData {
  formData: GitSyncFormInterface
}

const GitSyncRepoFormStep: React.FC<StepProps<unknown & StepData> & GitSyncRepoFormStepProps> = props => {
  const {
    nextStep,
    accountId = '',
    orgIdentifier = '',
    projectIdentifier = '',
    isEditMode = false,
    isNewUser = false,
    prevStepData
  } = props

  return (
    <GitSyncRepoForm
      accountId={accountId}
      orgIdentifier={orgIdentifier}
      projectIdentifier={projectIdentifier}
      isEditMode={isEditMode}
      isNewUser={isNewUser}
      gitSyncRepoInfo={undefined}
      initialData={prevStepData?.formData}
      onSuccess={(data?: GitSyncConfig, formData?: GitSyncFormInterface) => {
        nextStep?.({ ...props, ...data, formData: formData || gitSyncFormDefaultInitialData })
      }}
      onClose={() => props.onClose?.()}
    />
  )
}

export default GitSyncRepoFormStep
