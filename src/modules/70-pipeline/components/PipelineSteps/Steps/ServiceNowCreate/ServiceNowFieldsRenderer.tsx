/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'
import { isEmpty, isNull, isUndefined } from 'lodash-es'
import { Button, FormInput, Layout, AllowedTypes } from '@harness/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components'
import type { ServiceNowFieldNG } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setServiceNowFieldAllowedValuesOptions } from './helper'
import type { ServiceNowFieldNGWithValue } from './types'
import css from './ServiceNowCreate.module.scss'

export interface ServiceNowFieldsRendererProps {
  selectedFields?: ServiceNowFieldNGWithValue[]
  readonly?: boolean
  onDelete?: (index: number, selectedField: ServiceNowFieldNG) => void
  allowableTypes: AllowedTypes
}

interface MappedComponentInterface {
  selectedField: ServiceNowFieldNG
  props: ServiceNowFieldsRendererProps
  expressions: string[]
  index: number
}
// TODO: Going forward this should be governed by metadata returned by BE API once it's available
export const EXPANDABLE_INPUT_SUPPORTED_FIELDS = new Set(['work_notes', 'work_notes_list'])

export const TEXT_INPUT_SUPPORTED_FIELD_TYPES = new Set(['string', 'glide_date_time', 'integer', 'boolean', 'unknown'])

function GetMappedFieldComponent({ selectedField, props, expressions, index }: MappedComponentInterface) {
  const showTextField = useCallback(() => {
    if (
      isNull(selectedField.schema) ||
      isUndefined(selectedField.schema) ||
      TEXT_INPUT_SUPPORTED_FIELD_TYPES.has(selectedField.schema.type)
    ) {
      return true
    }
    if (isEmpty(selectedField.allowedValues) && selectedField.schema.type === 'option' && selectedField.schema.array) {
      return true
    }
    return false
  }, [selectedField])

  const showMultiTypeField = useCallback(() => {
    return selectedField.allowedValues && selectedField.schema?.type === 'option'
  }, [selectedField])

  const showExpandableTextField = () => EXPANDABLE_INPUT_SUPPORTED_FIELDS.has(selectedField.key)

  if (showMultiTypeField()) {
    return (
      <FormInput.MultiTypeInput
        selectItems={setServiceNowFieldAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        className={cx(css.multiSelect, css.md)}
        multiTypeInputProps={{ allowableTypes: props.allowableTypes, expressions }}
      />
    )
  } else if (showExpandableTextField()) {
    return (
      <FormMultiTypeTextAreaField
        label={selectedField.name}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes: props.allowableTypes }}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        className={css.md}
      />
    )
  } else if (showTextField()) {
    return (
      <FormInput.MultiTextInput
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        className={css.deploymentViewMedium}
        multiTextInputProps={{
          allowableTypes: props.allowableTypes,
          expressions
        }}
      />
    )
  }
  return null
}

export function ServiceNowFieldsRenderer(props: ServiceNowFieldsRendererProps) {
  const { expressions } = useVariablesExpression()
  const { readonly, selectedFields, onDelete } = props
  return selectedFields ? (
    <>
      {selectedFields?.map((selectedField: ServiceNowFieldNG, index: number) => (
        <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
          <GetMappedFieldComponent
            selectedField={selectedField}
            props={props}
            expressions={expressions}
            index={index}
          />

          <Button
            minimal
            icon="trash"
            disabled={isApprovalStepFieldDisabled(readonly)}
            data-testid={`remove-selectedField-${index}`}
            onClick={() => onDelete?.(index, selectedField)}
          />
        </Layout.Horizontal>
      ))}
    </>
  ) : null
}
