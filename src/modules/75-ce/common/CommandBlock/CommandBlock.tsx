/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FontVariation, Layout, Text } from '@harness/uicore'
import CopyButton from '../CopyButton'
import css from './CommandBlock.module.scss'

interface CommandBlockProps {
  commandSnippet: string
  allowCopy?: boolean
}

const CommandBlock: React.FC<CommandBlockProps> = ({ commandSnippet, allowCopy }) => {
  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }} className={css.commandBlock}>
      <Text font={{ variation: FontVariation.YAML }}>{commandSnippet}</Text>
      {allowCopy && <CopyButton textToCopy={commandSnippet} />}
    </Layout.Horizontal>
  )
}

export default CommandBlock
