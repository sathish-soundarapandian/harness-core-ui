/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Container, AllowedTypes } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEmpty, get, set } from 'lodash-es'
import produce from 'immer'
import { connect, FormikContextType } from 'formik'
import cx from 'classnames'
import type { StageElementConfig } from 'services/pipeline-ng'
import DelegateSelectorPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/DelegateSelectorPanel/DelegateSelectorPanel'
import SkipInstancesField from '@pipeline/components/PipelineStudio/SkipInstances/SkipInstances'

import { useStrings } from 'framework/strings'
import { getDefaultMonacoConfig } from '@common/components/MonacoTextField/MonacoTextField'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepMode } from '@pipeline/utils/stepUtils'
import { ConditionalExecutionForm } from './ConditionalExecutionForm'
import { FailureStrategiesInputSetForm } from './FailureStrategiesInputSetForm'
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

export interface StrategyFormInternalProps {
  readonly?: boolean
  path: string
}

export function StrategyFormInternal(
  props: StrategyFormInternalProps & { formik: FormikContextType<any> }
): React.ReactElement {
  const { readonly, path, formik } = props
  const { getString } = useStrings()
  const isChanged = React.useRef(false)

  const formikValue = yamlStringify(get(formik.values, path, ''))
  const [value, setValue] = React.useState(formikValue)

  React.useEffect(() => {
    // do not update values from formik once user has changed the input
    if (!isChanged.current) {
      setValue(formikValue)
    }
  }, [formikValue])

  function handleChange(newValue: string): void {
    try {
      isChanged.current = true
      setValue(newValue)
      const parsed = yamlParse(newValue)
      formik.setValues(
        produce(formik.values, (draft: any) => {
          set(draft, path, parsed)
        })
      )
    } catch (e) {
      // empty block
    }
  }

  function preventSubmit(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.stopPropagation()
    }
  }

  return (
    <div className={css.strategyContainer} onKeyDown={preventSubmit}>
      <Text
        color={Color.GREY_600}
        margin={{ bottom: 'small' }}
        className={css.conditionalExecutionTitle}
        font={{ weight: 'semi-bold' }}
      >
        {getString('pipeline.loopingStrategy.title')}
      </Text>
      <div className={css.editor}>
        <MonacoEditor
          height={300}
          options={getDefaultMonacoConfig(!!readonly)}
          language="yaml"
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}

export const StrategyForm = connect<StrategyFormInternalProps>(StrategyFormInternal)

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
            />
          </div>
        ) : null}
        {!isEmpty(deploymentStageTemplate?.strategy) && (
          <div className={cx(css.nestedAccordions, stepCss.formGroup, css.runTimeWidth)}>
            <StrategyForm readonly={readonly} path={`${path}.strategy`} />
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
