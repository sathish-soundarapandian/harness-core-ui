/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMemo } from 'react'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { useStrings } from 'framework/strings'
import { useHarnessServicetModal } from '@common/modals/HarnessServiceModal/HarnessServiceModal'
import type { ServiceRequestDTO, ServiceResponseDTO } from 'services/cd-ng'
import { AddNewSelectOption, initModalData } from './UseServiceSelectOrCreate.constants'

export interface MultiSelectService {
  options: SelectOption[]
  onNewCreated(value: ServiceResponseDTO): void
  modalTitle?: string
  skipServiceCreateOrUpdate?: boolean
  customLoading?: boolean
}
export interface MultiSelectReturn {
  serviceOptions: SelectOption[]
  openHarnessServiceModal: () => void
}

export const useServiceSelectOrCreate = ({
  options,
  onNewCreated,
  modalTitle,
  skipServiceCreateOrUpdate,
  customLoading
}: MultiSelectService): MultiSelectReturn => {
  const { getString } = useStrings()
  const serviceOptions = useMemo(() => [{ ...AddNewSelectOption(getString) }, ...options], [options]) as SelectOption[]

  const onSubmit = async (values: ServiceRequestDTO): Promise<void> => {
    onNewCreated(values)
  }

  const { openHarnessServiceModal } = useHarnessServicetModal({
    ...initModalData,
    modalTitle: modalTitle || getString('newService'),
    onCreateOrUpdate: onSubmit,
    skipServiceCreateOrUpdate,
    customLoading
  })
  return { serviceOptions, openHarnessServiceModal }
}
