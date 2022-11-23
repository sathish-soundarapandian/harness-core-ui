/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { Button, FormInput, Layout } from '@harness/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { JiraFieldNG } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setAllowedValuesOptions } from '../JiraApproval/helper'
import type { JiraFieldNGWithValue } from './types'
import { JiraUserMultiTypeInput } from './JiraUserMultiTypeInput'
import css from './JiraCreate.module.scss'

export interface JiraFieldsRendererProps {
  renderRequiredFields?: boolean
  selectedFields?: JiraFieldNGWithValue[]
  selectedRequiredFields?: JiraFieldNGWithValue[]
  readonly?: boolean
  onDelete?: (index: number, selectedField: JiraFieldNG) => void
  connectorRef?: string
}

interface MappedComponentInterface {
  renderRequiredFields?: boolean
  selectedField: JiraFieldNG
  props: JiraFieldsRendererProps
  expressions: string[]
  index: number
}

export const shouldShowTextField = (selectedField: JiraFieldNG): boolean => {
  if (
    selectedField.schema.type === 'string' ||
    selectedField.schema.type === 'date' ||
    selectedField.schema.type === 'datetime' ||
    selectedField.schema.type === 'number'
  ) {
    return true
  }
  if (isEmpty(selectedField.allowedValues) && selectedField.schema.type === 'option' && selectedField.schema.array) {
    return true
  }
  return false
}

export const shouldShowMultiSelectField = (selectedField: JiraFieldNG): boolean =>
  selectedField.allowedValues && selectedField.schema.type === 'option' && !!selectedField.schema.array

export const shouldShowMultiTypeField = (selectedField: JiraFieldNG): boolean =>
  selectedField.allowedValues && selectedField.schema.type === 'option'

export const shouldShowJiraUserField = (selectedField: JiraFieldNG): boolean => selectedField.schema.type === 'user'

function GetMappedFieldComponent({
  selectedField,
  props,
  expressions,
  index,
  renderRequiredFields
}: MappedComponentInterface): React.ReactElement | null {
  const { ALLOW_USER_TYPE_FIELDS_JIRA } = useFeatureFlags()
  const formikFieldPath = renderRequiredFields
    ? `spec.selectedRequiredFields[${index}].value`
    : `spec.selectedOptionalFields[${index}].value`

  if (shouldShowTextField(selectedField)) {
    return (
      <FormInput.MultiTextInput
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={formikFieldPath}
        placeholder={selectedField.name}
        className={css.md}
        multiTextInputProps={{
          expressions
        }}
      />
    )
  } else if (shouldShowMultiSelectField(selectedField)) {
    return (
      <FormInput.MultiSelectTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={formikFieldPath}
        placeholder={selectedField.name}
        className={cx(css.multiSelect, css.md)}
        multiSelectTypeInputProps={{
          expressions
        }}
      />
    )
  } else if (shouldShowMultiTypeField(selectedField)) {
    return (
      <FormInput.MultiTypeInput
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        name={formikFieldPath}
        placeholder={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        className={cx(css.multiSelect, css.md)}
        multiTypeInputProps={{ expressions }}
      />
    )
  } else if (ALLOW_USER_TYPE_FIELDS_JIRA && shouldShowJiraUserField(selectedField)) {
    return (
      <JiraUserMultiTypeInput
        selectedField={selectedField}
        props={props}
        expressions={expressions}
        formikFieldPath={formikFieldPath}
      />
    )
  }
  return null
}

export function JiraFieldsRenderer(props: JiraFieldsRendererProps): React.ReactElement | null {
  const { expressions } = useVariablesExpression()
  const { readonly, selectedFields, renderRequiredFields, onDelete } = props
  return selectedFields ? (
    <>
      {selectedFields?.map((selectedField: JiraFieldNG, index: number) => (
        <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
          <GetMappedFieldComponent
            selectedField={selectedField}
            props={props}
            expressions={expressions}
            renderRequiredFields={renderRequiredFields}
            index={index}
          />
          {!renderRequiredFields ? (
            <Button
              minimal
              icon="trash"
              disabled={isApprovalStepFieldDisabled(readonly)}
              data-testid={`remove-selectedField-${index}`}
              onClick={() => onDelete?.(index, selectedField)}
            />
          ) : null}
        </Layout.Horizontal>
      ))}
    </>
  ) : null
}
