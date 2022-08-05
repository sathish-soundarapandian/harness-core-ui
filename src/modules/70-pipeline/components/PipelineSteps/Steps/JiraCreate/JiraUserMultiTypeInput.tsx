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
import { JiraFieldNG, useJiraUserSearch } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setUserValuesOptions } from '../JiraApproval/helper'
import type { JiraFieldsRendererProps } from './JiraFieldsRenderer'
import css from './JiraCreate.module.scss'

interface JiraUserProps {
  selectedField: JiraFieldNG
  props: JiraFieldsRendererProps
  expressions: string[]
  formikFieldPath: string
}

export function JiraUserMultiTypeInput({ selectedField, props, expressions, formikFieldPath }: JiraUserProps) {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()

  const { data: userData, loading: fetchUsers } = useJiraUserSearch({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      userQuery: '',
      connectorIdentifier: props.connectorRef,
      offset: '0'
    }
  })

  return (
    <FormInput.MultiTypeInput
      selectItems={
        /* istanbul ignore next */ fetchUsers
          ? [{ label: getString('loading'), value: '' }]
          : setUserValuesOptions(defaultTo(userData?.data, []))
      }
      label={selectedField.name}
      name={formikFieldPath}
      useValue
      placeholder={/* istanbul ignore next */ fetchUsers ? getString('loading') : selectedField.name}
      disabled={isApprovalStepFieldDisabled(props.readonly) || fetchUsers}
      className={cx(css.multiSelect, css.md)}
      multiTypeInputProps={{ expressions }}
    />
  )
}
