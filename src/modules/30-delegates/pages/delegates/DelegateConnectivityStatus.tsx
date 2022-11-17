/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Dialog } from '@blueprintjs/core'
import DelegateInstallationError from '@delegates/components/CreateDelegate/components/DelegateInstallationError/DelegateInstallationError'
import { useStrings } from 'framework/strings'
import type { DelegateGroupDetails } from 'services/cd-ng'
import css from './DelegatesPage.module.scss'

interface DelegateConnectivityStatusProps {
  delegate: DelegateGroupDetails
}
function DelegateConnectivityStatus({ delegate }: DelegateConnectivityStatusProps): JSX.Element {
  const isConnected = delegate.activelyConnected
  const { getString } = useStrings()
  const text = isConnected ? getString('connected') : getString('delegate.notConnected')
  const [troubleshooterOpen, setOpenTroubleshooter] = React.useState<{ isConnected: boolean | undefined }>()

  return (
    <Layout.Vertical>
      <Text
        icon="full-circle"
        iconProps={{ size: 6, color: isConnected ? Color.GREEN_600 : Color.GREY_400, padding: 'small' }}
      >
        {text}
      </Text>
      <Dialog
        isOpen={!!troubleshooterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshooter(undefined)}
      >
        <DelegateInstallationError showDelegateInstalledMessage={false} delegateType={delegate?.delegateType} />
      </Dialog>
      {!isConnected && delegate.delegateType === 'KUBERNETES' && (
        <div
          className={css.troubleshootLink}
          onClick={(e: React.MouseEvent) => {
            /*istanbul ignore next */
            e.stopPropagation()
            setOpenTroubleshooter({ isConnected: delegate.activelyConnected })
          }}
        >
          {getString('delegates.troubleshootOption')}
        </div>
      )}
    </Layout.Vertical>
  )
}

export default DelegateConnectivityStatus
