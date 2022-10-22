/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { Layout, Text } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import type { ManifestTriggerFormikValues } from './ManifestSelection/ManifestInterface'
import ManifestSelection from './ManifestSelection/ManifestSelection'
import css from '@triggers/pages/triggers/views/ArtifactTriggerConfigPanel.module.scss'

export interface ManifestTriggerConfigPanelProps {
  formikProps?: FormikProps<ManifestTriggerFormikValues>
  isEdit?: boolean
}

export default function ManifestTriggerConfigPanel({
  formikProps,
  isEdit = false
}: ManifestTriggerConfigPanelProps): React.ReactElement {
  const { getString } = useStrings()
  const manifestText = getString('manifestsText')

  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      <Text className={css.formContentTitle} inline={true} tooltipProps={{ dataTooltipId: 'artifactManifestLabel' }}>
        {getString('triggers.triggerConfigurationLabel')}
        {!isEdit
          ? `: ${getString('triggers.onNewArtifactTitle', {
              artifact: manifestText
            })}`
          : ''}
      </Text>
      <div className={css.formContent}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps!}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
          tooltipProps={{ dataTooltipId: 'listenOnNewArtifactManifest' }}
        />
      </div>
      <Text
        className={css.formContentTitle}
        inline={true}
        tooltipProps={{ dataTooltipId: 'listenOnNewArtifactManifest' }}
      >
        {getString('pipeline.artifactTriggerConfigPanel.listenOnNewArtifact', {
          artifact: manifestText
        })}
      </Text>
      <div className={css.formContent}>
        <ManifestSelection formikProps={formikProps!} />
      </div>
    </Layout.Vertical>
  )
}
