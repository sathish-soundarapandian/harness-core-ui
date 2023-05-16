/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AllowedTypes } from '@harness/uicore';
import { Layout, Container } from '@harness/uicore'
import { isEmpty, get } from 'lodash-es'
import type { FormikContextType } from 'formik';
import { connect } from 'formik'
import cx from 'classnames'
import type { StageElementConfig } from 'services/pipeline-ng'
import DelegateSelectorPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/DelegateSelectorPanel/DelegateSelectorPanel'
import SkipInstancesField from '@pipeline/components/PipelineStudio/SkipInstances/SkipInstances'

import { useStrings } from 'framework/strings'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepMode } from '@pipeline/utils/stepUtils'
import { ConditionalExecutionForm } from './ConditionalExecutionForm'
import { FailureStrategiesInputSetForm } from './FailureStrategiesInputSetForm'
import { LoopingStrategyInputSetForm } from './LoopingStrategyInputSetForm'
import css from '../PipelineInputSetForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface StageAdvancedInputSetFormProps {
  deploymentStageTemplate?: StageElementConfig
  path: string
  readonly?: boolean
  stageIdentifier?: string
  allowableTypes?: AllowedTypes
  delegateSelectors?: string[] | string
  skipInstances?: string | boolean
  stageType: StageType
  viewType?: StepViewType
}

interface SkipInstancesFormProps {
  readonly?: boolean
  path: string
  allowableTypes?: AllowedTypes
  formik?: FormikContextType<any>
}

function SkipInstancesFormInternal(props: SkipInstancesFormProps): React.ReactElement {
  const { readonly, path, formik } = props
  const skipInstancesValue = get(formik?.values, path)

  return (
    <Container margin={{ bottom: 'medium' }}>
      <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
        <Container width="100%">
          <SkipInstancesField
            name={path}
            isReadonly={!!readonly}
            value={skipInstancesValue}
            onUpdate={value => {
              formik?.setFieldValue(path, value)
            }}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export const SkipInstancesForm = connect(SkipInstancesFormInternal)

export function StageAdvancedInputSetForm({
  deploymentStageTemplate,
  path,
  readonly,
  stageIdentifier,
  allowableTypes,
  delegateSelectors = [],
  skipInstances,
  stageType,
  viewType
}: StageAdvancedInputSetFormProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <>
      <div id={`Stage.${stageIdentifier}.Advanced`} className={cx(css.accordionSummary)}>
        <div className={css.inputheader}>{getString('advancedTitle')}</div>
        {!isEmpty(/* istanbul ignore next */ delegateSelectors) && (
          <div className={cx(css.nestedAccordions, stepCss.formGroup, css.runTimeWidth)}>
            <DelegateSelectorPanel
              isReadonly={readonly || false}
              allowableTypes={allowableTypes}
              name={`${path}.delegateSelectors`}
            />
          </div>
        )}

        {!isEmpty(deploymentStageTemplate?.when) && (
          <div className={cx(css.nestedAccordions, stepCss.formGroup)}>
            <ConditionalExecutionForm
              isReadonly={!!readonly}
              path={`${path}.when`}
              allowableTypes={allowableTypes}
              viewType={viewType}
              template={deploymentStageTemplate?.when}
              mode={StepMode.STAGE}
            />
          </div>
        )}
        {!isEmpty(deploymentStageTemplate?.failureStrategies) ? (
          <div className={cx(css.nestedAccordions, stepCss.formGroup, stepCss.md)}>
            <FailureStrategiesInputSetForm
              stageType={stageType}
              readonly={readonly}
              path={`${path}.failureStrategies`}
              viewType={viewType}
              allowableTypes={allowableTypes}
              template={deploymentStageTemplate?.failureStrategies}
            />
          </div>
        ) : null}
        {!isEmpty(deploymentStageTemplate?.strategy) && (
          <div className={cx(css.nestedAccordions, stepCss.formGroup)}>
            <LoopingStrategyInputSetForm
              stageType={stageType}
              viewType={viewType}
              allowableTypes={allowableTypes}
              readonly={readonly}
              path={`${path}.strategy`}
              template={deploymentStageTemplate?.strategy}
            />
          </div>
        )}
        {!isEmpty(skipInstances) && (
          <div className={cx(css.nestedAccordions, stepCss.formGroup, stepCss.md)}>
            <SkipInstancesForm readonly={readonly} path={`${path}.skipInstances`} />
          </div>
        )}
      </div>
    </>
  )
}
