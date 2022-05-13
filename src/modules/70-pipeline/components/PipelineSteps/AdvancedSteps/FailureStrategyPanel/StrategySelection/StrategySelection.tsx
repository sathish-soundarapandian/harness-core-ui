/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormGroup, Intent } from '@blueprintjs/core'
import { connect, FormikContextType, FieldArray } from 'formik'
import { get, difference } from 'lodash-es'
import { MultiTextInput, Button, MultiTypeInputType } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import cx from 'classnames'

import { errorCheck } from '@common/utils/formikHelpers'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { Strategy } from '@pipeline/utils/FailureStrategyUtils'

import { StrategyStepsList } from './StrategyStepsList'
import css from './StrategySelection.module.scss'

/**
 * NOTE: Failure strategies do not support runtime inputs
 */

export interface BaseStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContextType<any>
  name: string
  parentStrategy?: Strategy
  allowedStrategies: Strategy[]
  disabled?: boolean
}

export function ManualInterventionStep(props: BaseStepProps): React.ReactElement {
  const { formik, parentStrategy, allowedStrategies, name, disabled } = props

  const { getString } = useStrings()

  return (
    <div className={css.step}>
      <FormMultiTypeDurationField
        name={`${name}.timeout`}
        label={getString('pipelineSteps.timeoutLabel')}
        className={css.sm}
        multiTypeDurationProps={{
          enableConfigureOptions: false,
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
        }}
        disabled={disabled}
      />
      <StrategySelection
        label={getString('pipeline.failureStrategies.fieldLabels.onTimeoutLabel')}
        name={`${name}.onTimeout.action`}
        formik={formik}
        parentStrategy={Strategy.ManualIntervention}
        allowedStrategies={difference(allowedStrategies, [
          Strategy.ManualIntervention,
          parentStrategy || Strategy.ManualIntervention,
          Strategy.Retry
        ])}
        disabled={disabled}
      />
    </div>
  )
}

export function RetryStep(props: BaseStepProps): React.ReactElement {
  const { formik, parentStrategy, allowedStrategies, name, disabled } = props
  const { getString } = useStrings()
  const uids = React.useRef<string[]>([])
  const retryIntervalsFieldName = `${name}.retryIntervals`
  const retryCountFieldName = `${name}.retryCount`

  const intervals: string[] = get(formik.values, retryIntervalsFieldName) || []
  const retryCountHasError = errorCheck(retryCountFieldName, formik)
  const intent = retryCountHasError ? Intent.DANGER : Intent.NONE
  const helperText = retryCountHasError ? get(formik?.errors, retryCountFieldName) : null
  const retryCountValue = get(formik?.values, retryCountFieldName, '')

  /**
   * We are using `MultiTextInput` here because we want to
   * parse the value to an integer (whenever possible)
   *
   * It is not possible when using `FormInput.MultiTextInput`
   */
  return (
    <div className={cx(css.step, css.retryStep)}>
      <FormGroup
        label={getString('pipeline.failureStrategies.fieldLabels.retryCountLabel')}
        labelFor={retryCountFieldName}
        helperText={helperText}
        intent={intent}
        className={css.sm}
      >
        <MultiTextInput
          textProps={{
            type: 'number',
            min: 0,
            name: retryCountFieldName
          }}
          name={retryCountFieldName}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          value={retryCountValue}
          onChange={newValue => {
            const parsedValue = parseInt(newValue as string)

            formik.setFieldValue(retryCountFieldName, Number.isNaN(parsedValue) ? newValue : parsedValue)
            formik.setFieldTouched(retryCountFieldName, true)
          }}
          disabled={disabled}
        />
      </FormGroup>
      <MultiTypeFieldSelector
        name={retryIntervalsFieldName}
        label={getString('pipeline.failureStrategies.fieldLabels.retryIntervalsLabel')}
        defaultValueToReset={['1d']}
        disableTypeSelection
        disabled={disabled}
      >
        <FieldArray name={retryIntervalsFieldName}>
          {({ push, remove }) => {
            function handleAdd(): void {
              uids.current.push(uuid())
              push('')
            }

            return (
              <div className={cx(css.retryStepIntervals, css.sm)}>
                {intervals.map((_, i) => {
                  // generated uuid if they are not present
                  if (!uids.current[i]) {
                    uids.current[i] = uuid()
                  }

                  const key = uids.current[i]

                  function handleRemove(): void {
                    uids.current.splice(i, 1)
                    remove(i)
                  }

                  return (
                    <div className={css.row} key={key}>
                      <FormMultiTypeDurationField
                        name={`${retryIntervalsFieldName}[${i}]`}
                        label=""
                        skipErrorsIf={form => typeof get(form?.errors, retryIntervalsFieldName) === 'string'}
                        multiTypeDurationProps={{
                          enableConfigureOptions: false,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                          defaultValueToReset: ''
                        }}
                        disabled={disabled}
                      />
                      <Button
                        minimal
                        small
                        icon="main-trash"
                        className={css.removeBtn}
                        onClick={handleRemove}
                        data-testid={`remove-retry-interval-${i}`}
                        disabled={disabled}
                      />
                    </div>
                  )
                })}
                {typeof retryCountValue !== 'number' || intervals.length < retryCountValue ? (
                  <Button
                    icon="plus"
                    minimal
                    intent="primary"
                    data-testid="add-retry-interval"
                    onClick={handleAdd}
                    disabled={disabled}
                  >
                    {getString('add')}
                  </Button>
                ) : null}
              </div>
            )
          }}
        </FieldArray>
      </MultiTypeFieldSelector>
      <StrategySelection
        label={getString('pipeline.failureStrategies.fieldLabels.onRetryFailureLabel')}
        name={`${name}.onRetryFailure.action`}
        formik={formik}
        disabled={disabled}
        parentStrategy={Strategy.Retry}
        allowedStrategies={difference(allowedStrategies, [Strategy.Retry, parentStrategy || Strategy.Retry])}
      />
    </div>
  )
}

export interface StrategySelectionProps {
  label: string
  name: string
  allowedStrategies: Strategy[]
  parentStrategy?: Strategy
  disabled?: boolean
}

export interface ConnectedStrategySelectionProps extends StrategySelectionProps {
  formik: FormikContextType<Record<string, never>>
}

export function StrategySelection(props: ConnectedStrategySelectionProps): React.ReactElement {
  const { name, label, formik, allowedStrategies, parentStrategy, disabled } = props

  const typePath = `${name}.type`
  const specPath = `${name}.spec`
  const value: Strategy | undefined = get(formik.values, typePath)

  function handleOnChange(): void {
    formik.setFieldValue(specPath, undefined)
  }

  return (
    <FormGroup label={label} labelFor={name}>
      <StrategyStepsList
        allowedStrategies={allowedStrategies}
        name={typePath}
        formik={formik}
        disabled={disabled}
        onChange={handleOnChange}
      />
      {value === Strategy.ManualIntervention ? (
        <ManualInterventionStep
          name={specPath}
          formik={formik}
          parentStrategy={parentStrategy}
          allowedStrategies={allowedStrategies}
          disabled={disabled}
        />
      ) : null}
      {value === Strategy.Retry ? (
        <RetryStep
          name={specPath}
          formik={formik}
          parentStrategy={parentStrategy}
          allowedStrategies={allowedStrategies}
          disabled={disabled}
        />
      ) : null}
    </FormGroup>
  )
}

export default connect<StrategySelectionProps>(StrategySelection)
