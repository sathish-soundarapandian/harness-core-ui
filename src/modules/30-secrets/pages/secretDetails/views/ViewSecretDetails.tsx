/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type {
  KerberosConfigDTO,
  SecretResponseWrapper,
  SecretTextSpecDTO,
  SSHConfigDTO,
  SSHKeyPathCredentialDTO,
  SSHKeyReferenceCredentialDTO,
  SSHKeySpecDTO,
  SSHPasswordCredentialDTO,
  TGTKeyTabFilePathSpecDTO,
  ConnectorConnectivityDetails,
  TGTPasswordSpecDTO,
  WinRmCredentialsSpecDTO,
  NTLMConfigDTO
} from 'services/cd-ng'
import { getKeyForCredentialType, getStringForType } from '@secrets/utils/SSHAuthUtils'

import VerifyConnectionSSH from '@secrets/modals/CreateSSHCredModal/views/VerifyConnection'
import VerifyConnectionWinRM from '@secrets/modals/CreateWinRmCredModal/views/VerifyConnection'
import ConnectorStats from '@common/components/ConnectorStats/ConnectorStats'
import {
  ActivityDetailsRowInterface,
  RenderDetailsTable
} from '@common/components/RenderDetailsTable/RenderDetailsTable'
import { useStrings } from 'framework/strings'
import css from './ViewSecretDetails.module.scss'

interface ViewSecretDetailsProps {
  secret: SecretResponseWrapper
}

