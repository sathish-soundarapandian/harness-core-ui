/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, CopyToClipboard, Text } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

function CommandWithCopyField({ label }: { label: StringKeys }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container intent="primary" padding="small" flex className={css.copyCommandContainer}>
      <Text style={{ marginRight: '24px' }}>{getString(label)}</Text>
      <CopyToClipboard content={getString(label)} />
    </Container>
  )
}

export default CommandWithCopyField
