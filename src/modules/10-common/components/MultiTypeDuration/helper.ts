/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import {
  DurationInputHelpers,
  getMultiTypeFromValue,
  MultiTypeInputType,
  parseStringToTime,
  timeToDisplayText
} from '@wings-software/uicore'

export interface GetDurationValidationSchemaProps {
  minimum?: string
  maximum?: string
  inValidSyntaxMessage?: string
  minimumErrorMessage?: string
  maximumErrorMessage?: string
}

export function isValidTimeString(value: string): boolean {
  return !DurationInputHelpers.UNIT_LESS_REGEX.test(value) && DurationInputHelpers.VALID_SYNTAX_REGEX.test(value)
}

export function getDurationValidationSchema(
  props: GetDurationValidationSchemaProps = {}
): Yup.StringSchema<string | undefined> {
  const { minimum = '1s', maximum = '53w' } = props

  if (typeof minimum === 'string' && !isValidTimeString(minimum)) {
    throw new Error(`Invalid format "${minimum}" provided for minimum value`)
  }

  if (typeof maximum === 'string' && !isValidTimeString(maximum)) {
    throw new Error(`Invalid format "${maximum}" provided for maximum value`)
  }

  return Yup.string().test({
    test(value: string): boolean | Yup.ValidationError {
      const { inValidSyntaxMessage, maximumErrorMessage, minimumErrorMessage } = props

      if (!value) return true

      if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
        return true
      }

      if (typeof value === 'string' && !isValidTimeString(value)) {
        return this.createError({ message: inValidSyntaxMessage || 'Invalid syntax provided' })
      }

      if (typeof minimum === 'string') {
        const minTime = parseStringToTime(minimum)
        const time = parseStringToTime(value)

        if (time < minTime) {
          return this.createError({
            message: minimumErrorMessage || `Value must be greater than or equal to "${timeToDisplayText(minTime)}"`
          })
        }
      }

      if (typeof maximum === 'string') {
        const maxTime = parseStringToTime(maximum)
        const time = parseStringToTime(value)

        if (time > maxTime) {
          return this.createError({
            message: maximumErrorMessage || `Value must be less than or equal to "${timeToDisplayText(maxTime)}"`
          })
        }
      }

      return true
    }
  })
}
