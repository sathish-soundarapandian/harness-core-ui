/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { FormInput, Icon, Layout, SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  Error,
  Failure,
  GitBranchDetailsDTO,
  ResponseMessage,
  useGetListOfBranchesByRefConnectorV2
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '@common/components/RepositorySelect/RepositorySelect.module.scss'
import type { GetDataError } from 'restful-react'

export interface RepoBranchSelectProps {
  name?: string
  label?: string
  noLabel?: boolean
  disabled?: boolean
  connectorIdentifierRef?: string
  repoName?: string
  selectedValue?: string
  onChange?: (selected: SelectOption, options?: SelectOption[]) => void
  setErrorResponse?: React.Dispatch<React.SetStateAction<ResponseMessage[]>>
}

export const getBranchSelectOptions = (data: GitBranchDetailsDTO[] = []): SelectOption[] => {
  return data.map((branch: GitBranchDetailsDTO) => {
    return {
      label: defaultTo(branch.name, ''),
      value: defaultTo(branch.name, '')
    }
  })
}
const hasToRefetchBranches = (
  disabled: boolean,
  connectorIdentifierRef: string | undefined,
  repoName: string | undefined
) => !disabled && connectorIdentifierRef && repoName

const showRefetchButon = (
  disabled: boolean,
  connectorIdentifierRef: string | undefined,
  repoName: string | undefined,
  error: GetDataError<Failure | Error> | null
) => {
  const responseMessages = (error?.data as Error)?.responseMessages
  return (
    !disabled &&
    connectorIdentifierRef &&
    repoName &&
    ((responseMessages?.length && responseMessages?.length > 0) || !!error)
  )
}

const RepoBranchSelectV2: React.FC<RepoBranchSelectProps> = props => {
  const {
    connectorIdentifierRef,
    repoName,
    selectedValue,
    name,
    label,
    noLabel = false,
    disabled = false,
    setErrorResponse
  } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [branchSelectOptions, setBranchSelectOptions] = useState<SelectOption[]>([])

  const {
    data: response,
    error,
    loading,
    refetch
  } = useGetListOfBranchesByRefConnectorV2({
    queryParams: {
      connectorRef: connectorIdentifierRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoName,
      page: 0,
      size: 100
    },
    debounce: 500,
    lazy: true
  })

  useEffect(() => {
    if (hasToRefetchBranches(disabled, connectorIdentifierRef, repoName)) {
      setBranchSelectOptions([])
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorIdentifierRef, repoName])

  useEffect(() => {
    if (loading) {
      return
    }
    const responseMessages = (error?.data as Error)?.responseMessages

    if (response?.status === 'SUCCESS') {
      if (!isEmpty(response?.data)) {
        setBranchSelectOptions(getBranchSelectOptions(response.data?.branches))
      }
    }

    if (responseMessages) {
      setErrorResponse?.(responseMessages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <Layout.Horizontal>
      <FormInput.Select
        name={defaultTo(name, 'branch')}
        disabled={disabled || loading}
        items={branchSelectOptions}
        label={noLabel ? '' : defaultTo(label, getString('gitBranch'))}
        placeholder={loading ? getString('loading') : getString('select')}
        value={{ label: selectedValue || '', value: selectedValue || '' }}
        onChange={selected => props.onChange?.(selected, branchSelectOptions)}
        selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
      />
      {loading ? (
        <Layout.Horizontal
          spacing="small"
          flex={{ alignItems: 'flex-start' }}
          style={{ paddingTop: noLabel ? '10px' : '28px' }}
        >
          <Icon name="steps-spinner" size={18} color={Color.PRIMARY_7} />
        </Layout.Horizontal>
      ) : showRefetchButon(disabled, connectorIdentifierRef, repoName, error) ? (
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start' }} style={{ paddingTop: '22px' }}>
          <Icon
            name="refresh"
            size={16}
            color={Color.PRIMARY_7}
            background={Color.PRIMARY_1}
            padding="small"
            style={{ borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => {
              setErrorResponse?.([])
              setBranchSelectOptions([])
              refetch()
            }}
          />
        </Layout.Horizontal>
      ) : null}
    </Layout.Horizontal>
  )
}
export default RepoBranchSelectV2
