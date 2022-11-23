/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as yup from 'yup'
import { Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { PasswordStrengthPolicy } from 'services/cd-ng'
import {
  SPECIAL_CHAR_RGX,
  UPPERCASE_RGX,
  LOWERCASE_RGX,
  DIGIT_RGX,
  MIN_NUMBER_OF_CHARACTERS,
  MAX_NUMBER_OF_CHARACTERS
} from '@common/constants/Utils'

interface Props {
  value: string
  passwordStrengthPolicy: PasswordStrengthPolicy
}

interface Checklist {
  title: string
  isValid: boolean
}

type PasswordStrengthKeys = keyof Omit<PasswordStrengthPolicy, 'enabled'>

const PasswordChecklist: React.FC<Props> = ({ value, passwordStrengthPolicy }) => {
  const { getString } = useStrings()
  const {
    minNumberOfCharacters = MIN_NUMBER_OF_CHARACTERS,
    minNumberOfUppercaseCharacters = 0,
    minNumberOfLowercaseCharacters = 0,
    minNumberOfDigits = 0,
    minNumberOfSpecialCharacters = 0
  } = passwordStrengthPolicy

  const schema = yup.object().shape({
    minNumberOfCharacters: yup.string().min(minNumberOfCharacters).max(MAX_NUMBER_OF_CHARACTERS),
    minNumberOfUppercaseCharacters: yup.string().matches(UPPERCASE_RGX(minNumberOfUppercaseCharacters)),
    minNumberOfLowercaseCharacters: yup.string().matches(LOWERCASE_RGX(minNumberOfLowercaseCharacters)),
    minNumberOfDigits: yup.string().matches(DIGIT_RGX(minNumberOfDigits)),
    minNumberOfSpecialCharacters: yup.string().matches(SPECIAL_CHAR_RGX(minNumberOfSpecialCharacters))
  })

  const titles = {
    minNumberOfCharacters: `${minNumberOfCharacters}-${MAX_NUMBER_OF_CHARACTERS} ${getString('characters')}`,
    minNumberOfUppercaseCharacters: `${minNumberOfUppercaseCharacters} ${getString('uppercase')}`,
    minNumberOfLowercaseCharacters: `${minNumberOfLowercaseCharacters} ${getString('lowercase')}`,
    minNumberOfDigits: `${minNumberOfDigits} ${getString('number')}`,
    minNumberOfSpecialCharacters: `${minNumberOfSpecialCharacters} ${getString('specialChar')}`
  }

  const checkList: Array<Checklist> = Object.keys(passwordStrengthPolicy)
    .filter(key => key !== 'enabled' && passwordStrengthPolicy[key as PasswordStrengthKeys])
    .map(key => ({
      title: titles[key as PasswordStrengthKeys],
      isValid: schema.isValidSync({
        [key]: value
      })
    }))

  return (
    <Layout.Vertical>
      {checkList.map(item => (
        <Text
          icon="execution-success"
          intent={item.isValid ? 'success' : 'none'}
          iconProps={{ size: 11 }}
          key={item.title}
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.GREY_400}
        >
          {item.title}
        </Text>
      ))}
    </Layout.Vertical>
  )
}

export default PasswordChecklist
