/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Layout } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import React, { FC } from 'react'
import { useStrings } from 'framework/strings'

export const BulkActions: FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing={'small'} flex={{ align: 'center-center' }}>
      <Button variation={ButtonVariation.SECONDARY} onClick={noop} text={getString('enable')} />
      <Button variation={ButtonVariation.SECONDARY} onClick={noop} text={getString('common.disable')} />
      <Button variation={ButtonVariation.SECONDARY} onClick={noop} text={getString('delete')} />
    </Layout.Horizontal>
  )
}
