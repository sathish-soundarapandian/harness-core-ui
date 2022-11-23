/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, TextInput } from '@harness/uicore'
import { Callout } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { CopyText } from '@common/components/CopyText/CopyText'

interface TokenValueRendererProps {
  token: string
  textInputClass?: string
  copyTextClass?: string
}

export const TokenValueRenderer: React.FC<TokenValueRendererProps> = props => {
  const { getString } = useStrings()
  const { token, textInputClass, copyTextClass } = props
  return (
    <Layout.Vertical spacing="small" margin={{ bottom: 'medium' }}>
      <Callout intent="success">
        <Text>{getString('valueLabel')}</Text>
        <TextInput
          className={textInputClass}
          value={token}
          disabled
          rightElement={
            (<CopyText className={copyTextClass} iconName="duplicate" textToCopy={token} iconAlwaysVisible />) as any
          }
        />
        <Text>{getString('rbac.token.form.tokenMessage')}</Text>
      </Callout>
    </Layout.Vertical>
  )
}
