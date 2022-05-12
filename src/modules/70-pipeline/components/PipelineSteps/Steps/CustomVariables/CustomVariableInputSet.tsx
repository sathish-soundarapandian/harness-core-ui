/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, FormInput, MultiTypeInputType, getMultiTypeFromValue, SelectOption } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo, get, isEqual, isUndefined } from 'lodash-es'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import { VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'
export interface CustomVariablesData {
  variables: AllNGVariables[]
  isPropagating?: boolean
  canAddVariable?: boolean
}
export const RegExAllowedInputExpression = /^<\+input>\.(?:allowedValues\((.*?)\))?$/
export interface CustomVariableInputSetExtraProps {
  variableNamePrefix?: string
  domId?: string
  template?: CustomVariablesData
  path?: string
  allValues?: CustomVariablesData
  executionIdentifier?: string
}
export interface CustomVariableInputSetProps extends CustomVariableInputSetExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
  inputSetData?: InputSetData<CustomVariablesData>
  formik?: any
  allowableTypes: MultiTypeInputType[]
}
function CustomVariableInputSetBasic(props: CustomVariableInputSetProps): React.ReactElement {
  const {
    initialValues,
    template,
    stepViewType = StepViewType.Edit,
    path,
    variableNamePrefix = '',
    domId,
    inputSetData,
    formik,
    allValues,
    allowableTypes,
    executionIdentifier
  } = props
  const basePath = path?.length ? `${path}.` : ''
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { executionId } = useQueryParams<Record<string, string>>()
  const { triggerIdentifier } = useParams<Record<string, string>>()
  const formikVariables = get(formik?.values, `${basePath}variables`, [])

  React.useEffect(() => {
    const shouldUseDefaultValue =
      (isUndefined(executionIdentifier) && isUndefined(executionId) && isUndefined(triggerIdentifier)) ||
      triggerIdentifier === 'new'

    const updatedVariables = defaultTo(template?.variables, []).map((templateVariable: AllNGVariables) => {
      const pipelineVariable = defaultTo(allValues?.variables, []).find(
        (variable: AllNGVariables) => variable.name === templateVariable.name
      )
      const formikVariable = formikVariables.find((variable: AllNGVariables) => variable.name === templateVariable.name)
      const defaultValue = shouldUseDefaultValue ? defaultTo(pipelineVariable?.default, '') : ''

      return {
        name: pipelineVariable?.name,
        type: pipelineVariable?.type,
        // do not use defaultTo here as we need to override a possible empty string
        value: formikVariable?.value || defaultValue
      }
    })

    if (!isEqual(formikVariables, updatedVariables)) {
      formik.setFieldValue(`${basePath}variables`, updatedVariables)
    }
  }, [formikVariables, template?.variables, allValues?.variables, executionId, executionIdentifier, triggerIdentifier])

  return (
    <div className={cx(css.customVariablesInputSets, 'customVariables')} id={domId}>
      {stepViewType === StepViewType.StageVariable && initialValues.variables.length > 0 && (
        <section className={css.subHeader}>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('name')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('typeLabel')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('valueLabel')}</Text>
        </section>
      )}
      {template?.variables?.map?.(variable => {
        // find Index from values, not from template variables
        // because the order of the variables might not be the same
        const index = formikVariables.findIndex((fVar: AllNGVariables) => variable.name === fVar.name)

        const value = defaultTo(variable.value, '')
        if (getMultiTypeFromValue(value as string) !== MultiTypeInputType.RUNTIME) {
          return
        }
        const isAllowedValues = RegExAllowedInputExpression.test(value as string)
        const items: SelectOption[] = []
        if (isAllowedValues) {
          const match = (value as string).match(RegExAllowedInputExpression)
          if (match && match?.length > 1) {
            if (variable.type === 'Number') {
              items.push(...match[1].split(',').map(item => ({ label: item, value: parseFloat(item) })))
            } else if (variable.type === 'String') {
              items.push(...match[1].split(',').map(item => ({ label: item, value: item })))
            }
          }
        }
        return (
          <div key={`${variable.name}${index}`} className={css.variableListTable}>
            <Text>{`${variableNamePrefix}${variable.name}`}</Text>
            <Text>{variable.type}</Text>
            <div className={css.valueRow}>
              {variable.type === VariableType.Secret ? (
                <MultiTypeSecretInput
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  name={`${basePath}variables[${index}].value`}
                  disabled={inputSetData?.readonly}
                  label=""
                />
              ) : (
                <>
                  {isAllowedValues ? (
                    <FormInput.MultiTypeInput
                      className="variableInput"
                      name={`${basePath}variables[${index}].value`}
                      label=""
                      useValue
                      selectItems={items}
                      multiTypeInputProps={{
                        allowableTypes,
                        expressions,
                        selectProps: { disabled: inputSetData?.readonly, items: items }
                      }}
                      disabled={inputSetData?.readonly}
                    />
                  ) : (
                    <FormInput.MultiTextInput
                      className="variableInput"
                      name={`${basePath}variables[${index}].value`}
                      multiTextInputProps={{
                        textProps: { type: variable.type === 'Number' ? 'number' : 'text' },
                        allowableTypes,
                        expressions
                      }}
                      label=""
                      disabled={inputSetData?.readonly}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
const CustomVariableInputSet = connect(CustomVariableInputSetBasic)
export { CustomVariableInputSet }
