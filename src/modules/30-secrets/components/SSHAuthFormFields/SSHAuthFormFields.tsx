/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Layout, Text, SelectOption, DropDown } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { SSHConfigFormData } from '@secrets/modals/CreateSSHCredModal/views/StepAuthentication'
import { AuthScheme, SecretType, CredentialTypes, TgtGenerationMethod } from './SSHAuthUtils'

interface SSHAuthFormFieldsProps {
  formik: FormikProps<SSHConfigFormData>
  secretName?: string
  editing?: boolean
}

const SSHAuthFormFields: React.FC<SSHAuthFormFieldsProps> = props => {
  const { getString } = useStrings()
  const { formik } = props

  const isSSHKeyReference = React.useMemo(() => {
    return formik.values.credentialType === CredentialTypes.KEY_REFERENCE
  }, [formik.values.credentialType])

  const referenceType = isSSHKeyReference ? SecretType.SECRET_FILE : SecretType.SECRET_TEXT

  const credentialTypeOptions: SelectOption[] = [
    {
      label: getString('secrets.sshAuthFormFields.optionKey'),
      value: CredentialTypes.KEY_REFERENCE
    },
    {
      label: getString('secrets.sshAuthFormFields.optionKeypath'),
      value: CredentialTypes.KEY_PATH
    },
    {
      label: getString('secrets.sshAuthFormFields.optionPassword'),
      value: CredentialTypes.PASSWORD
    }
  ]

  const authSchemeOptions: IOptionProps[] = [
    {
      label: getString('SSH_KEY'),
      value: AuthScheme.SSH
    },
    {
      label: getString('kerberos'),
      value: AuthScheme.KERBEROS
    }
  ]

  const tgtGenerationMethodOptions: IOptionProps[] = [
    {
      label: getString('secrets.sshAuthFormFields.labelKeyTab'),
      value: TgtGenerationMethod.KEY_TAB_FILE_PATH
    },
    {
      label: getString('password'),
      value: TgtGenerationMethod.PASSWORD
    },
    {
      label: getString('secrets.sshAuthFormFields.optionKerbNone'),
      value: TgtGenerationMethod.NONE
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
      {formik.values.authScheme === AuthScheme.SSH ? (
        <>
          <Layout.Horizontal margin={{ bottom: 'medium' }} flex>
            <Text icon="lock" style={{ flex: 1 }}>
              {getString('authentication')}
            </Text>
            <DropDown
              items={credentialTypeOptions}
              value={formik.values.credentialType}
              isLabel={true}
              filterable={false}
              minWidth="unset"
              onChange={item => {
                formik.setFieldValue('credentialType', item.value)
              }}
            />
          </Layout.Horizontal>
          <FormInput.Text name="userName" label={getString('username')} />
          {formik.values.credentialType === CredentialTypes.KEY_REFERENCE ? (
            <>
              <SecretInput
                name="key"
                label={getString('secrets.sshAuthFormFields.labelFile')}
                isMultiTypeSelect={!isSSHKeyReference}
                type={referenceType}
              />
              <SecretInput
                name={'encryptedPassphrase'}
                label={getString('secrets.sshAuthFormFields.labelPassphrase')}
              />
            </>
          ) : null}
          {formik.values.credentialType === CredentialTypes.KEY_PATH ? (
            <>
              <FormInput.Text name="keyPath" label={getString('secrets.sshAuthFormFields.labelKeyFilePath')} />
              <SecretInput
                name={'encryptedPassphrase'}
                label={getString('secrets.sshAuthFormFields.labelPassphrase')}
              />
            </>
          ) : null}
          {formik.values.credentialType === CredentialTypes.PASSWORD ? (
            <SecretInput name={'password'} label={getString('password')} />
          ) : null}
          <FormInput.Text name="port" label={getString('secrets.sshAuthFormFields.labelSSHPort')} />
        </>
      ) : null}
      {formik.values.authScheme === AuthScheme.KERBEROS ? (
        <>
          <FormInput.Text name="principal" label={getString('secrets.sshAuthFormFields.labelPrincipal')} />
          <FormInput.Text name="realm" label={getString('secrets.sshAuthFormFields.labelRealm')} />
          <FormInput.Text name="port" label={getString('secrets.sshAuthFormFields.labelSSHPort')} />
          <FormInput.RadioGroup
            name="tgtGenerationMethod"
            label={getString('secrets.sshAuthFormFields.labelTGT')}
            items={tgtGenerationMethodOptions}
            radioGroup={{ inline: true }}
          />
          {formik.values.tgtGenerationMethod === TgtGenerationMethod.KEY_TAB_FILE_PATH ? (
            <FormInput.Text name="keyPath" label={getString('secrets.sshAuthFormFields.labelKeyTab')} />
          ) : null}
          {formik.values.tgtGenerationMethod === TgtGenerationMethod.PASSWORD ? (
            <SecretInput name={'password'} label={getString('password')} />
          ) : null}
        </>
      ) : null}
    </>
  )
}

export default SSHAuthFormFields
