/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import cx from 'classnames'
import { get, isEmpty, isNil, set } from 'lodash-es'
import {
  AllowedTypes,
  Button,
  FormError,
  FormInput,
  Label,
  Layout,
  MultiSelectTypeInput,
  MultiTypeInputType
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { JiraFieldNG } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setAllowedValuesOptions } from '../JiraApproval/helper'
import { processMultiSelectTypeInputRuntimeValues } from './helper'
import type { JiraFieldNGWithValue, JiraCreateData } from './types'
import { JiraUserMultiTypeInput } from './JiraUserMultiTypeInput'
import css from './JiraCreate.module.scss'

export interface JiraFieldsRendererProps {
  renderRequiredFields?: boolean
  selectedFields?: JiraFieldNGWithValue[]
  selectedRequiredFields?: JiraFieldNGWithValue[]
  readonly?: boolean
  onDelete?: (index: number, selectedField: JiraFieldNG) => void
  connectorRef?: string
  fieldPrefix?: string
  formik?: any
  deploymentMode?: boolean
  template?: JiraCreateData
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
    selectedField.schema.type === 'number' ||
    selectedField.schema.type === 'issuelink'
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
  const { getString } = useStrings()
  const formikFieldPath = props.fieldPrefix
    ? `${props.fieldPrefix}spec.fields[${index}].value`
    : renderRequiredFields
    ? `spec.selectedRequiredFields[${index}].value`
    : `spec.selectedOptionalFields[${index}].value`

  const allowableTypes: AllowedTypes = props.deploymentMode
    ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
    : [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]

  useEffect(() => {
    const selectedFieldName = get(props.formik?.values, `${props.fieldPrefix}spec.fields[${index}].name`)
    /* if we have issue type as runtime then required fields are added on UI in runtime form
    so we don't have names in spec for fields as expected. To add object of required fields with name and value,
     we have set value of fields using below condition */
    if (isNil(selectedFieldName)) {
      set(props.formik?.values, `${props.fieldPrefix}spec.fields[${index}].name`, selectedField.name)
    }
  }, [index, selectedField])

  if (shouldShowTextField(selectedField)) {
    return (
      <TextFieldInputSetView
        label={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        name={formikFieldPath}
        placeholder={selectedField.name}
        className={css.md}
        multiTextInputProps={{
          allowableTypes: allowableTypes,
          expressions
        }}
        fieldPath={`spec.fields[${index}].value`}
        template={props.template}
      />
    )
  } else if (shouldShowMultiSelectField(selectedField)) {
    {
      return props.deploymentMode ? (
        <div className={css.btnPosition}>
          <Label style={{ color: Color.GREY_900 }}>{selectedField?.name}</Label>
          <MultiSelectTypeInput
            width={390}
            disabled={isApprovalStepFieldDisabled(props.readonly)}
            name={formikFieldPath}
            placeholder={selectedField.name}
            className={cx(css.multiSelect, css.md, {
              [css.formError]: !isNil(get(props.formik?.errors, formikFieldPath))
            })}
            multiSelectProps={{
              items: setAllowedValuesOptions(selectedField?.allowedValues)
            }}
            expressions={expressions}
            allowableTypes={allowableTypes}
            onChange={items => {
              const valueArr = [] as string[]
              ;(items as any)?.forEach((opt: any) => {
                if (opt?.value) valueArr.push(opt?.value)
              })
              props.formik.setFieldValue(formikFieldPath, valueArr.toString())
            }}
            value={processMultiSelectTypeInputRuntimeValues(get(props.formik?.values, formikFieldPath))}
          />
          {!isNil(get(props.formik?.errors, formikFieldPath)) ? (
            <FormError
              className={css.marginTop}
              name={formikFieldPath}
              errorMessage={getString?.('pipeline.jiraApprovalStep.validations.requiredField')}
            />
          ) : null}
        </div>
      ) : (
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
    }
  } else if (shouldShowMultiTypeField(selectedField)) {
    return (
      <SelectInputSetView
        fieldPath={`spec.fields[${index}].value`}
        template={props.template}
        selectItems={setAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        name={formikFieldPath}
        placeholder={selectedField.name}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        className={cx(css.multiSelect, css.md)}
        multiTypeInputProps={{
          expressions,
          allowableTypes: allowableTypes
        }}
        useValue={!!props.deploymentMode}
      />
    )
  } else if (ALLOW_USER_TYPE_FIELDS_JIRA && shouldShowJiraUserField(selectedField)) {
    return (
      <JiraUserMultiTypeInput
        selectedField={selectedField}
        props={props}
        expressions={expressions}
        formikFieldPath={formikFieldPath}
        index={index}
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
      {selectedFields?.map((selectedField: JiraFieldNG, index: number) => {
        const checkRenderRequiredFields = props.deploymentMode ? selectedField.required : renderRequiredFields
        return (
          <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
            <GetMappedFieldComponent
              selectedField={selectedField}
              props={props}
              expressions={expressions}
              renderRequiredFields={checkRenderRequiredFields}
              index={index}
            />
            {!props.deploymentMode && !renderRequiredFields && (
              <Button
                minimal
                icon="trash"
                disabled={isApprovalStepFieldDisabled(readonly)}
                data-testid={`remove-selectedField-${index}`}
                onClick={() => onDelete?.(index, selectedField)}
              />
            )}
          </Layout.Horizontal>
        )
      })}
    </>
  ) : null
}
