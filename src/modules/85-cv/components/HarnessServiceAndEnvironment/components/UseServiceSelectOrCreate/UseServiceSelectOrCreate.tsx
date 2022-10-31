/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMemo } from 'react'
import { noop } from 'lodash-es'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { useStrings } from 'framework/strings'
import { useHarnessServicetModal } from '@common/modals/HarnessServiceModal/HarnessServiceModal'
import type { ServiceResponseDTO } from 'services/cd-ng'
import { ADD_NEW_VALUE } from '@cv/constants'

export interface MultiSelectService {
  options: SelectOption[]
  onNewCreated(value: ServiceResponseDTO): void
  modalTitle?: string
}
export interface MultiSelectReturn {
  serviceOptions: SelectOption[]
  openHarnessServiceModal: () => void
}

export const useServiceSelectOrCreate = ({
  options,
  onNewCreated,
  modalTitle
}: MultiSelectService): MultiSelectReturn => {
  const { getString } = useStrings()
  const serviceOptions = useMemo(
    () => [
      {
        label: '+ Add New',
        value: ADD_NEW_VALUE
      },
      ...options
    ],
    [options]
  )

  const onSubmit = async (values: any): Promise<void> => {
    onNewCreated(values)
  }

  const { openHarnessServiceModal } = useHarnessServicetModal({
    data: {
      name: '',
      description: '',
      identifier: '',
      tags: {}
    },
    isService: true,
    isEdit: false,
    onClose: noop,
    modalTitle: modalTitle || getString('newService'),
    onCreateOrUpdate: onSubmit
  })
  return { serviceOptions, openHarnessServiceModal }
}
