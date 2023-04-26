/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Container, FormInput, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import TextReference, { ValueType } from '@secrets/components/TextReference/TextReference'
import { AuthTypes } from '@user-profile/utils/utils'
import type { SCMData } from './SourceCodeManagerForm'
import css from './Authentication.module.scss'

interface AuthenticationData {
  formikProps: FormikProps<SCMData>
  authOptions: SelectOption[]
}

const allowSelection = false
const privateSecret = true

const Authentication: React.FC<AuthenticationData> = ({ formikProps, authOptions }) => {
  const { getString } = useStrings()

  return (
    <>
      <Container width={400} padding={{ top: 'large' }}>
        <Layout.Horizontal flex className={css.authHeaderRow}>
          <Text inline font={{ size: 'medium' }} color={Color.BLACK_100}>
            {getString('authentication')}
          </Text>
          <FormInput.Select name="authType" items={authOptions} disabled={false} className={css.authTypeSelect} />
        </Layout.Horizontal>
        {formikProps.values.authType === AuthTypes.USERNAME_PASSWORD ? (
          <>
            <TextReference
              name="username"
              stringId="username"
              type={formikProps.values.username ? formikProps.values.username.type : ValueType.TEXT}
              allowSelection={allowSelection}
              privateSecret={privateSecret}
            />
            <SecretInput
              name="password"
              label={getString('password')}
              allowSelection={allowSelection}
              privateSecret={privateSecret}
            />
          </>
        ) : null}
        {formikProps.values.authType === AuthTypes.USERNAME_TOKEN ? (
          <>
            <TextReference
              name="username"
              stringId="username"
              type={formikProps.values.username ? formikProps.values.username.type : ValueType.TEXT}
              allowSelection={allowSelection}
              privateSecret={privateSecret}
            />
            <SecretInput
              name="accessToken"
              label={getString('personalAccessToken')}
              allowSelection={allowSelection}
              privateSecret={privateSecret}
            />
          </>
        ) : null}
        {formikProps.values.authType === AuthTypes.SSH_KEY ? (
          <SSHSecretInput name="sshKey" label={getString('SSH_KEY')} />
        ) : null}
        {formikProps.values.authType === AuthTypes.KERBEROS ? (
          <SSHSecretInput name="kerberosKey" label={getString('kerberos')} />
        ) : null}
        {formikProps.values.authType === AuthTypes.AWSCredentials ? (
          <>
            <TextReference
              name="accessKey"
              stringId="common.accessKey"
              type={formikProps.values.authType || ValueType.TEXT}
              allowSelection={allowSelection}
              privateSecret={privateSecret}
            />
            <SecretInput
              name="secretKey"
              label={getString('common.secretKey')}
              allowSelection={allowSelection}
              privateSecret={privateSecret}
            />
          </>
        ) : null}
      </Container>
    </>
  )
}

export default Authentication
