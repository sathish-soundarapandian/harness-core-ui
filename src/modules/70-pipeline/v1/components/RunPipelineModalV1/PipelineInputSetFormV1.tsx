/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import cx from 'classnames'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ConfigureOptionsContextProvider } from '@common/components/ConfigureOptions/ConfigureOptionsContext'
import type { ResponseInputs, PipelineV1InfoConfig } from 'services/pipeline-ng'
import { CICodebaseInputSetFormV1 } from './CICodebaseInputSetFormV1'
import { PipelineInputParametersV1 } from './PipelineInputParamsV1/PipelineInputParametersV1'
import css from '../../../components/PipelineInputSetForm/PipelineInputSetForm.module.scss'

export interface PipelineInputSetFormV1Props {
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
  inputSets?: ResponseInputs | null
  hasRuntimeInputs?: boolean
  hasCodebaseInputs?: boolean
  originalPipeline?: PipelineV1InfoConfig
  connectorRef?: string
  repoIdentifier?: string
  formik: any
}

export function PipelineInputSetFormV1Internal(props: PipelineInputSetFormV1Props): React.ReactElement {
  const {
    readonly,
    viewType,
    maybeContainerClass = '',
    viewTypeMetadata,
    hideTitle,
    hasCodebaseInputs,
    hasRuntimeInputs,
    connectorRef,
    repoIdentifier,
    inputSets,
    formik
  } = props

  return (
    <Layout.Vertical
      spacing="medium"
      className={cx(css.container, { [maybeContainerClass]: !hideTitle, [css.pipelineStageForm]: !!hideTitle })}
    >
      {hasCodebaseInputs ? (
        <CICodebaseInputSetFormV1
          readonly={readonly}
          viewType={viewType}
          viewTypeMetadata={viewTypeMetadata}
          originalPipeline={props.originalPipeline}
          connectorRef={connectorRef}
          repoIdentifier={repoIdentifier}
        />
      ) : null}
      {hasRuntimeInputs ? <PipelineInputParametersV1 pipelineInputsMetadata={inputSets} formik={formik} /> : null}
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
