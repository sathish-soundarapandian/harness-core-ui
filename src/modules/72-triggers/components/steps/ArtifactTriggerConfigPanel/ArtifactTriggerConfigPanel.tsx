/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import ArtifactsSelection from './ArtifactsSelection/ArtifactsSelection'
import css from './ArtifactTriggerConfigPanel.module.scss'
export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
}

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({ formikProps }) => {
  const { getString } = useStrings()
  const artifactText = getString('pipeline.artifactTriggerConfigPanel.artifact')

  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      <Text className={css.formContentTitle} inline={true} tooltipProps={{ dataTooltipId: 'artifactLabel' }}>
        {`${getString('triggers.triggerConfigurationLabel')}: ${getString('triggers.onNewArtifactTitle', {
          artifact: artifactText
        })}`}
      </Text>
      <div className={css.formContent}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          tooltipProps={{
            dataTooltipId: 'artifactTrigger'
          }}
        />
      </div>
      <Text className={css.formContentTitle} inline={true} tooltipProps={{ dataTooltipId: 'listenNewArtifact' }}>
        {getString('pipeline.artifactTriggerConfigPanel.listenOnNewArtifact', {
          artifact: artifactText
        })}
      </Text>
      <div className={css.formContent}>
        <ArtifactsSelection formikProps={formikProps} />
      </div>
    </Layout.Vertical>
  )
}

export default ArtifactTriggerConfigPanel
