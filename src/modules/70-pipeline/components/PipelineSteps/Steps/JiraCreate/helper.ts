/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { find, isEmpty, isUndefined } from 'lodash-es'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { JiraFieldNG, JiraUserData } from 'services/cd-ng'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import type { JiraCreateData, JiraCreateFieldType, JiraFieldNGWithValue } from './types'

export const resetForm = (formik: FormikProps<JiraCreateData>, parent: string): void => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.projectKey', '')
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.selectedRequiredFields', [])
    formik.setFieldValue('spec.selectedOptionalFields', [])
  }
  if (parent === 'projectKey') {
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.fields', [])
    formik.setFieldValue('spec.selectedRequiredFields', [])
    formik.setFieldValue('spec.selectedOptionalFields', [])
  }
  if (parent === 'issueType') {
    formik.setFieldValue('spec.fields', [])
    formik.setFieldValue('spec.selectedRequiredFields', [])
    formik.setFieldValue('spec.selectedOptionalFields', [])
  }
}

export const processFieldsForSubmit = (values: JiraCreateData): JiraCreateFieldType[] => {
  const toReturn: JiraCreateFieldType[] = []
  const processRequiredOptionalFields = (selectedFields: JiraFieldNGWithValue[] | undefined): void => {
    selectedFields?.forEach((field: JiraFieldNGWithValue) => {
      const name = field.name
      const value =
        typeof field.value === 'string' || typeof field.value === 'number'
          ? field.value
          : Array.isArray(field.value)
          ? (field.value as MultiSelectOption[]).map(opt => opt.value.toString()).join(',')
          : typeof field.value === 'object'
          ? (field.value as SelectOption).value?.toString()
          : ''
      // The return value should be comma separated string or a number
      toReturn.push({ name, value })
    })
  }
  processRequiredOptionalFields(values.spec?.selectedOptionalFields)
  processRequiredOptionalFields(values.spec?.selectedRequiredFields)
  values.spec.fields?.forEach((kvField: JiraCreateFieldType) => {
    const alreadyExists = toReturn.find(ff => ff.name === kvField.name)
    if (!alreadyExists) {
      toReturn.push(kvField)
    }
  })
  return toReturn
}

export const getInitialValueForSelectedField = (
  savedFields: JiraCreateFieldType[],
  field: JiraFieldNG
): string | number | SelectOption | MultiSelectOption[] => {
  const savedValue = savedFields.find(sf => sf.name === field.name)?.value
  if (typeof savedValue === 'number') {
    return savedValue as number
  } else if (typeof savedValue === 'string') {
    if (
      getMultiTypeFromValue(savedValue) === MultiTypeInputType.FIXED &&
      field.allowedValues &&
      field.schema.type === 'option'
    ) {
      if (field.schema.array) {
        // multiselect
        // return multiselectoption[]
        const splitValues = (savedValue as string).split(',')
        return splitValues.map(splitvalue => ({ label: splitvalue, value: splitvalue })) as MultiSelectOption[]
      } else {
        // singleselect
        // return selectoption
        return { label: savedValue, value: savedValue } as SelectOption
      }
    }
    return savedValue as string
  }
  return ''
}

export const processFormData = (values: JiraCreateData): JiraCreateData => {
  return {
    ...values,
    spec: {
      ...(values.spec.delegateSelectors && { delegateSelectors: values.spec.delegateSelectors }),
      connectorRef: values.spec.connectorRef,
      projectKey:
        getMultiTypeFromValue(values.spec.projectKey as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.projectKey as JiraProjectSelectOption)?.key?.toString()
          : values.spec.projectKey,
      issueType:
        getMultiTypeFromValue(values.spec.issueType as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.issueType as JiraProjectSelectOption)?.key?.toString()
          : values.spec.issueType,
      fields: processFieldsForSubmit(values)
    }
  }
}

export const getKVFields = (values: JiraCreateData): JiraCreateFieldType[] => {
  return processFieldsForSubmit(values)
}

export const processInitialValues = (values: JiraCreateData): JiraCreateData => {
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef: values.spec.connectorRef,
      projectKey:
        values.spec.projectKey && getMultiTypeFromValue(values.spec.projectKey) === MultiTypeInputType.FIXED
          ? {
              label: values.spec.projectKey.toString(),
              value: values.spec.projectKey.toString(),
              key: values.spec.projectKey.toString()
            }
          : values.spec.projectKey,
      issueType:
        values.spec.issueType && getMultiTypeFromValue(values.spec.issueType) === MultiTypeInputType.FIXED
          ? {
              label: values.spec.issueType.toString(),
              value: values.spec.issueType.toString(),
              key: values.spec.issueType.toString()
            }
          : values.spec.issueType,
      fields: values.spec.fields
    }
  }
}

