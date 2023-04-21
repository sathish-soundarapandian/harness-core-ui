/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { useStrings } from 'framework/strings'
import StageSelection from '@triggers/components/StageSelection/StageSelection'

import ArtifactsSelection from './ArtifactsSelection/ArtifactsSelection'

import css from './ArtifactTriggerConfigPanel.module.scss'
export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { getString } = useStrings()
  const { CDS_NG_TRIGGER_SELECTIVE_STAGE_EXECUTION } = useFeatureFlags()
  const artifactText = getString('pipeline.artifactTriggerConfigPanel.artifact')

  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      <Text className={css.formContentTitle} inline={true} tooltipProps={{ dataTooltipId: 'artifactLabel' }}>
        {getString('triggers.triggerConfigurationLabel')}
        {isEdit
          ? ``
          : `: ${getString('triggers.onNewArtifactTitle', {
              artifact: artifactText
            })}`}
      </Text>
      <div className={css.formContent}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
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
      {CDS_NG_TRIGGER_SELECTIVE_STAGE_EXECUTION ? <StageSelection formikProps={formikProps} /> : null}
    </Layout.Vertical>
  )
}

export default ArtifactTriggerConfigPanel
