/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, Divider } from '@blueprintjs/core'
import { Layout, Text } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router'
import { String } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAccountNG } from 'services/cd-ng'
import { ModuleVersionTable } from './ReleaseNotesTable'
import css from './UseReleaseNotesModal.module.scss'

interface ModalReturn {
  showModal: () => void
  hideModal: () => void
}

export const useReleaseNotesModal = (): ModalReturn => {
  const { accountId } = useParams<AccountPathProps>()
  const { data } = useGetAccountNG({
    accountIdentifier: accountId,
    queryParams: { accountIdentifier: accountId }
  })

  const clusterName = data?.data?.cluster

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen
        enforceFocus={false}
        title={
          <Layout.Vertical spacing="small" className={css.alignCenter}>
            <Text font={{ size: 'medium' }}>
              <String stringID="common.resourceCenter.bottomlayout.releaseNote" />
            </Text>
            <Divider />
            <Text font={{ size: 'medium' }}>
              <String
                stringID="common.resourceCenter.productUpdates.releaseText"
                style={{ fontStyle: 'italic' }}
                useRichText
                vars={{
                  accountid: accountId,
                  clustername: clusterName
                }}
              />
            </Text>
          </Layout.Vertical>
        }
        onClose={hideModal}
        className={css.dialog}
      >
        <ModuleVersionTable />
      </Dialog>
    )
  }, [])

  return {
    showModal,
    hideModal
  }
}
