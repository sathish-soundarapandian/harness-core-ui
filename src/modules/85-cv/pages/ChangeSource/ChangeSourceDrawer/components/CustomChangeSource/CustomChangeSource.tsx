/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import cx from 'classnames'
import { TextArea } from '@blueprintjs/core'
import { Layout, Text, Container, CopyToClipboard } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { ChangeSourceDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './CustomChangeSource.module.scss'

export default function CustomChangeSource(): JSX.Element | null {
  const { values } = useFormikContext<ChangeSourceDTO>()
  const { spec } = values || {}
  const { getString } = useStrings()
  const { webhookUrl = '', webhookCurlCommand = '' } = spec || {}

  return (
    <Layout.Vertical spacing={'large'} width={'80%'}>
      <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'customWebHookURL' }}>
        {getString('cv.onboarding.changeSourceTypes.Custom.title')}
      </Text>
      <Container className={cx(css.webhookUrl, css.floatingCopyToClipboard)}>
        <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'small' }}>
          {getString('common.webhookURL')}
        </Text>
        <TextArea name="Webhook URL" fill readOnly value={webhookUrl} />
        <CopyToClipboard showFeedback content={webhookUrl} />
      </Container>
      <Container className={css.floatingCopyToClipboard}>
        <Text
          font={{ variation: FontVariation.FORM_LABEL }}
          margin={{ bottom: 'small' }}
          tooltipProps={{ dataTooltipId: 'customWebHookcURL' }}
        >
          {getString('cv.onboarding.changeSourceTypes.Custom.curl')}
        </Text>
        <TextArea name="cURL" growVertically fill readOnly value={webhookCurlCommand} />
        <CopyToClipboard showFeedback content={webhookCurlCommand} />
      </Container>
    </Layout.Vertical>
  )
}
