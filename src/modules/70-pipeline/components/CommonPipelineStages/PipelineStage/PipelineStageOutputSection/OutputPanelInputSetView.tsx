/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, MultiTypeInputType, getMultiTypeFromValue, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { PipelineStageOutputs } from 'services/pipeline-ng'
import type { ConectedOutputPanelInputSetProps, OutputPanelInputSetProps, PipelineStageOutputData } from './utils'
import css from './PipelineStageOutputSection.module.scss'

function OutputPanelInputSetBasic(props: ConectedOutputPanelInputSetProps): React.ReactElement {
  const { template, path, formik, allowableTypes, readonly } = props
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const formikOutputs = defaultTo(get(formik?.values, path), []) as PipelineStageOutputs[]

  return (
    <>
      <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'huge', right: 0, bottom: 'medium' }}>
        <Text
          color={Color.BLACK_100}
          font={{ weight: 'semi-bold' }}
          icon={'template-inputs'}
          iconProps={{ size: 18, color: Color.PRIMARY_7, margin: { right: 'xsmall' } }}
        >
          {getString('pipeline.pipelineChaining.pipelineOutputs')}
        </Text>
      </Layout.Horizontal>
      <div className={css.outputPanelInputSetsContainer}>
        {template.outputs?.length > 0 && (
          <section className={css.subHeader}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('name')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('valueLabel')}</Text>
          </section>
        )}
        {template.outputs?.map?.(output => {
          // find index from values, not from template outputs
          // because the order of the outputs might not be the same
          const index = formikOutputs.findIndex((fOutput: PipelineStageOutputs) => output.name === fOutput.name)
          const value = defaultTo(output.value, '')
          if (getMultiTypeFromValue(value as string) !== MultiTypeInputType.RUNTIME) {
            return
          }

          return (
            <div key={`${output.name}${index}`} className={css.outputListTable}>
              <Text>{output.name}</Text>
              <div className={css.outputValueRow}>
                <TextFieldInputSetView
                  name={`${path}[${index}].value`}
                  template={template}
                  fieldPath={`outputs[${index}].value`}
                  multiTextInputProps={{
                    textProps: { type: 'text' },
                    allowableTypes,
                    expressions,
                    defaultValueToReset: ''
                  }}
                  label=""
                  disabled={readonly}
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

const OutputPanelInputSetView = connect<OutputPanelInputSetProps, PipelineStageOutputData>(OutputPanelInputSetBasic)
export { OutputPanelInputSetView }
