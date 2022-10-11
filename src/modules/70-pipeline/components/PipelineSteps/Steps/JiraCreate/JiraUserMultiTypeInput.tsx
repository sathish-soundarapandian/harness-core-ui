/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useJiraUserSearch } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import type { JiraFieldsRendererProps } from './JiraFieldsRenderer'
import { getUserValuesOptions } from './helper'
import css from './JiraCreate.module.scss'

interface JiraUserProps {
  selectedField: any
  props: JiraFieldsRendererProps
  expressions: string[]
  formikFieldPath: string
}

export function JiraUserMultiTypeInput({ selectedField, props, expressions, formikFieldPath }: JiraUserProps) {
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = React.useState<string>(defaultTo(selectedField.value, ''))
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { data: userData, loading: fetchUsers } = useJiraUserSearch({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      userQuery: searchTerm,
      connectorIdentifier: props.connectorRef,
      offset: ''
    },
    debounce: 500
  })
  const handleQueryChange = (query: string) => {
    /* istanbul ignore next */
    return setSearchTerm(query)
  }
  return (
    <FormInput.MultiTypeInput
      selectItems={
        /* istanbul ignore next */ fetchUsers
          ? [{ label: getString('loading'), value: '' }]
          : getUserValuesOptions(defaultTo(userData?.data, []))
      }
      label={selectedField.name}
      name={formikFieldPath}
      useValue
      placeholder={/* istanbul ignore next */ fetchUsers ? getString('loading') : selectedField.label}
      disabled={isApprovalStepFieldDisabled(props.readonly) || fetchUsers}
      className={cx(css.multiSelect, css.md)}
      multiTypeInputProps={{
        expressions,
        selectProps: {
          items: getUserValuesOptions(defaultTo(userData?.data, [])),
          onQueryChange: handleQueryChange,
          resetOnSelect: false,
          loadingItems: fetchUsers
        }
      }}
    />
  )
}
