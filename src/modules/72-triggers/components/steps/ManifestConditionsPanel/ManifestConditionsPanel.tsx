/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HarnessDocTooltip, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { ConditionRow } from '@triggers/pages/triggers/views/AddConditionsSection'
import css from '@triggers/pages/triggers/views/WebhookConditionsPanel.module.scss'

interface ManifestConditionsPanelProps {
  formikProps?: any
}

const ManifestConditionsPanel: React.FC<ManifestConditionsPanelProps> = ({ formikProps }): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={cx(css.webhookConditionsContainer)} spacing="large" padding="xxlarge">
      <>
        <Text style={{ fontSize: '16px' }} font={{ weight: 'bold' }} inline={true} color={Color.GREY_800}>
          {getString('conditions')}
          <Text style={{ display: 'inline-block' }} color={Color.GREY_500}>
            {getString('titleOptional')}
          </Text>
          <HarnessDocTooltip tooltipId="artifactManifestConditions" useStandAlone={true} />
        </Text>
      </>
      <>
        <Text
          color={Color.BLACK}
          style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-large)' }}
          data-tooltip-id="artifactManifestConditionSubtitle"
        >
          {getString('triggers.conditionsPanel.subtitle')}
          <HarnessDocTooltip tooltipId="artifactManifestConditionSubtitle" useStandAlone={true} />
        </Text>
      </>
      <Layout.Vertical className={css.formContent}>
        <ConditionRow
          formikProps={formikProps}
          name="version"
          label={getString('triggers.conditionsPanel.manifestVersion')}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default ManifestConditionsPanel
