/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Formik, MultiTypeInputType, Text } from '@wings-software/uicore'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepWidgetWithFormikRef, StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

class StepTestFactory extends AbstractStepFactory {
  protected type = 'test-factory'

  reset(): void {
    this.stepBank.clear()
    this.stepIconMap.clear()
  }
}

export const factory = new StepTestFactory()

function FormikTestWrapper(props: StepWidgetProps): React.ReactElement {
  const { getString } = useStrings()
  const stepRef = React.useRef(null)
  return (
    <Formik
      formName="stepTestUtilForm"
      initialValues={props.initialValues}
      validate={values => {
        return (
          factory.getStep(props.type)?.validateInputSet({
            data: values,
            template: props.template,
            getString,
            viewType: StepViewType.DeploymentForm
          }) || {}
        )
      }}
      onSubmit={data => props.onUpdate?.(data)}
    >
      {({ errors, submitForm }) => (
        <>
          <StepWidgetWithFormikRef ref={stepRef} {...props} />
          <Text>Errors</Text>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
          <Button
            text="Submit"
            intent="primary"
            onClick={e => {
              e.stopPropagation()
              submitForm()
            }}
          />
        </>
      )}
    </Formik>
  )
}

export interface TestStepWidgetProps extends Omit<StepWidgetProps, 'factory' | 'allowableTypes'> {
  testWrapperProps?: TestWrapperProps
}

export function TestStepWidgetWithoutRef(props: TestStepWidgetProps, ref: StepFormikFowardRef): React.ReactElement {
  const type = props.stepViewType
  return (
    <TestWrapper {...props.testWrapperProps}>
      {type === StepViewType.InputSet || type === StepViewType.DeploymentForm ? (
        <FormikTestWrapper
          factory={factory}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          {...props}
        />
      ) : (
        <StepWidgetWithFormikRef
          ref={ref}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          factory={factory}
          {...props}
        />
      )}
    </TestWrapper>
  )
}

export const TestStepWidget = React.forwardRef(TestStepWidgetWithoutRef)