const ViewSecretDetails: React.FC<ViewSecretDetailsProps> = props => {
  const {
    secret: { secret }
  } = props
  const { getString } = useStrings()

  const getSecretDetailsRow = (): ActivityDetailsRowInterface[] => {
    return [
      { label: getString('name'), value: secret.name },
      { label: getString('description'), value: secret.description },
      { label: getString('identifier'), value: secret.identifier },
      { label: getString('tagsLabel'), value: secret.tags }
    ]
  }

  const getSecretCredentialsRow = (): ActivityDetailsRowInterface[] => {
    const items: ActivityDetailsRowInterface[] = []
    items.push({ label: getString('secrets.labelType'), value: getStringForType(secret.type) })
    if (secret.type === 'WinRmCredentials' && (secret.spec as WinRmCredentialsSpecDTO)?.auth?.type) {
      items.push({
        label: getString('authentication'),
        value: (secret.spec as WinRmCredentialsSpecDTO)?.auth.type
      })
      if ((secret.spec as WinRmCredentialsSpecDTO)?.auth.type === 'NTLM') {
        items.push({
          label: getString('secrets.winRmAuthFormFields.domain'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).domain
        })
        items.push({
          label: getString('username'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).username
        })
        items.push({
          label: getString('secrets.winRmAuthFormFields.useSSL'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).useSSL!.toString()
        })
        items.push({
          label: getString('secrets.winRmAuthFormFields.skipCertCheck'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).skipCertChecks!.toString()
        })
        items.push({
          label: getString('secrets.winRmAuthFormFields.useNoProfile'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).useNoProfile!.toString()
        })
      }
      if ((secret.spec as WinRmCredentialsSpecDTO)?.auth.type === 'Kerberos') {
        items.push({
          label: getString('secrets.sshAuthFormFields.labelPrincipal'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).principal
        })
        items.push({
          label: getString('secrets.sshAuthFormFields.labelRealm'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).realm
        })
        items.push({
          label: getString('secrets.winRmAuthFormFields.useSSL'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).useSSL!.toString()
        })
        items.push({
          label: getString('secrets.winRmAuthFormFields.skipCertCheck'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).skipCertChecks!.toString()
        })
        items.push({
          label: getString('secrets.winRmAuthFormFields.useNoProfile'),
          value: ((secret.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).useNoProfile!.toString()
        })
      }
      items.push({
        label: getString('secrets.winRmAuthFormFields.labelWinRmPort'),
        value: (secret.spec as WinRmCredentialsSpecDTO)?.port
      })
    }

    if (secret.type === 'SSHKey' && (secret.spec as SSHKeySpecDTO)?.auth?.type) {
      items.push({
        label: getString('authentication'),
        value: (secret.spec as SSHKeySpecDTO)?.auth.type
      })
      if ((secret.spec as SSHKeySpecDTO)?.auth.type === 'SSH') {
        items.push({
          label: getString('credType'),
          value: getKeyForCredentialType((secret.spec as SSHKeySpecDTO)?.auth.spec.credentialType)
        })
        items.push({
          label: getString('username'),
          value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHPasswordCredentialDTO).userName
        })
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).credentialType === 'Password') {
          items.push({
            label: getString('username'),
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHPasswordCredentialDTO)
              .userName
          })
        }
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).credentialType === 'KeyPath') {
          items.push({
            label: getString('secrets.sshAuthFormFields.labelKeyFilePath'),
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyPathCredentialDTO).keyPath
          })
          items.push({
            label: getString('secrets.sshAuthFormFields.labelPassphrase'),
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyPathCredentialDTO)
              .encryptedPassphrase
          })
        }
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).credentialType === 'KeyReference') {
          items.push({
            label: getString('secrets.sshAuthFormFields.labelKeyReference'),
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyReferenceCredentialDTO)
              .key
          })
          items.push({
            label: getString('secrets.sshAuthFormFields.labelPassphrase'),
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyReferenceCredentialDTO)
              .encryptedPassphrase
          })
        }
      }
      if ((secret.spec as SSHKeySpecDTO)?.auth.type === 'Kerberos') {
        items.push({
          label: getString('secrets.sshAuthFormFields.labelPrincipal'),
          value: ((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).principal
        })
        items.push({
          label: getString('secrets.sshAuthFormFields.labelRealm'),
          value: ((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).realm
        })
        items.push({
          label: getString('secrets.sshAuthFormFields.labelTGT'),
          value:
            ((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).tgtGenerationMethod || getString('none')
        })
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).tgtGenerationMethod === 'KeyTabFilePath') {
          items.push({
            label: getString('secrets.sshAuthFormFields.labelKeyTab'),
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO)?.spec as TGTKeyTabFilePathSpecDTO)
              ?.keyPath
          })
        }
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).tgtGenerationMethod === 'Password') {
          items.push({
            label: getString('password'),
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).spec as TGTPasswordSpecDTO)
              .password
          })
        }
      }
    }

    if (secret.type === 'SecretText') {
      const secretTextSpec = secret.spec as SecretTextSpecDTO
      if (secretTextSpec.valueType == 'Inline')
        items.push({
          label: getString('secrets.labelValue'),
          value: getString('encrypted').toLowerCase(),
          valueColor: Color.GREY_350
        })
      if (secretTextSpec.valueType == 'Reference')
        items.push({ label: getString('secrets.labelPath'), value: secretTextSpec.value })
      items.push({
        label: getString('secrets.labelSecretsManager'),
        value: (secret.spec as SecretTextSpecDTO).secretManagerIdentifier
      })
    }
    if (secret.type === 'SecretFile') {
      items.push({
        label: getString('secrets.labelValue'),
        value: getString('encryptedFile').toLowerCase(),
        valueColor: Color.GREY_350
      })
      items.push({
        label: getString('secrets.labelSecretsManager'),
        value: (secret.spec as SecretTextSpecDTO).secretManagerIdentifier
      })
    }
    return items
  }

  return (
    <Layout.Horizontal>
      <Layout.Vertical width="60%" spacing="large">
        <Layout.Horizontal spacing="medium">
          <RenderDetailsTable
            title={getString('overview')}
            data={getSecretDetailsRow()}
            className={css.renderDetails}
          />
          <RenderDetailsTable title={'Credentials'} data={getSecretCredentialsRow()} className={css.renderDetails} />
        </Layout.Horizontal>
      </Layout.Vertical>
      {secret.type === 'SSHKey' || secret.type === 'WinRmCredentials' ? (
        <Layout.Vertical width="40%" spacing="xxxlarge" border={{ left: true }} padding={{ left: 'xxxlarge' }}>
          <ConnectorStats
            createdAt={props.secret.createdAt as number}
            lastUpdated={props.secret.updatedAt}
            status={'' as ConnectorConnectivityDetails['status']}
            className={css.stats}
          />
          {secret.type === 'SSHKey' && <VerifyConnectionSSH identifier={secret.identifier} />}
          {secret.type === 'WinRmCredentials' && <VerifyConnectionWinRM identifier={secret.identifier} />}
        </Layout.Vertical>
      ) : null}
    </Layout.Horizontal>
  )
}

export default ViewSecretDetails
