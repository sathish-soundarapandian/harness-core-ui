/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import copy from 'copy-to-clipboard'
import { Container, Icon, Text } from '@harness/uicore'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import css from '../CEK8sConnector.module.scss'

interface CopyCodeSectionProps {
  snippet: string
}

const CopyCodeSection: React.FC<CopyCodeSectionProps> = ({ snippet }) => {
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const copyCommandToClipboard = () => {
    copy(snippet) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
  }
  return (
    <Container flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }} className={css.copyCommand}>
      <Text>{snippet}</Text>
      <Icon name="step-group" title={'copy'} onClick={copyCommandToClipboard} />
    </Container>
  )
}

export default CopyCodeSection
