/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Icon, Text, SelectOption, FormInput, Formik } from '@wings-software/uicore'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { isEmpty, noop } from 'lodash-es'
import { useGetListOfBranchesByRefConnectorV2 } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getBranchSelectOptions } from '../RepoBranchSelectV2/RepoBranchSelectV2'
import type { GitFilterScope } from '../GitFilters/GitFilters'
import css from './GitRemoteDetails.module.scss'

interface GitRemoteDetailsProps {
  connectorRef?: string
  repoName?: string
  filePath?: string
  branch?: string
  onBranchChange: (selectedFilter: GitFilterScope) => void
  flags?: {
    borderless?: boolean
    showRepo?: boolean
    normalInputStyle?: boolean
    readOnly?: boolean
  }
}

const GitRemoteDetails = ({
  connectorRef,
  repoName,
  filePath,
  branch = '',
  onBranchChange,
  flags: { borderless = true, showRepo = true, normalInputStyle = false, readOnly = false } = {}
}: GitRemoteDetailsProps): React.ReactElement => {
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [branchSelectOptions, setBranchSelectOptions] = useState<SelectOption[]>([])

  const {
    data: response,
    error,
    loading,
    refetch
  } = useGetListOfBranchesByRefConnectorV2({
    queryParams: {
      connectorRef,
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      repoName,
      page: 0,
      size: 100
    },
    debounce: 500,
    lazy: true
  })

  const defaultBranch = response?.data?.defaultBranch?.name || ''
  const branchText = branch || defaultBranch

  useEffect(() => {
    connectorRef && repoName && !readOnly && refetch()
  }, [connectorRef, readOnly, refetch, repoName])

  useEffect(() => {
    if (loading || error) {
      return
    }

    if (response?.status === 'SUCCESS') {
      if (!isEmpty(response?.data)) {
        setBranchSelectOptions(
          getBranchSelectOptions(response.data?.branches).map(b =>
            b.value === defaultBranch ? { label: `${b.value} (default)`, value: b.value } : b
          )
        )
      }
    }
  }, [defaultBranch, error, loading, response?.data, response?.status])

  return (
    <div className={cx(css.wrapper, { [css.normalInputStyle]: normalInputStyle })}>
      {showRepo && (
        <>
          <Icon
            name="repository"
            size={normalInputStyle ? undefined : 14}
            margin={{
              right: 'small'
            }}
          />
          <Text
            tooltip={filePath && <Text className={css.tooltip}>{filePath}</Text>}
            tooltipProps={{
              isDark: true,
              interactionKind: PopoverInteractionKind.HOVER,
              position: Position.BOTTOM_LEFT
            }}
            lineClamp={1}
            alwaysShowTooltip
            className={css.repoDetails}
          >
            {repoName}
          </Text>
          <span className={css.separator}></span>
        </>
      )}
      <Icon
        name="git-new-branch"
        size={normalInputStyle ? undefined : 14}
        margin={{
          right: 'small'
        }}
      />
      {readOnly ? (
        <Text lineClamp={1} className={css.repoDetails}>
          {branch}
        </Text>
      ) : (
        <Formik
          onSubmit={noop}
          formName="remoteBranchSelectForm"
          initialValues={{
            remoteBranch: {
              label: branch === defaultBranch || !branch ? (branchText ? `${branchText} (default)` : '') : branch,
              value: branch
            }
          }}
        >
          <FormInput.Select
            disabled={loading}
            placeholder={loading ? 'Loading' : 'Select'}
            className={css.branchSelector}
            items={branchSelectOptions}
            name="remoteBranch"
            selectProps={{ borderless }}
            onChange={(selected: SelectOption): void => {
              onBranchChange({
                branch: selected.value as string
              })
            }}
            value={{
              label: branch === defaultBranch || !branch ? (branchText ? `${branchText} (default)` : '') : branch,
              value: branch
            }}
          />
        </Formik>
      )}
    </div>
  )
}

export default GitRemoteDetails
