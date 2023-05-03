/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, HarnessDocTooltip, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { ConditionRow, AddConditionsSection } from '@triggers/pages/triggers/views/AddConditionsSection'
import css from '@triggers/pages/triggers/views/WebhookConditionsPanel.module.scss'

interface ArtifactConditionsPanelProps {
  formikProps?: any
}

const ArtifactConditionsPanel: React.FC<ArtifactConditionsPanelProps> = ({ formikProps }): JSX.Element => {
  const { values: formikValues, setFieldValue, errors } = formikProps
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
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {getString('triggers.conditionsPanel.eventCondition')}
        </Text>
        <ConditionRow
          formikProps={formikProps}
          name="build"
          label={
            formikProps.values.selectedArtifact?.spec?.artifactPath
              ? getString('pipeline.artifactPathLabel')
              : getString('triggers.conditionsPanel.artifactBuild')
          }
        />
      </Layout.Vertical>
      <Layout.Vertical className={css.formContent}>
        <AddConditionsSection
          title={getString('triggers.conditionsPanel.metadataConditions')}
          key="metaDataConditions"
          fieldId="metaDataConditions"
          attributePlaceholder="<+trigger.artifact.metadata.field>"
          formikValues={formikValues}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      </Layout.Vertical>
      <Layout.Vertical className={cx(css.formContent, css.marginBottom)}>
        <Text className={css.sectionHeader}>
          {getString('triggers.conditionsPanel.jexlCondition')}
          <HarnessDocTooltip tooltipId="jexlCondition" useStandAlone={true} />
        </Text>
        <FormInput.Text
          style={{ width: '100%', marginBottom: '0' }}
          name="jexlCondition"
          placeholder={getString('triggers.conditionsPanel.jexlConditionPlaceholder')}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default ArtifactConditionsPanel
