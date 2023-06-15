/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import * as Yup from 'yup'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import { isPR, getPREnvNameFromURL } from '@common/utils/utils'
import { GitConnectionType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { GitAuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { StringsMap } from 'stringTypes'

export const ConnectorSecretScope: { [scope: string]: string } = {
  [Scope.ORG]: 'org.',
  [Scope.ACCOUNT]: 'account.'
}
export enum ModalViewFor {
  CD_Onboarding = 4
}

export const shouldHideHeaderAndNavBtns = (context: ModalViewFor | undefined): boolean =>
  context === ModalViewFor.CD_Onboarding

export function getScopingStringFromSecretRef(connecterConfig: ConnectorConfigDTO): string | undefined {
  return connecterConfig &&
    connecterConfig.passwordRefSecret &&
    connecterConfig.passwordRefSecret.scope !== Scope.PROJECT
    ? ConnectorSecretScope[connecterConfig.passwordRefSecret.scope]
    : undefined
}

export const getCommonConnectorsValidationSchema = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): Yup.ObjectSchema =>
  Yup.object().shape({
    username: Yup.string().when(['connectionType', 'authType'], {
      is: (connectionType, authType) => connectionType === GitConnectionType.HTTP && authType !== GitAuthTypes.KERBEROS,
      then: Yup.string().trim().required(getString('validation.username')),
      otherwise: Yup.string().nullable()
    }),
    authType: Yup.string().when('connectionType', {
      is: val => val === GitConnectionType.HTTP,
      then: Yup.string().trim().required(getString('validation.authType'))
    }),
    sshKey: Yup.object().when('connectionType', {
      is: val => val === GitConnectionType.SSH,
      then: Yup.object().required(getString('validation.sshKey')),
      otherwise: Yup.object().nullable()
    }),
    password: Yup.object().when(['connectionType', 'authType'], {
      is: (connectionType, authType) =>
        connectionType === GitConnectionType.HTTP && authType === GitAuthTypes.USER_PASSWORD,
      then: Yup.object().required(getString('validation.password')),
      otherwise: Yup.object().nullable()
    })
  })

export const getGatewayUrlPrefix = (): string => {
  const urlPrefix = `${location.protocol}//${location.host}`
  return isPR() ? `${urlPrefix}/${getPREnvNameFromURL(location.href)}/gateway` : `${urlPrefix}/gateway`
}
