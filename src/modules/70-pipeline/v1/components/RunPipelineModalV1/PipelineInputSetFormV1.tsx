/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, MultiTypeInputType, IconName, AllowedTypes } from '@harness/uicore'
import cx from 'classnames'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ConfigureOptionsContextProvider } from '@common/components/ConfigureOptions/ConfigureOptionsContext'
import { CICodebaseInputSetFormV1 } from './CICodebaseInputSetFormV1'
import css from '../../../components/PipelineInputSetForm/PipelineInputSetForm.module.scss'

export interface PipelineInputSetFormV1Props {
  path?: string
  executionIdentifier?: string
  readonly?: boolean
  maybeContainerClass?: string
  viewType: StepViewType
  isRunPipelineForm?: boolean
  allowableTypes: AllowedTypes
  viewTypeMetadata?: Record<string, boolean>
  gitAwareForTriggerEnabled?: boolean
  hideTitle?: boolean
  disableRuntimeInputConfigureOptions?: boolean
}

export const stageTypeToIconMap: Record<string, IconName> = {
  Deployment: 'cd-main',
  CI: 'ci-main',
  Pipeline: 'pipeline',
  Custom: 'custom-stage-icon',
  Approval: 'approval-stage-icon'
}

export function PipelineInputSetFormV1Internal(props: PipelineInputSetFormV1Props): React.ReactElement {
  const { path = '', readonly, viewType, maybeContainerClass = '', viewTypeMetadata, hideTitle } = props
  const finalPath = path

  return (
    <Layout.Vertical
      spacing="medium"
      className={cx(css.container, { [maybeContainerClass]: !hideTitle, [css.pipelineStageForm]: !!hideTitle })}
    >
      <CICodebaseInputSetFormV1
        path={finalPath}
        readonly={readonly}
        viewType={viewType}
        viewTypeMetadata={viewTypeMetadata}
      />
    </Layout.Vertical>
  )
}

export function PipelineInputSetFormV1(props: Omit<PipelineInputSetFormV1Props, 'allowableTypes'>): React.ReactElement {
  const { disableRuntimeInputConfigureOptions: disableConfigureOptions } = props
  const { NG_EXECUTION_INPUT } = useFeatureFlags()

  return (
    <ConfigureOptionsContextProvider disableConfigureOptions={!!disableConfigureOptions}>
      <PipelineInputSetFormV1Internal
        {...props}
        allowableTypes={
          NG_EXECUTION_INPUT
            ? [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.EXECUTION_TIME]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
        }
      />
    </ConfigureOptionsContextProvider>
  )
}
