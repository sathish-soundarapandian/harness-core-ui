/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { FormInput, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export const CREDENTIALS_TYPE: { [key: string]: string } = {
  USERNAME_PASSWORD: 'username_password',
  SERVICE_ACCOUNT: 'service_account',
  CLIENT_KEY_CERTIFICATE: 'clientKeyCertificate'
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const AuthTypeForm = ({ authType }: { authType: any }) => {
  const { getString } = useStrings()

  if (authType === CREDENTIALS_TYPE.USERNAME_PASSWORD) {
    return (
      <>
        <FormInput.Text
          // tooltipProps={{ dataTooltipId: 'clusterUsername' }}
          label={getString('username')}
          className={css.width50}
          name="username"
        />
        <FormInput.Text
          // tooltipProps={{ dataTooltipId: 'clusterPassword' }}
          label={getString('password')}
          inputGroup={{ type: 'password' }}
          className={css.width50}
          name="password"
        />
        <FormInput.Text isOptional label={getString('common.namespace')} className={css.width50} name="namespace" />
        <Text style={{ cursor: 'pointer' }} onClick={noop} color={Color.PRIMARY_7}>
          {getString('cd.getStartedWithCD.tryAnotherCreds')}
        </Text>
      </>
    )
  }
  if (authType === CREDENTIALS_TYPE.SERVICE_ACCOUNT) {
    return (
      <FormInput.TextArea
        // tooltipProps={{ dataTooltipId: 'clusterBearerToken' }}
        maxLength={16000}
        label={getString('connectors.k8.serviceAccountToken')}
        className={classnames(css.keyTextArea, css.width50)}
        name="bearerToken"
      />
    )
  }

  if (authType === CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE) {
    return (
      <>
        <FormInput.Text
          // tooltipProps={{ dataTooltipId: 'clusterClientKey' }}
          label={getString('connectors.k8.clientKey')}
          className={css.width50}
          name="keyData"
        />
        <FormInput.TextArea
          // tooltipProps={{ dataTooltipId: 'clusterClientKeyCertificate' }}
          maxLength={2048}
          label={getString('connectors.k8.authLabels.clientKeyCertificate')}
          className={classnames(css.width50, css.keyTextArea)}
          name="certData"
        />
      </>
    )
  }

  return null
}
