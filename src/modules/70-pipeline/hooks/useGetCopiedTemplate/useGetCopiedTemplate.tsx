/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { VariablesInputModal } from '@pipeline/hooks/useGetCopiedTemplate/VariablesInputModal/VariablesInputModal'
import css from './useGetCopiedTemplate.module.scss'

export interface VariablesInputModalProps {
  template: TemplateSummaryResponse
  storeMetadata?: StoreMetadata
  expressions?: string[]
  onResolve: (yaml: string) => void
  onReject: () => void
}

export default function useGetCopiedTemplate(): {
  getCopiedTemplate: (template: TemplateSummaryResponse) => Promise<string>
} {
  const { expressions } = useVariablesExpression()
  const {
    state: { storeMetadata }
  } = usePipelineContext()
  const [modalProps, setModalProps] = React.useState<{
    template: TemplateSummaryResponse
    resolve: (yaml: string) => void
    reject: () => void
  }>()

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.templateVariablesDialog}>
        {modalProps && (
          <VariablesInputModal
            template={modalProps.template}
            onResolve={modalProps.resolve}
            onReject={modalProps.reject}
            storeMetadata={storeMetadata}
            expressions={expressions}
          />
        )}
      </Dialog>
    )
  }, [modalProps, storeMetadata, expressions])

  const getCopiedTemplate = (template: TemplateSummaryResponse): Promise<string> => {
    return new Promise((resolve, reject) => {
      setModalProps({
        template,
        resolve: (yaml: string) => {
          hideModal()
          resolve(yaml)
        },
        reject: () => {
          hideModal()
          reject()
        }
      })
      showModal()
    })
  }
  return { getCopiedTemplate }
}
