/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, MultiTypeInputType, getMultiTypeFromValue, AllowedTypes } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { cloneDeep, defaultTo, get } from 'lodash-es'
import { connect, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { CustomDeploymentNGVariable } from 'services/cd-ng'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'
export interface CustomVariablesData {
  variables: AllNGVariables[]
  isPropagating?: boolean
  canAddVariable?: boolean
}
export interface CustomVariableInputSetExtraProps {
  variableNamePrefix?: string
  domId?: string
  template?: CustomVariablesData
  path?: string
  allValues?: CustomVariablesData
  executionIdentifier?: string
  isDescriptionEnabled?: boolean
  allowedVarialblesTypes?: VariableType[]
  isDrawerMode?: boolean
}

export interface CustomVariableInputSetProps extends CustomVariableInputSetExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
  inputSetData?: InputSetData<CustomVariablesData>
  allowableTypes: AllowedTypes
  className?: string
}

export interface ConectedCustomVariableInputSetProps extends CustomVariableInputSetProps {
  formik: FormikProps<CustomVariablesData>
}

function CustomVariableInputSetBasic(props: ConectedCustomVariableInputSetProps): React.ReactElement {
  const {
    initialValues,
    template,
    stepViewType = StepViewType.Edit,
    path,
    variableNamePrefix = '',
    domId,
    inputSetData,
    formik,
    allowableTypes,
    className,
    isDrawerMode
  } = props
  const basePath = path?.length ? `${path}.variables` : 'variables'
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const formikVariables = defaultTo(get(formik?.values, basePath), [])
  // get doesn't return defaultValue if it gets null
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  // this was necessary due to absence of YAML validations in run pipeline form. Add such logic here only when absolutely unavoidable
  React.useEffect(() => {
    const mergeTemplateBaseValues = defaultTo(cloneDeep(template?.variables), [])

    let isYamlDirty = false
    mergeTemplateBaseValues.forEach((variable, index) => {
      const isVariablePresentIndex = formikVariables.findIndex(
        (fVar: AllNGVariables) => fVar.name === variable.name && fVar.type === variable.type
      )
      if (isVariablePresentIndex !== -1) {
        mergeTemplateBaseValues[index].value = formikVariables[isVariablePresentIndex].value
      } else {
        isYamlDirty = true
      }
    })

    if (isYamlDirty) {
      formik.setFieldValue(basePath, clearRuntimeInput(mergeTemplateBaseValues))
    }
  }, [])

  return (
    <div className={cx(css.customVariablesInputSets, 'customVariables', className)} id={domId}>
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

        return (
          <div key={`${variable.name}${index}`} className={css.variableListTable}>
            <Text>{`${variableNamePrefix}${variable.name}`}</Text>
            <Text>{variable.type}</Text>
            <div className={css.valueRow}>
              {(variable.type as CustomDeploymentNGVariable) === VariableType.Connector ? (
                <FormMultiTypeConnectorField
                  name={`${basePath}[${index}].value`}
                  label=""
                  placeholder={getString('connectors.selectConnector')}
                  disabled={inputSetData?.readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, disabled: inputSetData?.readonly, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  setRefValue
                  connectorLabelClass="connectorVariableField"
                  enableConfigureOptions={false}
                  isDrawerMode={isDrawerMode}
                  type={[]}
                />
              ) : variable.type === VariableType.Secret ? (
                <MultiTypeSecretInput
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  name={`${basePath}[${index}].value`}
                  disabled={inputSetData?.readonly}
                  label=""
                />
              ) : (
                <>
                  <TextFieldInputSetView
                    className="variableInput"
                    name={`${basePath}[${index}].value`}
                    multiTextInputProps={{
                      textProps: { type: variable.type === 'Number' ? 'number' : 'text' },
                      allowableTypes,
                      expressions,
                      defaultValueToReset: ''
                    }}
                    label=""
                    disabled={inputSetData?.readonly}
                    template={template}
                    fieldPath={`variables[${index}].value`}
                    variableNamePath={`${basePath}[${index}].name`}
                  />
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
const CustomVariableInputSet = connect<CustomVariableInputSetProps, CustomVariablesData>(CustomVariableInputSetBasic)

export { CustomVariableInputSet }
