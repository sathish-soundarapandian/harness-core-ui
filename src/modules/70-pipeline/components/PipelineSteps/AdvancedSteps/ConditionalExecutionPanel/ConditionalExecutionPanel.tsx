/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Formik } from '@harness/uicore'
import { debounce, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Color } from '@harness/design-system'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { Values } from '../../../PipelineStudio/StepCommands/StepCommandTypes'
import ConditionalExecutionPanelHeader from './ConditionalExecutionHeader'
import ConditionalExecutionPanelStatus from './ConditionalExecutionStatus'
import ConditionalExecutionPanelCondition from './ConditionalExecutionCondition'
import { ConditionalExecutionOption, PipelineOrStageStatus } from './ConditionalExecutionPanelUtils'

export interface ConditionalExecutionPanelProps {
  formikProps: FormikProps<Pick<Values, 'when'>>
  mode: Modes
  isReadonly: boolean
}

export default function ConditionalExecutionPanel(props: ConditionalExecutionPanelProps): React.ReactElement {
  const { formikProps, mode, isReadonly } = props

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce(({ status, enableJEXL, condition }: ConditionalExecutionOption): void => {
      formikProps.setFieldValue('when', {
        stageStatus: status,
        ...(enableJEXL &&
          !!condition?.trim() && {
            condition: condition?.trim()
          })
      })
    }, 300),
    [formikProps]
  )

  return (
    <Formik
      initialValues={
        {
          status: formikProps.values.when?.stageStatus || PipelineOrStageStatus.SUCCESS,
          enableJEXL: !!formikProps.values.when?.condition,
          condition: formikProps.values.when?.condition
        } as ConditionalExecutionOption
      }
      formName="conditionalExecution"
      onSubmit={noop}
      validate={debouncedUpdate}
    >
      {(panelFormikProps: FormikProps<ConditionalExecutionOption>) => {
        return (
          <>
            <ConditionalExecutionPanelHeader mode={mode} />
            <Container
              border={{ top: true, bottom: true, color: Color.GREY_200 }}
              padding={{ bottom: 'small', top: 'medium' }}
              margin={{ top: 'medium' }}
            >
              <ConditionalExecutionPanelStatus formikProps={panelFormikProps} isReadonly={isReadonly} mode={mode} />
            </Container>
            <Container padding={{ top: 'medium' }}>
              <ConditionalExecutionPanelCondition formikProps={panelFormikProps} isReadonly={isReadonly} mode={mode} />
            </Container>
          </>
        )
      }}
    </Formik>
  )
}
