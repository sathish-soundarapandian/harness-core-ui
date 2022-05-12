/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { SaveCacheGCSStepProps } from './SaveCacheGCSStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheGCSStepInputSetBasic: React.FC<SaveCacheGCSStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  formik
}) => {
  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: { labelKey: 'pipelineSteps.gcpConnectorLabel', tooltipId: 'gcpConnector' },
              type: Connectors.DOCKER
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && {
            'spec.bucket': { tooltipId: 'gcsBucket' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.key as string) === MultiTypeInputType.RUNTIME && {
            'spec.key': { tooltipId: 'saveCacheKey' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.sourcePaths) === MultiTypeInputType.RUNTIME && {
            'spec.sourcePaths': {}
          })
        }}
        path={path || ''}
        isInputSetView={true}
        formik={formik}
        template={template}
      />
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && {
            'spec.archiveFormat': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.override) === MultiTypeInputType.RUNTIME && { 'spec.override': {} })
        }}
        path={path || ''}
        template={template}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}

const SaveCacheGCSStepInputSet = connect(SaveCacheGCSStepInputSetBasic)
export { SaveCacheGCSStepInputSet }
