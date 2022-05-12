/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { noop } from 'lodash-es'
import { Container, MultiTypeInput, MultiTypeInputType, Select, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useHarnessServicetModal } from '@common/modals/HarnessServiceModal/HarnessServiceModal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ServiceResponseDTO, ServiceRequestDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ADD_NEW_VALUE } from '@cv/constants'

export interface ServiceSelectOrCreateProps {
  item?: SelectOption | string
  options: Array<SelectOption>
  onSelect(value: SelectOption): void
  className?: string
  onNewCreated(value: ServiceResponseDTO): void
  disabled?: boolean
  modalTitle?: string
  placeholder?: string
  skipServiceCreateOrUpdate?: boolean
  loading?: boolean
  name?: string
  customLoading?: boolean
  isMultiType?: boolean
  isTemplate?: boolean
}
export function generateOptions(response?: ServiceResponseDTO[]): SelectOption[] {
  return response
    ? (response
        .filter(entity => entity && entity.identifier && entity.name)
        .map(entity => ({ value: entity.identifier, label: entity.name })) as SelectOption[])
    : []
}

export const ServiceSelectOrCreate: React.FC<ServiceSelectOrCreateProps> = props => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const {
    isMultiType = false,
    modalTitle,
    placeholder,
    skipServiceCreateOrUpdate,
    loading,
    name,
    customLoading
  } = props

  const selectOptions = useMemo(
    () => [
      {
        label: '+ Add New',
        value: ADD_NEW_VALUE
      },
      ...props.options
    ],
    [props.options]
  )

  const onSubmit = async (values: ServiceRequestDTO): Promise<void> => {
    props.onNewCreated(values)
  }

  const { openHarnessServiceModal } = useHarnessServicetModal({
    data: { name: '', identifier: '', orgIdentifier, projectIdentifier },
    isService: true,
    isEdit: false,
    onClose: noop,
    onCreateOrUpdate: onSubmit,
    modalTitle,
    skipServiceCreateOrUpdate,
    name,
    customLoading
  })

  const onSelectChange = (val: SelectOption | string): void => {
    if (typeof val !== 'string' && val?.value === ADD_NEW_VALUE) {
      openHarnessServiceModal()
    } else {
      if (typeof val === 'string') {
        props.onSelect({ label: val, value: val })
      } else {
        props.onSelect(val)
      }
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      {isMultiType ? (
        <MultiTypeInput
          name={name ?? 'service'}
          disabled={props.disabled}
          selectProps={{
            items: selectOptions
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          value={props.item}
          style={{ width: '400px' }}
          onChange={(val: any) => onSelectChange(val)}
          placeholder={loading ? getString('loading') : placeholder ?? getString('cv.selectCreateService')}
        />
      ) : (
        <Select
          name={name ?? 'service'}
          value={props.item as SelectOption}
          className={props.className}
          disabled={props.disabled}
          items={selectOptions}
          inputProps={{
            placeholder: loading ? getString('loading') : placeholder ?? getString('cv.selectCreateService')
          }}
          onChange={onSelectChange}
        />
      )}
    </Container>
  )
}
