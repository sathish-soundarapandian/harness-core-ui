/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Card, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './PermissionCard.module.scss'

interface PermissionCardProps {
  preTitle: string
  title: string
  description: string
  enabled: boolean
  onSelect: () => void
}

const PermissionCard: React.FC<PermissionCardProps> = props => {
  const { preTitle, title, description, enabled, onSelect } = props
  const { getString } = useStrings()
  return (
    <Card elevation={0} className={css.card}>
      <Layout.Horizontal spacing="small">
        <Icon name="main-search" size={30} />
        <div>
          <Text font="small">{preTitle}</Text>
          <Text padding={{ bottom: 'small' }} color={Color.BLACK} style={{ fontSize: '13px' }}>
            {title}
          </Text>
        </div>
      </Layout.Horizontal>

      <Text font="small" className={css.description}>
        {description}
      </Text>
      <Layout.Horizontal spacing="xxlarge" style={{ float: 'right' }}>
        {!enabled && (
          <Button font={{ size: 'small', weight: 'semi-bold' }} className={css.enable} onClick={onSelect}>
            {getString('enable')}
          </Button>
        )}
        {enabled && (
          <Button
            font={{ size: 'small', weight: 'semi-bold' }}
            className={css.enabled}
            onClick={onSelect}
            rightIcon="small-tick"
          >
            {getString('enabledLabel')}
          </Button>
        )}
      </Layout.Horizontal>
    </Card>
  )
}

export default PermissionCard
