/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FieldArray, FormikProps } from 'formik'
import { AllowedTypes, Button, FormInput, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import type {
  JiraCreateData,
  JiraCreateFieldType,
  JiraFieldNGWithValue
} from '@pipeline/components/PipelineSteps/Steps/JiraCreate/types'
import { isApprovalStepFieldDisabled } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import type { JiraUpdateData, JiraUpdateFieldType } from '@pipeline/components/PipelineSteps/Steps/JiraUpdate/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isMultiTypeRuntime } from '@common/utils/utils'
import css from '@pipeline/components/PipelineSteps/Steps/JiraCreate/JiraCreate.module.scss'

export interface JiraKVFieldsRendererProps<T = JiraCreateData | JiraUpdateData> {
  selectedAllFields?: JiraCreateFieldType[] | JiraUpdateFieldType[]
  selectedRequiredFields?: JiraFieldNGWithValue[]
  selectedOptionalFields?: JiraFieldNGWithValue[]
  formik: FormikProps<T>
  allowableTypes: AllowedTypes
  readonly?: boolean
}

export function JiraKVFieldsRenderer<T = JiraCreateData | JiraUpdateData>(
  props: JiraKVFieldsRendererProps<T>
): React.ReactElement | null {
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const {
    formik,
    allowableTypes,
    readonly,
    selectedAllFields = [],
    selectedOptionalFields,
    selectedRequiredFields
  } = props
  return !isEmpty(selectedAllFields) ? (
    <FieldArray
      name="spec.fields"
      render={({ remove }) => {
        const idxArray: number[] = []
        /* istanbul ignore next */
        const handleRemove = (kVIndex: number, currIndex: number): void => {
          const _fields = selectedAllFields.filter((_unused, idx: number) => idx !== currIndex)
          remove(kVIndex)
          formik.setFieldValue('spec.fields', _fields)
        }

        /* Filtering only key value fields from required and optional fields */
        const kVFields = defaultTo(
          selectedAllFields.filter((field, idx) => {
            const isKVField =
              !defaultTo(selectedRequiredFields, []).some(
                /* istanbul ignore next */ reqfield => reqfield?.name === field?.name
              ) &&
              !defaultTo(selectedOptionalFields, []).some(
                /* istanbul ignore next */ optfield => optfield?.name === field?.name
              )
            /* istanbul ignore else */
            if (isKVField) idxArray.push(idx)
            return isKVField
          }),
          []
        )

        return (
          <div>
            {kVFields && kVFields.length > 0 && (
              <div className={css.headerRow}>
                <String className={css.label} stringID="keyLabel" />
                <String className={css.label} stringID="valueLabel" />
              </div>
            )}
            {kVFields.map((_unused: JiraCreateFieldType, i: number) => (
              <div className={css.headerRow} key={i}>
                <FormInput.Text
                  name={`spec.fields[${idxArray[i]}].name`}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                  placeholder={getString('pipeline.keyPlaceholder')}
                />
                <FormInput.MultiTextInput
                  name={`spec.fields[${idxArray[i]}].value`}
                  label=""
                  placeholder={getString('common.valuePlaceholder')}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                  multiTextInputProps={{
                    allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                      item => !isMultiTypeRuntime(item)
                    ) as AllowedTypes,
                    expressions
                  }}
                />
                <Button
                  minimal
                  icon="trash"
                  disabled={isApprovalStepFieldDisabled(readonly)}
                  data-testid={`remove-fieldList-${i}`}
                  onClick={/* istanbul ignore next */ () => handleRemove(i, idxArray[i])}
                />
              </div>
            ))}
          </div>
        )
      }}
    />
  ) : /* istanbul ignore next */ null
}
