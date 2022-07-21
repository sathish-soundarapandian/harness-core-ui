/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef } from 'react'
import cx from 'classnames'
import { unset, capitalize as _capitalize } from 'lodash-es'
import YAML from 'yaml'
import produce from 'immer'
import { Button, Icon, Layout, Tab, Tabs } from '@wings-software/uicore'
import { Expander } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import {
  ApprovalStageConfig,
  GetInitialStageYamlSnippetQueryParams,
  useGetInitialStageYamlSnippet,
  StageElementWrapperConfig
} from 'services/pipeline-ng'
import type { StageElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { useQueryParams } from '@common/hooks'
import { ApprovalStageOverview } from './ApprovalStageOverview'
import { ApprovalStageExecution } from './ApprovalStageExecution'
import ApprovalAdvancedSpecifications from './ApprovalStageAdvanced'
import css from './ApprovalStageSetupShellMode.module.scss'

interface ApprovalStageElementConfig extends StageElementConfig {
  approvalType?: string
}

export function ApprovalStageSetupShellMode(): React.ReactElement {
  const { getString } = useStrings()
  const tabHeadings = [getString('overview'), getString('executionText'), getString('advancedTitle')]
  const isTemplatesEnabled = useFeatureFlag(FeatureFlag.NG_TEMPLATES)
  const layoutRef = useRef<HTMLDivElement>(null)
  const [selectedTabId, setSelectedTabId] = React.useState<string>(tabHeadings[1])
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId = '', selectedStepId },
      gitDetails
    },
    contextType,
    getStageFromPipeline,
    updatePipeline,
    updateStage
  } = pipelineContext
  const query = useQueryParams()

  const [loadGraph, setLoadGraph] = React.useState(false)
  const { stage: selectedStage } = getStageFromPipeline<ApprovalStageElementConfig>(selectedStageId)

  React.useEffect(() => {
    const sectionId = (query as any).sectionId || ''
    if (sectionId?.length && tabHeadings.includes(_capitalize(sectionId))) {
      setSelectedTabId(_capitalize(sectionId))
    } else {
      setSelectedTabId(tabHeadings[1])
    }
  }, [])

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(tabHeadings[1])
    }
  }, [selectedStepId])

  function ActionButtons(): React.ReactElement {
    return (
      <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
        <Button
          text={getString('next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            updatePipeline(pipeline)
            setSelectedTabId(tabHeadings[1])
          }}
        />
      </Layout.Horizontal>
    )
  }

  React.useEffect(() => {
    // To drag and drop the canvas
    if (layoutRef.current) {
      layoutRef.current.scrollTo?.(0, 0)
    }
  }, [selectedTabId])

  const { data: yamlSnippet } = useGetInitialStageYamlSnippet({
    queryParams: {
      approvalType: (selectedStage?.stage?.approvalType ||
        StepType.HarnessApproval) as GetInitialStageYamlSnippetQueryParams['approvalType']
    }
  })

  useEffect(() => {
    // error handling if needed
    if (yamlSnippet?.data) {
      // The last part of condition is important, as we only need to add the YAML snippet the first time in the step.
      if (!selectedStage?.stage?.spec?.execution) {
        updateStage(
          produce(selectedStage as StageElementWrapperConfig, draft => {
            const jsonFromYaml = YAML.parse(yamlSnippet?.data || '') as ApprovalStageElementConfig
            if (draft?.stage && draft?.stage?.spec) {
              draft.stage.failureStrategies = jsonFromYaml.failureStrategies
              ;(draft.stage.spec as ApprovalStageConfig).execution =
                (jsonFromYaml.spec as ApprovalStageConfig)?.execution || {}
              // approvalType is just used in the UI, to populate the default steps for different approval types
              // For BE, the stage type is always 'Approval' and approval type is defined inside the step
              unset(draft.stage as ApprovalStageElementConfig, 'approvalType')
            }
          }).stage as ApprovalStageElementConfig
        ).then(() => {
          setLoadGraph(true)
        })
      } else if (selectedStage?.stage?.spec?.execution) {
        // We're opening an already added approval stage
        setLoadGraph(true)
      }
    }
  }, [yamlSnippet?.data])

  return (
    <section ref={layoutRef} key={selectedStageId} className={css.approvalStageSetupShellWrapper}>
      <Tabs
        id="approvalStageSetupShell"
        onChange={(tabId: string) => setSelectedTabId(tabId)}
        selectedTabId={selectedTabId}
        data-tabId={selectedTabId}
      >
        <Tab
          id={tabHeadings[0]}
          panel={
            <ApprovalStageOverview>
              <ActionButtons />
            </ApprovalStageOverview>
          }
          title={
            <span className={css.tab}>
              <Icon name="tick" height={20} size={20} color={Color.GREEN_800} />
              {tabHeadings[0]}
            </span>
          }
          data-testid={tabHeadings[0]}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={tabHeadings[1]}
          title={
            <span className={css.tab}>
              <Icon name="deployment-success-legacy" height={20} size={20} />
              {tabHeadings[1]}
            </span>
          }
          panel={
            <>
              {loadGraph ? (
                <ApprovalStageExecution />
              ) : (
                <PageSpinner
                  className={css.graphLoadingSpinner}
                  message={getString('pipeline.approvalStage.settingUpStage')}
                />
              )}
            </>
          }
          data-testid={tabHeadings[1]}
          className={cx(css.fullHeight, css.stepGroup)}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={tabHeadings[2]}
          title={
            <span className={css.tab}>
              <Icon name="advanced" height={20} size={20} />
              {tabHeadings[2]}
            </span>
          }
          panel={<ApprovalAdvancedSpecifications />}
          data-testid={tabHeadings[2]}
        />
        {isTemplatesEnabled && isContextTypeNotStageTemplate(contextType) && selectedStage?.stage && (
          <>
            <Expander />
            <SaveTemplateButton data={selectedStage?.stage} type={'Stage'} gitDetails={gitDetails} />
          </>
        )}
      </Tabs>
    </section>
  )
}
