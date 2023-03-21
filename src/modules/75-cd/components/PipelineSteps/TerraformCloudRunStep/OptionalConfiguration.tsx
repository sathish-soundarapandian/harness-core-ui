/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { AllowedTypes, FormikForm, getMultiTypeFromValue, MultiTypeInputType, Text } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isMultiTypeRuntime } from '@common/utils/utils'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import type { TerraformCloudRunFormData } from './types'
import { RunTypes } from './helper'

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
        <div className={cx(stepCss.formGroup)}>
          <MultiTypeMap
            name="spec.spec.variables"
            valueMultiTextInputProps={{
              expressions,
              allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                item => !isMultiTypeRuntime(item)
              ) as AllowedTypes
            }}
            multiTypeFieldSelectorProps={{
              disableTypeSelection: true,
              label: (
                <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                  {getString('common.variables')}
                </Text>
              )
            }}
            disabled={readonly}
          />
        </div>

        {values.spec?.runType !== RunTypes.RefreshState && (
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
        )}

        {(values.spec?.runType === RunTypes.Plan || values.spec?.runType === RunTypes.PlanOnly) && (
          <div className={cx(stepCss.formGroup, css.addMarginTop)}>
            <FormMultiTypeCheckboxField
              formik={formik}
              name={'spec.spec.exportTerraformPlanJson'}
              label={getString('cd.exportTerraformPlanJson')}
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

        {(values.spec?.runType === RunTypes.PlanAndApply || values.spec?.runType === RunTypes.PlanAndDestroy) && (
          <div className={cx(stepCss.formGroup)}>
            <FormMultiTypeCheckboxField
              formik={formik}
              name={'spec.spec.overridePolicies'}
              label={getString('pipeline.terraformStep.overridePoliciesLabel')}
              multiTypeTextbox={{ expressions, allowableTypes }}
              disabled={readonly}
            />
            {getMultiTypeFromValue(values.spec?.spec?.overridePolicies) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={(values.spec?.spec?.overridePolicies || '') as string}
                type="String"
                variableName="spec.spec.overridePolicies"
                showRequiredField={false}
                showDefaultField={false}
                onChange={
                  /* istanbul ignore next */ value => formik?.setFieldValue('spec.spec.overridePolicies', value)
                }
                style={{ alignSelf: 'center' }}
                isReadonly={readonly}
              />
            )}
          </div>
        )}
      </FormikForm>
    </>
  )
}
