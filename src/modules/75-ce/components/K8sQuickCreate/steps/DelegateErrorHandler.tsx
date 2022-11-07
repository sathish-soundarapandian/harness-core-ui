/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'

import css from '../K8sQuickCreateModal.module.scss'

export const DelegateErrorHandler: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="large" className={css.delegateErrorCtn}>
      <div className={css.textCtn}>
        <Icon name="error" color={Color.RED_800} margin={{ right: 'small' }} />
        <Text color={Color.RED_800} font={{ variation: FontVariation.H6 }}>
          {getString('ce.k8sQuickCreate.testConnection.delegateError.error')}
        </Text>
      </div>
      <div className={css.textCtn}>
        <Icon name="info" margin={{ right: 'small' }} />
        <Container>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.BODY2 }}>
            {getString('ce.k8sQuickCreate.testConnection.delegateError.info1')}
          </Text>
          <Text color={Color.GREY_800} margin={{ top: 'xsmall' }}>
            {getString('ce.k8sQuickCreate.testConnection.delegateError.info2')}
          </Text>
        </Container>
      </div>
      <div className={css.textCtn}>
        <Icon name="lightbulb" margin={{ right: 'small' }} />
        <Container>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.BODY2 }}>
            {getString('ce.k8sQuickCreate.testConnection.delegateError.troubleshoot1')}
          </Text>
          <Button
            variation={ButtonVariation.LINK}
            margin={{ top: 'xsmall' }}
            className={css.troubleshootBtn}
            rightIcon="launch"
            href="https://docs.harness.io/article/jzklic4y2j-troubleshooting#delegate_issues"
            target="_blank"
          >
            {getString('ce.k8sQuickCreate.testConnection.delegateError.troubleshoot2')}
          </Button>
          <Text color={Color.GREY_800} margin={{ top: 'xsmall' }}>
            {getString('ce.k8sQuickCreate.testConnection.delegateError.troubleshoot3')}
          </Text>
        </Container>
      </div>
    </Layout.Vertical>
  )
}
