/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ECSRollingDeployStepElementConfig } from '@pipeline/utils/types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ECSRollingDeployStep.module.scss'

export interface ECSRollingDeployStepInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: ECSRollingDeployStepElementConfig
    path?: string
    readonly?: boolean
    allValues?: ECSRollingDeployStepElementConfig
  }
}

const ECSRollingDeployStepInputSet = (props: ECSRollingDeployStepInputSetProps): React.ReactElement => {
  const { inputSetData, allowableTypes } = props
  const { template, path, readonly } = inputSetData
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.spec?.sameAsAlreadyRunningInstances) === MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal
          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          className={cx(stepCss.formGroup, stepCss.md)}
          margin={{ top: 'medium' }}
        >
          <FormMultiTypeCheckboxField
            className={css.checkbox}
            name={`${prefix}spec.sameAsAlreadyRunningInstances`}
            label={getString('cd.ecsRollingDeployStep.sameAsAlreadyRunningInstances')}
            disabled={readonly}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
          />
        </Layout.Horizontal>
      )}

      {getMultiTypeFromValue(template?.spec?.forceNewDeployment) === MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal
          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          className={cx(stepCss.formGroup, stepCss.md)}
          margin={{ top: 'medium' }}
        >
          <FormMultiTypeCheckboxField
            className={css.checkbox}
            name={`${prefix}spec.forceNewDeployment`}
            label={getString('cd.ecsRollingDeployStep.forceNewDeployment')}
            disabled={readonly}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
          />
        </Layout.Horizontal>
      )}
    </>
  )
}

export const ECSRollingDeployStepInputSetMode = connect(ECSRollingDeployStepInputSet)
