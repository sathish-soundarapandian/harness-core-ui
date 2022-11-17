/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Formik, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { debounce, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StageWhenCondition } from 'services/cd-ng'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import ConditionalExecutionHeader from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionHeader'
import ConditionalExecutionStatus from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionStatus'
import ConditionalExecutionCondition from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionCondition'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import {
  ConditionalExecutionOption,
  PipelineOrStageStatus
} from '../../PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'

export interface ConditionalExecutionProps {
  selectedStage: StageElementWrapper
  isReadonly: boolean

  onUpdate(when: StageWhenCondition): void
}

export default function ConditionalExecution(props: ConditionalExecutionProps): React.ReactElement {
  const {
    selectedStage: { stage },
    onUpdate,
    isReadonly
  } = props

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce(({ status, enableJEXL, condition }: ConditionalExecutionOption): void => {
      onUpdate({
        pipelineStatus: status,
        ...(enableJEXL &&
          !!condition?.trim() && {
            condition: condition?.trim()
          })
      })
    }, 300),
    [onUpdate]
  )

  return (
    <Formik
      initialValues={{
        status: stage?.when?.pipelineStatus || PipelineOrStageStatus.SUCCESS,
        enableJEXL: !!stage?.when?.condition,
        condition: stage?.when?.condition || ''
      }}
      formName="condExecStudio"
      onSubmit={noop}
      validate={debouncedUpdate}
    >
      {(formikProps: FormikProps<ConditionalExecutionOption>) => {
        return (
          <Container width={846}>
            <ConditionalExecutionHeader mode={Modes.STAGE} />
            <Layout.Horizontal
              padding={{ top: 'xxlarge' }}
              margin={{ top: 'medium' }}
              border={{ top: true, color: Color.GREY_200 }}
            >
              <Container width={'48%'} padding={{ right: 'xxlarge' }} border={{ right: true, color: Color.GREY_200 }}>
                <ConditionalExecutionStatus formikProps={formikProps} mode={Modes.STAGE} isReadonly={isReadonly} />
              </Container>
              <Container width={'52%'} padding={{ left: 'xxlarge' }}>
                <ConditionalExecutionCondition formikProps={formikProps} mode={Modes.STAGE} isReadonly={isReadonly} />
              </Container>
            </Layout.Horizontal>
          </Container>
        )
      }}
    </Formik>
  )
}
