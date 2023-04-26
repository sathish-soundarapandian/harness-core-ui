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
import { useGetProjectFlags } from 'services/cf'
import { EnvironmentResponseDTO, useGetEnvironmentListForProject } from 'services/cd-ng'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './useEnvironmentSelectV2.module.scss'

export interface UseEnvironmentSelectV2Params {
  selectedEnvironmentIdentifier?: string
  onChange?: (opt: SelectOption, environment: EnvironmentResponseDTO, userEvent: boolean) => void
  onEmpty?: () => void
  allowCreatingNewItems?: boolean
  showCreateButton?: boolean
  noDefault?: boolean
  allowAllOption?: boolean
  searchTerm?: string
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
    noDefault,
    allowAllOption,
    searchTerm
  } = params
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const {
    data: environmentList,
    loading,
    error,
    refetch
  } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })
  const [selectedEnvironment, setSelectedEnvironment] = useState<SelectOption>()
  const selectOptions: SelectOption[] =
    environmentList?.data?.content?.map<SelectOption>(elem => ({
      label: elem.name as string,
      value: elem.identifier as string
    })) || []

  const { FFM_6683_ALL_ENVIRONMENTS_FLAGS } = useFeatureFlags()

  const queryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    name: searchTerm
  }
  const {
    loading: loadingProjectFlags,
    error: getProjectFlagsError,
    data: projectFlags,
    refetch: refetchProjectFlags
  } = useGetProjectFlags({
    identifier: projectIdentifier,
    queryParams,
    lazy: true
  })

  useEffect(() => {
    if (
      selectedEnvironment?.value &&
      preferredEnvironment !== selectedEnvironment?.value &&
      selectedEnvironment?.value !== getString('common.allEnvironments')
    ) {
      setPreferredEnvironment(selectedEnvironment.value as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredEnvironment, selectedEnvironment?.value])

  useEffect(() => {
    if (environmentList?.data?.content?.length) {
      if (selectedEnvironmentIdentifier) {
        const found = environmentList?.data?.content?.find(env => env.identifier === selectedEnvironmentIdentifier)

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
            environmentList.data.content.find(
              ({ identifier }) => identifier === preferredEnvironment
            ) as EnvironmentResponseDTO,
            false
          )
          setActiveEnvironment(preferredEnvironment)
        } else {
          setSelectedEnvironment(selectOptions[0])
          onChange(selectOptions[0], environmentList?.data?.content?.[0], false)
          setActiveEnvironment(environmentList?.data?.content?.[0].identifier as string)
        }
      }
    } else if (environmentList?.data?.content?.length === 0) {
      onEmpty()
      setActiveEnvironment('')
    }
  }, [environmentList?.data?.content?.length, environmentList?.data?.content?.find, selectedEnvironmentIdentifier]) // eslint-disable-line

  return {
    EnvironmentSelect: function EnvironmentSelect(props: Partial<SelectProps>) {
      return (
        <Select
          usePortal={false}
          popoverClassName={!showCreateButton ? css.hideCreateButton : ''}
          value={selectedEnvironment}
          items={
            FFM_6683_ALL_ENVIRONMENTS_FLAGS && allowAllOption
              ? [
                  { label: getString('common.allEnvironments'), value: getString('common.allEnvironments') },
                  ...selectOptions
                ]
              : selectOptions
          }
          name="environmentSelectEl"
          allowCreatingNewItems={allowCreatingNewItems}
          onChange={opt => {
            setSelectedEnvironment(opt)
            if (opt.value === getString('common.allEnvironments')) {
              refetchProjectFlags()
              return
            }
            if (selectedEnvironment?.value !== opt.value) {
              onChange(
                opt,
                environmentList?.data?.content?.find(env => env.identifier === opt.value) as EnvironmentResponseDTO,
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
    loading: loading || loadingProjectFlags,
    error: error || getProjectFlagsError,
    refetch,
    environments: environmentList?.data?.content,
    projectFlags: selectedEnvironment?.value === getString('common.allEnvironments') ? projectFlags : null,
    refetchProjectFlags
  }
}
