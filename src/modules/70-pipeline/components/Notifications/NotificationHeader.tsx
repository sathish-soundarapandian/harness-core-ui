/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

interface NotificationsHeaderProps {
  isReadonly: boolean
  discardChanges: () => void
  applyChanges: () => void
  name: string
  isUpdated: boolean
}

export function NotificationsHeader(props: NotificationsHeaderProps): React.ReactElement {
  const { applyChanges, discardChanges, name, isUpdated, isReadonly } = props
  const { getString } = useStrings()
  return (
    <Layout.Horizontal
      padding={{ bottom: 'medium', top: 'medium', left: 'xlarge', right: 'xlarge' }}
      flex={{ distribution: 'space-between' }}
      border={{ bottom: true, color: Color.GREY_300 }}
    >
      <Text color={Color.BLACK} font={{ weight: 'bold', size: 'medium' }}>{`${name} : ${getString(
        'notifications.name'
      )}`}</Text>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getString('applyChanges')}
          onClick={applyChanges}
          disabled={!isUpdated || isReadonly}
        />
        <Button
          minimal
          size={ButtonSize.SMALL}
          text={getString('common.discard')}
          onClick={discardChanges}
          disabled={!isUpdated}
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}
