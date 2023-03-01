/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FieldArray, FormikProps } from 'formik'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text
} from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isMultiTypeRuntime } from '@common/utils/utils'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { TerraformCloudRunFormData, TerraformCloudRunStepVariable } from './types'
import { RunTypes, variableTypes } from './helper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformCloudRunStep.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<TerraformCloudRunFormData>
  readonly?: boolean
  allowableTypes: AllowedTypes
  enableOutputVar?: boolean
}): React.ReactElement {
  const { formik, readonly, allowableTypes } = props
  const { values } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <FormikForm>
        <>
          <div className={cx(stepCss.formGroup)}>
            <MultiTypeFieldSelector
              name="spec.spec.variables"
              label={getString('common.variables')}
              isOptional
              allowedTypes={[MultiTypeInputType.FIXED]}
              defaultValueToReset={[]}
              disableTypeSelection={true}
            >
              <FieldArray
                name="spec.spec.variables"
                render={({ push, remove }) => {
                  return (
                    <div className={css.panel}>
                      <div className={css.variables}>
                        <span className={css.label}>Name</span>
                        <span className={css.label}>Type</span>
                        <span className={css.label}>Value</span>
                      </div>
                      {formik.values?.spec?.spec?.variables?.map(({ id }: TerraformCloudRunStepVariable, i: number) => {
                        return (
                          <div className={css.variables} key={id}>
                            <FormInput.Text
                              name={`spec.spec.variables.[${i}].name`}
                              placeholder={getString('name')}
                              disabled={readonly}
                            />
                            <FormInput.Select
                              items={variableTypes}
                              name={`spec.spec.variables.[${i}].type`}
                              placeholder={getString('typeLabel')}
                              disabled={readonly}
                            />
                            <FormInput.MultiTextInput
                              name={`spec.spec.variables.[${i}].value`}
                              placeholder={getString('valueLabel')}
                              multiTextInputProps={{
                                allowableTypes: [MultiTypeInputType.FIXED],
                                expressions,
                                disabled: readonly
                              }}
                              label=""
                              disabled={readonly}
                            />
                            <Button
                              variation={ButtonVariation.ICON}
                              icon="main-trash"
                              data-testid={`remove-var-${i}`}
                              onClick={() => remove(i)}
                              disabled={readonly}
                            />
                          </div>
                        )
                      })}
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        data-testid="add-var"
                        disabled={readonly}
                        onClick={() => push({ name: '', type: 'String', value: '' })}
                      >
                        {getString('addInputVar')}
                      </Button>
                    </div>
                  )
                }}
              />
            </MultiTypeFieldSelector>
          </div>
          <div className={cx(stepCss.formGroup)}>
            <MultiTypeList
              name="spec.spec.targets"
              placeholder={getString('cd.enterTragets')}
              multiTextInputProps={{
                expressions,
                allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                  item => !isMultiTypeRuntime(item)
                ) as AllowedTypes
              }}
              multiTypeFieldSelectorProps={{
                label: (
                  <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                    {getString('pipeline.targets.title')}
                  </Text>
                )
              }}
              style={{
                marginTop: 'var(--spacing-small)',
                marginBottom: 'var(--spacing-small)',
                width: 435
              }}
              disabled={readonly}
            />
          </div>
        </>
        {(values.spec?.runType === RunTypes.Plan || values.spec?.runType === RunTypes.PlanOnly) && (
          <div className={cx(stepCss.formGroup, css.addMarginTop)}>
            <FormMultiTypeCheckboxField
              formik={formik}
              name={'spec.spec.exportTerraformPlanJson'}
              label={getString('cd.exportTerragruntPlanJson')}
              multiTypeTextbox={{ expressions, allowableTypes }}
              disabled={readonly}
            />
            {
              /* istanbul ignore next */ getMultiTypeFromValue(values.spec?.spec?.exportTerraformPlanJson) ===
                MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={(values.spec.spec?.exportTerraformPlanJson || '') as string}
                  type="String"
                  variableName="spec.spec.exportTerraformPlanJson"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={
                    /* istanbul ignore next */ value => formik.setFieldValue('spec.spec.exportTerraformPlanJson', value)
                  }
                  style={{ alignSelf: 'center' }}
                  isReadonly={readonly}
                />
              )
            }
          </div>
        )}
      </FormikForm>
    </>
  )
}
