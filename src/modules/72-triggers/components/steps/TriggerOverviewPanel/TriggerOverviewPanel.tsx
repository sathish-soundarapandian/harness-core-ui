/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HarnessDocTooltip, Layout, Text, PageSpinner } from '@harness/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'

import { NameIdDescriptionTags } from '@common/components'

import css from './TriggerOverviewPanel.module.scss'

export interface TriggerOverviewPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const TriggerOverviewPanel: React.FC<TriggerOverviewPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}): JSX.Element => {
  const {
    values: { originalPipeline, pipeline }
  } = formikProps
  const { getString } = useStrings()
  // originalPipeline for new, pipeline for onEdit
  const hasLoadedPipeline = originalPipeline || pipeline
  return (
    <Layout.Vertical className={cx(css.triggerOverviewPanelContainer)} spacing="large" padding="xxlarge">
      {!hasLoadedPipeline && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      <>
        <Text className={css.formContentTitle} inline={true}>
          {getString('triggers.triggerOverviewPanel.title')}
          <HarnessDocTooltip tooltipId="triggerOverview" useStandAlone={true} />
        </Text>
      </>
      <Layout.Vertical className={css.formContent}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
          tooltipProps={{
            dataTooltipId: 'triggerOverview'
          }}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default TriggerOverviewPanel
