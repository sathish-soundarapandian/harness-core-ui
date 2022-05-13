/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import React, { useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@harness/uicore'
import type { IDialogProps } from '@blueprintjs/core'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'
import type { GovernanceMetadata, ResponseConnectorResponse } from 'services/cd-ng'
import { EvaluationView } from '@governance/EvaluationView'
import { useModuleInfo } from '@common/hooks/useModuleInfo'

interface HideOrShowGovernanceErrorModalRtnType {
  canGoToNextStep: boolean
}
export interface UseConnectorGovernanceModalPayload {
  hideOrShowGovernanceErrorModal(
    governanceMetadata: ResponseConnectorResponse
  ): Promise<HideOrShowGovernanceErrorModalRtnType>
  doesGovernanceHasError(governanceMetadata: ResponseConnectorResponse): boolean
}
interface UseGovernanceModalProps {
  featureFlag: FeatureFlag
  errorOutOnGovernanceWarning: boolean
}
export const useConnectorGovernanceModal = ({
  featureFlag,
  errorOutOnGovernanceWarning
}: UseGovernanceModalProps): UseConnectorGovernanceModalPayload => {
  const { getString } = useStrings()

  const OPA_GOVERNANCE = useFeatureFlag(featureFlag)
  const [governanceModalRetnPromise, setGovernanceModalRetnPromise] =
    useState<
      (prop: HideOrShowGovernanceErrorModalRtnType | PromiseLike<HideOrShowGovernanceErrorModalRtnType>) => void
    >()
  const { accountId: accountIdentifier } = useParams<AccountPathProps>()
  const [governanceMetadataTemp, setGovernanceMetadataTemp] = useState<GovernanceMetadata>()
  const { module } = useModuleInfo()
  const [showGovernanceErrorModal, hideGovernanaceErrorModal] = useModalHook(() => {
    const confirmDialogProps: IDialogProps = {
      isOpen: true,
      autoFocus: true,
      canEscapeKeyClose: true,
      canOutsideClickClose: true,
      enforceFocus: false,
      style: { width: '70%', height: 600 }
    }
    return (
      <Dialog
        {...confirmDialogProps}
        onClose={() => {
          hideGovernanaceErrorModal()
          if (governanceModalRetnPromise) {
            if (
              (governanceMetadataTemp?.status === 'warning' && !errorOutOnGovernanceWarning) ||
              governanceMetadataTemp?.status === 'pass'
            ) {
              governanceModalRetnPromise({ canGoToNextStep: true })
            } else {
              governanceModalRetnPromise({ canGoToNextStep: false })
            }
          }
        }}
      >
        <EvaluationView
          module={module}
          accountId={accountIdentifier}
          metadata={governanceMetadataTemp}
          headingErrorMessage={getString('connectors.policyEvaluations.failedToSave')}
          headingWarningMessage={getString('connectors.policyEvaluations.warning')}
        />
      </Dialog>
    )
  }, [governanceMetadataTemp, governanceModalRetnPromise])

  const doesGovernanceHasError = (response: ResponseConnectorResponse): boolean => {
    const governanceMetadata = response.data?.governanceMetadata
    if (governanceMetadata && OPA_GOVERNANCE && governanceMetadata?.status === 'error') {
      return true
    }
    return false
  }
  const hideOrShowGovernanceErrorModal = (
    response: ResponseConnectorResponse
  ): Promise<HideOrShowGovernanceErrorModalRtnType> => {
    const governanceMetadata = response.data?.governanceMetadata
    if (governanceMetadata) {
      setGovernanceMetadataTemp(governanceMetadata)
      if (OPA_GOVERNANCE && (governanceMetadata?.status === 'error' || governanceMetadata?.status === 'warning')) {
        showGovernanceErrorModal()
        return new Promise<HideOrShowGovernanceErrorModalRtnType>(resolve => {
          setGovernanceModalRetnPromise(() => resolve)
        })
      }
    }
    return Promise.resolve({ canGoToNextStep: true })
  }
  return {
    hideOrShowGovernanceErrorModal,
    doesGovernanceHasError
  }
}
