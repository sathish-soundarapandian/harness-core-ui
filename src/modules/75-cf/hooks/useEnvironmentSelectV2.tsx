/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Select, SelectOption, SelectProps } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { EnvironmentResponseDTO, useGetEnvironmentListForProject } from 'services/cd-ng'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import css from './useEnvironmentSelectV2.module.scss'

export interface UseEnvironmentSelectV2Params {
  selectedEnvironmentIdentifier?: string
  onChange?: (opt: SelectOption, environment: EnvironmentResponseDTO, userEvent: boolean) => void
  onEmpty?: () => void
  allowCreatingNewItems?: boolean
  showCreateButton?: boolean
  noDefault?: boolean
}

export const useEnvironmentSelectV2 = (params: UseEnvironmentSelectV2Params) => {
  const [, setActiveEnvironment] = useQueryParamsState('activeEnvironment', '', {
    serializer: env => env,
    deserializer: env => env
  })

  const { preference: preferredEnvironment, setPreference: setPreferredEnvironment } = usePreferenceStore<string>(
    PreferenceScope.USER,
    'FF_SELECTED_ENV'
  )
  const { getString } = useStrings()
  const {
    onChange = () => undefined,
    onEmpty = () => undefined,
    selectedEnvironmentIdentifier,
    allowCreatingNewItems,
    showCreateButton,
    noDefault
  } = params
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { data, loading, error, refetch } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })
  const [selectedEnvironment, setSelectedEnvironment] = useState<SelectOption>()
  const selectOptions: SelectOption[] =
    data?.data?.content?.map<SelectOption>(elem => ({
      label: elem.name as string,
      value: elem.identifier as string
    })) || []

  useEffect(() => {
    if (typeof selectedEnvironment?.value === 'string' && preferredEnvironment !== selectedEnvironment.value) {
      setPreferredEnvironment(selectedEnvironment.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredEnvironment, selectedEnvironment?.value])

  useEffect(() => {
    if (data?.data?.content?.length) {
      if (selectedEnvironmentIdentifier) {
        const found = data?.data?.content?.find(env => env.identifier === selectedEnvironmentIdentifier)

        if (found) {
          const newValue = {
            label: found.name as string,
            value: found.identifier as string
          }
          setSelectedEnvironment(newValue)
          onChange(newValue, found, false)
          setActiveEnvironment(found?.identifier as string)
          return
        }
      }

      if (!noDefault) {
        const preferenceOption = selectOptions.find(({ value }) => value === preferredEnvironment)

        if (preferenceOption) {
          setSelectedEnvironment(preferenceOption)
          onChange(
            preferenceOption,
            data.data.content.find(({ identifier }) => identifier === preferredEnvironment) as EnvironmentResponseDTO,
            false
          )
          setActiveEnvironment(preferredEnvironment)
        } else {
          setSelectedEnvironment(selectOptions[0])
          onChange(selectOptions[0], data?.data?.content?.[0], false)
          setActiveEnvironment(data?.data?.content?.[0].identifier as string)
        }
      }
    } else if (data?.data?.content?.length === 0) {
      onEmpty()
      setActiveEnvironment('')
    }
  }, [data?.data?.content?.length, data?.data?.content?.find, selectedEnvironmentIdentifier]) // eslint-disable-line

  return {
    EnvironmentSelect: function EnvironmentSelect(props: Partial<SelectProps>) {
      return (
        <Select
          usePortal={false}
          popoverClassName={!showCreateButton ? css.hideCreateButton : ''}
          value={selectedEnvironment}
          items={selectOptions}
          name="environmentSelectEl"
          allowCreatingNewItems={allowCreatingNewItems}
          onChange={opt => {
            if (selectedEnvironment?.value !== opt.value) {
              setSelectedEnvironment(opt)
              onChange(
                opt,
                data?.data?.content?.find(env => env.identifier === opt.value) as EnvironmentResponseDTO,
                true
              )
              setActiveEnvironment(opt.value as string)
            }
          }}
          inputProps={{
            placeholder: getString(
              allowCreatingNewItems ? 'cf.onboarding.selectOrCreateEnvironment' : 'cf.shared.selectEnvironment'
            ),
            id: 'selectOrCreateEnvironmentInput',
            'aria-label': getString(
              allowCreatingNewItems ? 'cf.onboarding.selectOrCreateEnvironment' : 'cf.shared.selectEnvironment'
            )
          }}
          {...props}
        />
      )
    },
    loading,
    error,
    refetch,
    environments: data?.data?.content
  }
}
