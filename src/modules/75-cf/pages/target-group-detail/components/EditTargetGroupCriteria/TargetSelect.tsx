/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FC, ReactNode} from 'react';
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@harness/uicore';
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { UseGetAllTargetsProps } from 'services/cf';
import { useGetAllTargets } from 'services/cf'
import targetToSelectOption from '@cf/utils/targetToSelectOption'

import css from './TargetSelect.module.scss'

export interface TargetSelectProps {
  environmentIdentifier: string
  fieldName: string
  label: ReactNode
}

const TargetSelect: FC<TargetSelectProps> = ({ environmentIdentifier, fieldName, label }) => {
  const { getString } = useStrings()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const queryParams: UseGetAllTargetsProps['queryParams'] = {
    environmentIdentifier,
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    pageSize: 100,
    sortByField: 'name'
  }

  const { data: targets, refetch: refetchTargets } = useGetAllTargets({
    queryParams,
    debounce: 300
  })

  const targetOptions = useMemo<SelectOption[]>(
    () => (targets?.targets || []).map(targetToSelectOption),
    [targets?.targets]
  )

  return (
    <FormInput.MultiSelect
      name={fieldName}
      label={label}
      className={css.input}
      items={targetOptions}
      usePortal
      multiSelectProps={{
        allowCreatingNewItems: false,
        placeholder: getString('cf.segmentDetail.searchTarget'),
        onQueryChange: async query => await refetchTargets({ queryParams: { ...queryParams, targetName: query } })
      }}
    />
  )
}

export default TargetSelect
