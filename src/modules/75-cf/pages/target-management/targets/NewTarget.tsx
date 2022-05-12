/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { get } from 'lodash-es'
import { useToaster } from '@common/exports'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { CreateTargetQueryParams, useCreateTarget, useUploadTargets } from 'services/cf'
import CreateTargetModal, { TargetData } from './CreateTargetModal'

export interface NewTargetsProps {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
  onCreated: () => void
}

type SettledTarget = {
  status: 'fulfilled' | 'rejected'
  data: TargetData
}

export const NewTargets: React.FC<NewTargetsProps> = ({
  accountIdentifier,
  orgIdentifier,
  projectIdentifier,
  onCreated
}) => {
  const { showError, clear } = useToaster()
  const [loadingBulk, setLoadingBulk] = useState<boolean>(false)
  const { mutate: createTarget, loading: loadingCreateTarget } = useCreateTarget({
    queryParams: { accountIdentifier, orgIdentifier } as CreateTargetQueryParams
  })
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()

  const { mutate: uploadTarget, loading: loadingUploadTarget } = useUploadTargets({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }
  })

  const bulkTargetCreation = (ts: TargetData[]): Promise<SettledTarget[]> => {
    return Promise.all(
      ts.map((t: TargetData) => {
        return createTarget({
          identifier: t.identifier,
          name: t.name,
          anonymous: false,
          attributes: {},
          environment: environmentIdentifier,
          project: projectIdentifier,
          account: accountIdentifier,
          org: orgIdentifier
        })
          .then(() => ({
            status: 'fulfilled',
            data: t
          }))
          .catch(error => ({
            status: 'rejected',
            data: t,
            error
          })) as Promise<SettledTarget>
      })
    )
  }

  const handleTargetCreation = (ts: TargetData[], hideModal: () => void): void => {
    setLoadingBulk(true)
    bulkTargetCreation(ts)
      .then(results => {
        if (results.every(res => res.status === 'rejected')) {
          return Promise.reject(results)
        }
        results
          .filter(res => res.status === 'rejected')
          .forEach((res: SettledTarget) => {
            clear()
            showError(get(res, 'error.data.message', get(res, 'error.message')), 0, 'cf.create.bulk.target..error')
          })
      })
      .then(() => {
        hideModal()
        onCreated()
      })
      .catch(results => {
        results.forEach((res: SettledTarget) => {
          clear()
          showError(get(res, 'error.data.message', get(res, 'error.message')), 0, 'cf.create.bulk.target.error')
        })
      })
      .finally(() => setLoadingBulk(false))
  }

  const handleTargetFileCreation = (file: File, hideModal: () => void): void => {
    uploadTarget(createFormData(file) as any)
      .then(() => {
        hideModal()
        onCreated()
      })
      .catch(error => {
        showError(getErrorMessage(error), 0, 'cf.targets.uploadError')
      })
  }

  const createFormData = (file: File): FormData => {
    const formData = new FormData()
    formData.append(
      'fileName',
      new Blob([file], {
        type: 'application/octet-stream'
      })
    )
    return formData
  }

  return (
    <CreateTargetModal
      loading={loadingCreateTarget || loadingBulk || loadingUploadTarget}
      onSubmitTargets={handleTargetCreation}
      onSubmitTargetFile={handleTargetFileCreation}
    />
  )
}
