/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { FormInput, Layout, Text, Button, ButtonVariation, FormError } from '@harness/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { FormikProps, FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import type { WinRmCommandParameter } from 'services/cd-ng'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { WinRmConfigFormData } from '@secrets/modals/CreateWinRmCredModal/views/StepAuthentication'

import css from './WinRmAuthFormFields.module.scss'

interface WinRmAuthFormFieldsProps {
  formik: FormikProps<WinRmConfigFormData>
  secretName?: string
  editing?: boolean
}

const WinRmAuthFormFields: React.FC<WinRmAuthFormFieldsProps> = props => {
  const { getString } = useStrings()
  const { formik } = props

  const authSchemeOptions: IOptionProps[] = [
    {
      label: getString('secrets.winRmAuthFormFields.ntlm'),
      value: 'NTLM'
    },
    {
      label: getString('kerberos'),
      value: 'Kerberos'
    }
  ]

  const tgtGenerationMethodOptions: IOptionProps[] = [
    {
      label: getString('secrets.sshAuthFormFields.labelKeyTab'),
      value: 'KeyTabFilePath'
    },
    {
      label: getString('password'),
      value: 'Password'
    }
  ]

  return (
    <>
      <FormInput.RadioGroup
        name="authScheme"
        label={getString('secrets.sshAuthFormFields.labelType')}
        items={authSchemeOptions}
        radioGroup={{ inline: true }}
      />

      {formik.values.authScheme === 'NTLM' ? (
        <>
          <Layout.Horizontal margin={{ bottom: 'medium' }} flex>
            <Text icon="lock" style={{ flex: 1 }}>
              {getString('authentication')}
            </Text>
          </Layout.Horizontal>
          <FormInput.Text name="domain" label={getString('secrets.winRmAuthFormFields.domain')} />
          <FormInput.Text name="username" label={getString('username')} />
          <SecretInput name={'password'} label={getString('password')} />
          <Layout.Horizontal margin={{ bottom: 'medium' }} flex>
            <FormInput.CheckBox
              name="useSSL"
              label={getString('common.useSSL')}
              onChange={event => {
                event.currentTarget.checked ? formik.setFieldValue('port', 5986) : formik.setFieldValue('port', 5985)
              }}
            />
            <FormInput.CheckBox name="skipCertChecks" label={getString('secrets.winRmAuthFormFields.skipCertCheck')} />
            <FormInput.CheckBox name="useNoProfile" label={getString('secrets.winRmAuthFormFields.useNoProfile')} />
          </Layout.Horizontal>
          <FormInput.Text name="port" label={getString('secrets.winRmAuthFormFields.labelWinRmPort')} />
        </>
      ) : null}
      {formik.values.authScheme === 'Kerberos' ? (
        <>
          <FormInput.Text name="principal" label={getString('secrets.sshAuthFormFields.labelPrincipal')} />
          <FormInput.Text name="realm" label={getString('secrets.sshAuthFormFields.labelRealm')} />
          <Layout.Horizontal margin={{ bottom: 'medium' }} flex>
            <FormInput.CheckBox
              name="useSSL"
              label={getString('common.useSSL')}
              onChange={event => {
                event.currentTarget.checked ? formik.setFieldValue('port', 5986) : formik.setFieldValue('port', 5985)
              }}
            />
            <FormInput.CheckBox name="skipCertChecks" label={getString('secrets.winRmAuthFormFields.skipCertCheck')} />
            <FormInput.CheckBox name="useNoProfile" label={getString('secrets.winRmAuthFormFields.useNoProfile')} />
          </Layout.Horizontal>
          <FormInput.Text name="port" label={getString('secrets.winRmAuthFormFields.labelWinRmPort')} />
          <FormInput.RadioGroup
            name="tgtGenerationMethod"
            label={getString('secrets.sshAuthFormFields.labelTGT')}
            items={tgtGenerationMethodOptions}
            radioGroup={{ inline: true }}
          />
          {formik.values.tgtGenerationMethod === 'KeyTabFilePath' ? (
            <FormInput.Text name="keyPath" label={getString('secrets.sshAuthFormFields.labelKeyTab')} />
          ) : null}
          {formik.values.tgtGenerationMethod === 'Password' ? (
            <SecretInput name={'password'} label={getString('password')} />
          ) : null}
        </>
      ) : null}
      <FieldArray
        name="parameters"
        data-testid="phases-field"
        render={({ push, remove }) => {
          return (
            <>
              {Array.isArray(formik.values.parameters) &&
                formik.values.parameters.map((field: WinRmCommandParameter, index: number) => {
                  return (
                    <Layout.Vertical key={`${index}`}>
                      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <FormInput.Text
                          name={`parameters[${index}].parameter`}
                          label={`${getString('secrets.winRmAuthFormFields.parameterName')}`}
                        />
                        <FormInput.Text
                          name={`parameters[${index}].value`}
                          label={`${getString('secrets.winRmAuthFormFields.optionalValue')}`}
                          className={css.paramValueField}
                          data-testid={`param-${Object.keys(field)[0]}${index}`}
                        />
                        <Button
                          icon="main-trash"
                          iconProps={{ size: 20 }}
                          minimal
                          data-testid={`remove-parameters-[${index}]`}
                          onClick={() => remove(index)}
                        />
                      </Layout.Horizontal>
                      {get(formik?.errors, `parameters[${index}]`) ? (
                        <>
                          <FormError
                            name={`paramaters[${index}]`}
                            errorMessage={get(formik?.errors, `parameters[${index}]`)}
                          />
                        </>
                      ) : null}
                    </Layout.Vertical>
                  )
                })}
              <Button
                variation={ButtonVariation.LINK}
                /* eslint-disable strings-restrict-modules */
                text={getString('connectors.addParameter')}
                margin={{ bottom: 'small' }}
                icon="plus"
                onClick={() => {
                  push({ parameter: '', value: '' })
                }}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default WinRmAuthFormFields
