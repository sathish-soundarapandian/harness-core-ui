/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Color, DropDown, Icon, Layout, SelectOption, SelectProps, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'

import type { GetDataError } from 'restful-react'
import type { PipelinePathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  Error,
  Failure,
  PMSPipelineListBranchesResponse,
  ResponsePMSPipelineListBranchesResponse,
  useGetExecutionBranchesList
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import css from './BranchFilter.module.scss'

export interface BranchFilterProps {
  name?: string
  label?: string
  noLabel?: boolean
  disabled?: boolean
  repoName?: string
  selectedValue?: string
  onChange?: (selected: SelectOption, defaultSelected?: boolean) => void // defaultSelected will be true component selected default itself
  branchSelectorClassName?: string
  selectProps?: Omit<SelectProps, 'value' | 'onChange' | 'items'>
}

const hasToRefetchBranches = (disabled: boolean, repoName: string | undefined) => !disabled && repoName

const showRefetchButon = (
  disabled: boolean,
  repoName: string | undefined,
  error: GetDataError<Failure | Error> | null
) => {
  const responseMessages = (error?.data as Error)?.responseMessages
  return !disabled && repoName && ((responseMessages?.length && responseMessages?.length > 0) || !!error)
}

export const getBranchSelectOptions = (data: PMSPipelineListBranchesResponse[] = []): SelectOption[] => {
  const selectOptions = data.map((branch: PMSPipelineListBranchesResponse) => {
    return {
      label: defaultTo(branch, ''),
      value: defaultTo(branch, '')
    }
  })

  return selectOptions as SelectOption[]
}

const responseHasBranches = (response: ResponsePMSPipelineListBranchesResponse | null): boolean =>
  response?.status === 'SUCCESS' && !isEmpty(response?.data)

const BranchFilter: React.FC<BranchFilterProps> = props => {
  const { repoName, selectedValue, disabled = false } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { pipelineIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [branchSelectOptions, setBranchSelectOptions] = useState<SelectOption[]>([])

  const {
    data: response,
    error,
    loading,
    refetch
  } = useGetExecutionBranchesList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      repoName
    },
    debounce: 500,
    lazy: true
  })

  const responseMessages = (error?.data as Error)?.responseMessages

  useEffect(() => {
    if (hasToRefetchBranches(disabled, repoName)) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoName, disabled])

  useEffect(() => {
    if (loading) {
      return
    }

    if (responseHasBranches(response)) {
      const branchOptions = getBranchSelectOptions(response?.data?.branches as PMSPipelineListBranchesResponse[])
      setBranchSelectOptions(branchOptions)
    }
  }, [loading, response, response?.data, response?.status, responseMessages])

  useEffect(() => {
    if (error) {
      showError(error?.message || getString('somethingWentWrong'))
    }
  }, [error])

  return (
    <Layout.Horizontal>
      <DropDown
        items={branchSelectOptions}
        disabled={disabled || loading}
        buttonTestId={'branch-filter'}
        value={selectedValue}
        onChange={selected => props.onChange?.(selected)}
        placeholder={getString('common.gitSync.allBranches')}
        addClearBtn={true}
        minWidth={160}
        usePortal={true}
      ></DropDown>

      {showRefetchButon(disabled, repoName, error) ? (
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start' }} className={cx(css.refreshButtonWrapper)}>
          <Icon
            name="refresh"
            size={16}
            color={Color.PRIMARY_7}
            background={Color.PRIMARY_1}
            padding="small"
            className={css.refreshIcon}
            onClick={() => {
              setBranchSelectOptions([])
              if (!loading) refetch()
            }}
          />
        </Layout.Horizontal>
      ) : null}
    </Layout.Horizontal>
  )
}
export default BranchFilter
