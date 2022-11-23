/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isNumeric } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { NoRecordForm } from './InputWithDynamicModalForJson.types'

export const MAX_ARRAY_LENGTH = 10000

export function validate(value: NoRecordForm, getString: UseStringsReturn['getString']): { [key: string]: string } {
  const errors: { [key: string]: string } = {}

  if (!value?.name?.trim().length) {
    errors.name = getString('cv.onboarding.selectProductScreen.validationText.name')
  }
  return errors
}

export const surroundGivenStringWithBracket = (str: string): string => {
  if (!str) {
    return ''
  }

  if (str === '*') {
    return `[*]`
  }

  if (isNumeric(str)) {
    return `[${str}]`
  }

  return `['${str}']`
}

export const wrapJsonKeysWithBrackets = (path?: string[]): string => {
  if (!path || !Array.isArray(path)) {
    return ''
  }

  const bracketAddedPathArray = path.map(currentPath => {
    return surroundGivenStringWithBracket(currentPath)
  })

  return bracketAddedPathArray.join('.')
}

export const formatJSONPath = (selectedValue: string[]): string => {
  let formattedJSONPath = ''

  // replacing the array index in the path with [*]
  if (isNumeric(selectedValue[selectedValue.length - 1])) {
    formattedJSONPath = getJSONPathIfLastElementIsNum(selectedValue)
  } else {
    formattedJSONPath = replaceAllNum(selectedValue)
  }

  return `$.${formattedJSONPath}`
}

export const getJSONPathIfLastElementIsNum = (selectedValuePathElements: string[]): string => {
  const pathElementsExceptLastNumElement = selectedValuePathElements.slice(0, selectedValuePathElements.length - 1)
  const lastNumElement = selectedValuePathElements[selectedValuePathElements.length - 1]

  const path = replaceAllNum(pathElementsExceptLastNumElement)

  return `${path}.[${lastNumElement}]`
}

export const replaceAllNum = (path: string[]): string => {
  const updatedPath = path.map(currentPath => {
    if (isNumeric(currentPath)) {
      return '*'
    }

    return currentPath
  })

  return wrapJsonKeysWithBrackets(updatedPath)
}
