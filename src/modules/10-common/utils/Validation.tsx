/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import {
  illegalIdentifiers,
  regexEmail,
  regexIdentifier,
  regexName,
  regexVersionLabel
} from '@common/utils/StringUtils'

const MAX_VERSION_LABEL_LENGTH = 63

interface EmailProps {
  allowMultiple?: boolean
  emailSeparator?: string
}

export interface NameIdDescriptionTagsType {
  identifier: string
  name: string
  description?: string
  tags?: {
    [key: string]: string
  }
}

export function NameSchemaWithoutHook(
  getString: UseStringsReturn['getString'],
  config?: { requiredErrorMsg?: string }
): Yup.Schema<string> {
  return Yup.string()
    .trim()
    .required(config?.requiredErrorMsg ? config?.requiredErrorMsg : getString('common.validation.nameIsRequired'))
    .matches(regexName, getString('common.validation.namePatternIsNotValid'))
}

export function NameSchema(
  getString: UseStringsReturn['getString'],
  config?: { requiredErrorMsg?: string }
): Yup.Schema<string> {
  return NameSchemaWithoutHook(getString, config)
}

export function IdentifierSchemaWithOutName(
  getString: UseStringsReturn['getString'],
  config?: { requiredErrorMsg?: string; regexErrorMsg?: string }
): Yup.Schema<string | undefined> {
  return Yup.string()
    .matches(regexIdentifier, config?.regexErrorMsg ? config?.regexErrorMsg : getString('validation.validIdRegex'))
    .required(config?.requiredErrorMsg ? config?.requiredErrorMsg : getString('validation.identifierRequired'))
    .notOneOf(
      illegalIdentifiers,
      getString('common.invalidIdentifiers', { identifiers: illegalIdentifiers.join(', ') })
    )
}

export function IdentifierSchemaWithoutHook(
  getString: UseStringsReturn['getString'],
  config?: { requiredErrorMsg?: string; regexErrorMsg?: string }
): Yup.Schema<string | undefined> {
  return Yup.string().when('name', {
    is: val => val?.length,
    then: IdentifierSchemaWithOutName(getString, config)
  })
}

export function IdentifierSchema(
  getString: UseStringsReturn['getString'],
  config?: {
    requiredErrorMsg?: string
    regexErrorMsg?: string
  }
): Yup.Schema<string | undefined> {
  return IdentifierSchemaWithoutHook(getString, config)
}

export function EmailSchema(getString: UseStringsReturn['getString'], emailProps: EmailProps = {}): Yup.Schema<string> {
  if (emailProps.allowMultiple)
    return Yup.string()
      .trim()
      .required(getString('common.validation.email.required'))
      .test(
        'email',
        getString('common.validation.email.format'),
        value =>
          value &&
          value.split(emailProps.emailSeparator).every((emailString: string) => {
            const emailStringTrim = emailString.trim()
            return emailStringTrim ? Yup.string().email().isValidSync(emailStringTrim) : false
          })
      )

  return Yup.string()
    .trim()
    .required(getString('common.validation.email.required'))
    .email(getString('common.validation.email.format'))
}
export function EmailSchemaWithoutRequired(
  getString: UseStringsReturn['getString'],
  emailProps: EmailProps = {}
): Yup.Schema<string | undefined> {
  if (emailProps.allowMultiple)
    return Yup.string()
      .trim()
      .test('email', getString('common.validation.email.format'), value =>
        value
          ? value.split(emailProps.emailSeparator).every((emailString: string) => {
              const emailStringTrim = emailString.trim()
              return emailStringTrim ? Yup.string().email().isValidSync(emailStringTrim) : false
            })
          : true
      )

  return Yup.string().trim().email(getString('common.validation.email.format'))
}

export function URLValidationSchema(
  getString: UseStringsReturn['getString'],
  { urlMessage, requiredMessage } = {} as { urlMessage?: string; requiredMessage?: string }
): Yup.Schema<string | undefined> {
  return Yup.string()
    .trim()
    .required(requiredMessage ?? getString('common.validation.urlIsRequired'))
    .url(urlMessage ?? getString('validation.urlIsNotValid'))
}
export function URLValidationSchemaWithoutRequired(
  getString: UseStringsReturn['getString']
): Yup.Schema<string | undefined> {
  return Yup.string().trim().url(getString('validation.urlIsNotValid'))
}

export const isEmail = (email: string): boolean => {
  return regexEmail.test(String(email).toLowerCase())
}

export const ConnectorRefSchema = (
  getString: UseStringsReturn['getString'],
  config?: { requiredErrorMsg?: string }
): Yup.MixedSchema => {
  return Yup.mixed().required(
    config?.requiredErrorMsg ? config?.requiredErrorMsg : getString('pipelineSteps.build.create.connectorRequiredError')
  )
}

export function TemplateVersionLabelSchema(getString: UseStringsReturn['getString']): Yup.Schema<string> {
  const versionLabelText = getString('common.versionLabel')
  return Yup.string()
    .trim()
    .required(
      getString('common.validation.fieldIsRequired', {
        name: versionLabelText
      })
    )
    .matches(
      regexVersionLabel,
      getString('common.validation.fieldMustStartWithAlphanumericAndCanNotHaveSpace', {
        name: versionLabelText
      })
    )
    .max(
      MAX_VERSION_LABEL_LENGTH,
      getString('common.validation.fieldCannotbeLongerThanN', {
        name: versionLabelText,
        n: MAX_VERSION_LABEL_LENGTH
      })
    )
}

export const VariableSchema = (
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<
  | {
      name: string
      value: string
      type: string
    }
  | undefined
> => {
  return Yup.array().of(
    Yup.object({
      name: Yup.string().required(getString('common.validation.nameIsRequired')),
      value: Yup.string().required(getString('common.validation.valueIsRequired')),
      type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
    })
  )
}

export const VariableSchemaWithoutHook = (
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<
  | {
      name: string
      value: string
      type: string
    }
  | undefined
> => {
  return Yup.array().of(
    Yup.object({
      name: Yup.string().required(getString('common.validation.nameIsRequired')),
      value: Yup.string().required(getString('common.validation.valueIsRequired')),
      type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
    })
  )
}

const digitsOnly = (value: string): boolean => /^\d+$/.test(value)

export const getNumberFieldValidationSchema = (
  getString: (key: StringKeys, vars?: Record<string, any> | undefined) => string
): Yup.StringSchema<string | undefined> => {
  return Yup.string().test('Digits only', getString('common.validation.onlyDigitsAllowed'), digitsOnly)
}

export const NameIdentifierSchema = (
  getString: UseStringsReturn['getString'],
  config?: { nameRequiredErrorMsg?: string; identifierRequiredErrorMsg?: string; identifierRegexErrorMsg?: string }
): Yup.ObjectSchema => {
  return Yup.object().shape({
    name: NameSchema(getString, { requiredErrorMsg: config?.nameRequiredErrorMsg }),
    identifier: IdentifierSchema(getString, {
      requiredErrorMsg: config?.identifierRequiredErrorMsg,
      regexErrorMsg: config?.identifierRegexErrorMsg
    })
  })
}
