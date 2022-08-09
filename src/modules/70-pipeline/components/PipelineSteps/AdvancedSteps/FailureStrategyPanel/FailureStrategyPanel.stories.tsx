/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Formik } from 'formik'
import { Button, Card, H3 } from '@blueprintjs/core'
import { identity } from 'lodash-es'
import * as Yup from 'yup'

import { stringify } from '@common/utils/YamlHelperMethods'
import { TestWrapper } from '@common/utils/testUtils'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import FailureStrategyPanel from './FailureStrategyPanel'
import type { AllFailureStrategyConfig } from './utils'
import { getFailureStrategiesValidationSchema } from './validation'

export default {
  title: 'Pipelines / Pipeline Steps / Failure Strategies',
  component: FailureStrategyPanel
} as Meta

interface BasicArgs {
  data: {
    failureStrategies?: AllFailureStrategyConfig[]
  }
  mode: Modes
  stageType?: StageType
}

export const Basic: Story<BasicArgs> = args => {
  return (
    <TestWrapper>
      <Formik
        initialValues={args.data}
        validationSchema={Yup.object().shape({
          failureStrategies: getFailureStrategiesValidationSchema(identity).required()
        })}
        onSubmit={() => void 0}
      >
        {formik => {
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
              <Card>
                <H3>Failure Strategies</H3>
                <FailureStrategyPanel
                  formikProps={formik}
                  mode={args.mode}
                  stageType={args.stageType || StageType.DEPLOY}
                  isReadonly={false}
                />
                <Button data-testid="test-submit" onClick={() => formik.submitForm()}>
                  Submit
                </Button>
              </Card>
              <Card>
                <pre data-testid="code-output">{stringify(formik.values)}</pre>
              </Card>
            </div>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

Basic.args = {
  data: {
    failureStrategies: []
  },
  mode: Modes.STEP
}
