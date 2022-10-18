/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'

import { pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type {
  KerberosConfigDTO,
  NTLMConfigDTO,
  SecretDTOV2,
  TGTGenerationSpecDTO,
  WinRmCredentialsSpecDTO
} from 'services/cd-ng'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getSecretReferencesForWinRm } from '@secrets/utils/WinRmAuthUtils'
import { getScopeBasedProjectPathParams, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import CreateWinRmCredWizard, { WinRmCredSharedObj } from './CreateWinRmCredWizard'
import css from './useCreateWinRmCredModal.module.scss'

export interface UseCreateWinRmCredModalProps {
  onSuccess?: (secret: SecretDTOV2) => void
  onClose?: () => void
}

export interface UseCreateWinRmCredModalReturn {
  openCreateWinRmCredModal: (secret?: SecretDTOV2) => void
  closeCreateWinRmCredModal: () => void
}

export enum Views {
  CREATE,
  EDIT
}

export const useCreateWinRmCredModal = (props: UseCreateWinRmCredModalProps): UseCreateWinRmCredModalReturn => {
  const projectPathParams = useParams<ProjectPathProps>()
  const [view, setView] = useState(Views.CREATE)
  const [winrmData, setwinrmData] = useState<WinRmCredSharedObj>()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        className={css.dialog}
        enforceFocus={false}
        isOpen={true}
        onClose={() => {
          setView(Views.CREATE)
          hideModal()
        }}
      >
        {view === Views.CREATE ? (
          <CreateWinRmCredWizard
            {...props}
            hideModal={() => {
              props.onClose?.()
              hideModal()
            }}
          />
        ) : (
          <CreateWinRmCredWizard
            {...props}
            isEdit={true}
            detailsData={winrmData?.detailsData}
            authData={winrmData?.authData}
            hideModal={() => {
              props.onClose?.()
              hideModal()
            }}
          />
        )}
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [view, winrmData]
  )

  const open = useCallback(
    async (_winrmData?: SecretDTOV2) => {
      const params = getScopeBasedProjectPathParams(
        projectPathParams,
        getScopeFromValue((_winrmData?.spec as WinRmCredentialsSpecDTO)?.auth.spec?.spec?.password)
      )

      if (_winrmData) {
        const response = await getSecretReferencesForWinRm(_winrmData, params)
        setwinrmData({
          detailsData: {
            ...pick(_winrmData, 'name', 'identifier', 'description', 'tags')
          },
          authData: {
            authScheme: (_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.type,
            tgtGenerationMethod:
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).tgtGenerationMethod ||
              'None',
            username: ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).username,
            domain: ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).domain,
            useSSL:
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).useSSL ||
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).useSSL,
            useNoProfile:
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).useNoProfile ||
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).useNoProfile,
            skipCertChecks:
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as NTLMConfigDTO).skipCertChecks ||
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).skipCertChecks,
            principal: ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).principal,
            realm: ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO).realm,
            keyPath: (
              ((_winrmData.spec as WinRmCredentialsSpecDTO)?.auth.spec as KerberosConfigDTO)
                .spec as TGTGenerationSpecDTO
            )?.keyPath,
            port: (_winrmData.spec as WinRmCredentialsSpecDTO).port || 5985,
            password: response.passwordSecret
          }
        })
        setView(Views.EDIT)
      } else setView(Views.CREATE)
      showModal()
    },
    [showModal]
  )
  return {
    openCreateWinRmCredModal: (secret?: SecretDTOV2) => open(secret),
    closeCreateWinRmCredModal: hideModal
  }
}
