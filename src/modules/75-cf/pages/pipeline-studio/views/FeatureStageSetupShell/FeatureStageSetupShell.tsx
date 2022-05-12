/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Tabs, Tab, Button, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { set } from 'lodash-es'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import StageAdvancedSettings from '../StageAdvancedSettings/StageAdvancedSettings'
import StageOverview from '../StageOverview/StageOverview'
import { RolloutStrategy } from '../RolloutStrategy/RolloutStrategy'
import css from './FeatureStageSetupShell.module.scss'

export default function FeatureStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const overviewTitle = getString('overview')
  const rolloutTitle = getString('cf.pipeline.rollloutStrategy.title')
  const advancedTitle = getString('cf.pipeline.advanced.title')
  const stageNames: string[] = [overviewTitle, rolloutTitle, advancedTitle]
  const [selectedTabId, setSelectedTabId] = React.useState<string>(rolloutTitle)
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const {
    state: {
      pipeline,
      pipelineView: { isSplitViewOpen },
      pipelineView,
      selectionState: { selectedStageId = '' }
    },
    updatePipeline,
    getStageFromPipeline,
    updatePipelineView
  } = usePipelineContext()

  React.useEffect(() => {
    if (stageNames.indexOf(selectedStageId) !== -1) {
      setSelectedTabId(selectedStageId)
    }
  }, [selectedStageId, pipeline, isSplitViewOpen, stageNames])

  const handleTabChange = (data: string): void => {
    setSelectedTabId(data)
  }

  React.useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  React.useEffect(() => {
    const { stage: data } = getStageFromPipeline(selectedStageId)
    if (data) {
      let shouldUpdate = false
      if (!data?.stage?.spec?.execution?.steps) {
        set(data, 'stage.spec.execution.steps', [])
        shouldUpdate = true
      }

      if (shouldUpdate) {
        updatePipeline(pipeline)
      }
    }
  }, [pipeline, selectedStageId, getStageFromPipeline, updatePipeline])

  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      {/* <Button
        text={getString('previous')}
        icon="chevron-left"
        disabled={selectedTabId === overviewTitle}
        onClick={() => {
          updatePipeline(pipeline)
          setSelectedTabId(selectedTabId === advancedTitle ? rolloutTitle : overviewTitle)
        }}
      /> */}
      <Button
        text={selectedTabId === advancedTitle ? getString('save') : getString('continue')}
        intent="primary"
        rightIcon="chevron-right"
        onClick={() => {
          updatePipeline(pipeline)
          if (selectedTabId === advancedTitle) {
            updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
          } else {
            setSelectedTabId(selectedTabId === overviewTitle ? rolloutTitle : advancedTitle)
          }
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <section
      ref={layoutRef}
      key={selectedStageId}
      className={cx(css.setupShell, {
        [css.tabsFullHeight]: selectedTabId === rolloutTitle
      })}
    >
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
        <Tab
          id={overviewTitle}
          panel={<StageOverview>{navBtns}</StageOverview>}
          title={
            <span className={css.tab}>
              <Icon name="cf-main" height={20} size={20} />
              {overviewTitle}
            </span>
          }
        />
        <Tab
          id={rolloutTitle}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-steps" height={20} size={20} />
              {rolloutTitle}
            </span>
          }
          className={cx(css.fullHeight, css.stepGroup)}
          panel={<RolloutStrategy selectedStageId={selectedStageId} />}
        />
        <Tab
          id={advancedTitle}
          style={{ display: 'none' }}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-stages" height={20} size={20} />
              {advancedTitle}
            </span>
          }
          panel={<StageAdvancedSettings>{navBtns}</StageAdvancedSettings>}
        />
      </Tabs>
    </section>
  )
}
