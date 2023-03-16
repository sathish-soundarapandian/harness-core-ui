/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { TextInput, Layout, Text } from '@harness/uicore'
import { connect } from 'formik'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import type { ResponseInputs } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import css from './PipelineInputParamsV1.module.scss'

export interface PipelineInputParametersV1Props {
  pipelineInputsMetadata?: ResponseInputs | null
  formik?: any
}

export function PipelineInputParametersV1Internal(props: PipelineInputParametersV1Props): React.ReactElement {
  const { formik, pipelineInputsMetadata } = props
  const { getString } = useStrings()

  const handleChange = (key: string, newValue: string) => {
    formik?.setFieldValue(`inputs.${key}`, newValue)
  }

  return (
    <>
      <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
        <Text
          data-name="runmodal-params-title"
          color={Color.BLACK_100}
          font={{ weight: 'semi-bold' }}
          tooltipProps={{
            dataTooltipId: 'runModalParams'
          }}
        >
          {getString('connectors.parameters')}
        </Text>
      </Layout.Horizontal>
      <div className={css.topAccordion}>
        <div className={css.accordionSummary}>
          <div className={css.nestedAccordions}>
            <Layout.Vertical spacing="small">
              {Object.entries(formik?.values?.inputs).map((input, index) => {
                return (
                  <div className={cx(css.group, css.withoutAligning)} key={index}>
                    <div>
                      <TextInput name={`inputs.${input[0]}`} disabled={true} value={`${input[0]}`} />
                    </div>
                    <div className={cx(css.group, css.withoutAligning, css.withoutSpacing)}>
                      <TextInput
                        name={`inputs.${input[1]}`}
                        value={`${input[1]}`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(input[0], e.target.value)}
                        required={pipelineInputsMetadata?.inputs && pipelineInputsMetadata?.inputs[input[0]].required}
                      />
                    </div>
                  </div>
                )
              })}
            </Layout.Vertical>
          </div>
        </div>
      </div>
    </>
  )
}

export const PipelineInputParametersV1 = connect(PipelineInputParametersV1Internal)
