/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, Layout } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { StepElementConfig } from 'services/cd-ng'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeCheckboxField } from '@common/components'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ECSRollingDeployStepInitialValues } from '@pipeline/utils/types'
import css from './ECSRollingDeployStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSRollingDeployStepInputSetProps {
  initialValues: ECSRollingDeployStepInitialValues
  onUpdate?: (data: StepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: StepElementConfig) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ECSRollingDeployStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export const ECSRollingDeployStepInputSet: React.FC<ECSRollingDeployStepInputSetProps> = ({
  inputSetData,
  allowableTypes
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name={`${isEmpty(inputSetData.path) ? '' : `${inputSetData.path}.`}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: inputSetData.readonly
            }}
            disabled={inputSetData.readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(inputSetData.template?.spec?.sameAsAlreadyRunningInstances) ===
        MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal
          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          className={cx(stepCss.formGroup, stepCss.sm)}
          margin={{ top: 'small', bottom: 'medium' }}
        >
          <FormMultiTypeCheckboxField
            name={`${isEmpty(inputSetData.path) ? '' : `${inputSetData.path}.`}spec.sameAsAlreadyRunningInstances`}
            label={getString('cd.ecsRollingDeployStep.sameAsAlreadyRunningInstances')}
            multiTypeTextbox={{ expressions, allowableTypes, disabled: inputSetData.readonly }}
            disabled={inputSetData.readonly}
            className={css.checkbox}
          />
        </Layout.Horizontal>
      )}

      {getMultiTypeFromValue(inputSetData.template?.spec?.forceNewDeployment) === MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal
          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          className={cx(stepCss.formGroup, stepCss.sm)}
          margin={{ top: 'small', bottom: 'medium' }}
        >
          <FormMultiTypeCheckboxField
            name={`${isEmpty(inputSetData.path) ? '' : `${inputSetData.path}.`}spec.forceNewDeployment`}
            label={getString('cd.ecsRollingDeployStep.forceNewDeployment')}
            multiTypeTextbox={{ expressions, allowableTypes, disabled: inputSetData.readonly }}
            disabled={inputSetData.readonly}
            className={css.checkbox}
          />
        </Layout.Horizontal>
      )}
    </>
  )
}