export const getSelectedFieldsToBeAddedInForm = (
  newFields: JiraFieldNG[],
  existingFields: JiraFieldNGWithValue[] = [],
  existingKVFields: JiraCreateFieldType[]
): JiraFieldNGWithValue[] => {
  const toReturn: JiraFieldNGWithValue[] = []
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.name === field.name)
    const alreadyPresentKVField = existingKVFields.find(kv => kv.name === field.name)
    if (!alreadyPresent && !alreadyPresentKVField) {
      toReturn.push({ ...field, value: !isEmpty(field.allowedValues) ? [] : '' })
    } else {
      toReturn.push({
        ...field,
        value: alreadyPresent !== undefined ? alreadyPresent?.value : field.schema.array ? [] : ''
      })
    }
  })
  return toReturn
}

export const getKVFieldsToBeAddedInForm = (
  newFields: JiraCreateFieldType[],
  existingFields: JiraCreateFieldType[] = [],
  existingSelectedFields: JiraFieldNGWithValue[] = [],
  requiredSelectedFields: JiraFieldNGWithValue[] = []
): JiraCreateFieldType[] => {
  const toReturn: JiraCreateFieldType[] = [...existingFields]
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.name === field.name)
    const alreadyPresentOptionalField = existingSelectedFields.find(existing => existing.name === field.name)
    const alreadyPresentRequiredField = requiredSelectedFields.find(existing => existing.name === field.name)
    if (!alreadyPresent && !alreadyPresentOptionalField && !alreadyPresentRequiredField) {
      toReturn.push(field)
    }
  })
  return toReturn
}

export const updateMap = (alreadySelectedFields: JiraFieldNG[]): Record<string, boolean> => {
  const map: Record<string, boolean> = {}
  if (!isEmpty(alreadySelectedFields)) {
    alreadySelectedFields.forEach(field => {
      map[field.name] = true
    })
  }
  return map
}

export const isRuntimeOrExpressionType = (fieldType: MultiTypeInputType): boolean => {
  return fieldType === MultiTypeInputType.EXPRESSION || isMultiTypeRuntime(fieldType)
}

export const getUserValuesOptions = (userOptions: JiraUserData[]): MultiSelectOption[] => {
  return userOptions.map(userOption => ({
    label: userOption.emailAddress || '',
    value: userOption.emailAddress || ''
  }))
}

export const processMultiSelectTypeInputRuntimeValues = (selectedFieldValue: string | object) => {
  if (Array.isArray(selectedFieldValue)) {
    return selectedFieldValue
  } else if (typeof selectedFieldValue === 'string' && !!selectedFieldValue) {
    const splitValues = selectedFieldValue?.split(',')
    return splitValues.map(splitvalue => ({ label: splitvalue, value: splitvalue })) as MultiSelectOption[]
  }
  return []
}

export const addSelectedOptionalFields = (
  fieldsToBeAdded: JiraFieldNG[],
  formik: FormikProps<JiraCreateData>
): void => {
  const selectedFieldsToBeAddedInForm = getSelectedFieldsToBeAddedInForm(
    fieldsToBeAdded,
    formik.values.spec?.selectedOptionalFields,
    formik.values.spec?.fields
  )

  const uncheckedOptionalFields = formik.values.spec?.selectedOptionalFields?.filter(optField =>
    isUndefined(
      find(fieldsToBeAdded, function (fieldToBeAdded) {
        return fieldToBeAdded.name === optField.name
      })
    )
  )

  /* Removing unchecked optional fields from formik so that it doesn't move to key value */
  if (!isUndefined(uncheckedOptionalFields) && !isEmpty(uncheckedOptionalFields)) {
    const excludedUncheckedFields = formik.values.spec?.fields?.filter(field =>
      isUndefined(
        find(uncheckedOptionalFields, function (uncheckedField) {
          return uncheckedField.name === field.name
        })
      )
    )
    formik.setFieldValue('spec.fields', excludedUncheckedFields)
  }

  /* Sorting optional fields so that after saving template or step, fields are shown in same order */
  selectedFieldsToBeAddedInForm.sort(function (
    selectedField1: JiraFieldNGWithValue,
    selectedField2: JiraFieldNGWithValue
  ) {
    return selectedField1.name > selectedField2.name ? 1 : -1
  })
  formik.setFieldValue('spec.selectedOptionalFields', selectedFieldsToBeAddedInForm)
}
