/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, CopyToClipboard, Layout, Text } from '@harness/uicore'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

function CommandWithCopyField({ label = '' }): JSX.Element {
  return (
    <Layout.Horizontal flex={{ alignItems: 'center' }} padding={0}>
      <Container
        intent="primary"
        font={{
          align: 'center'
        }}
        flex
        className={css.verificationField}
        width={'80%'}
      >
        <Text style={{ marginRight: 'var(--spacing-xlarge)', paddingLeft: '5px' }} font="small">
          {label}
        </Text>
        <CopyToClipboard content={label.slice(2)} showFeedback />
      </Container>
    </Layout.Horizontal>
  )
}

export default CommandWithCopyField
