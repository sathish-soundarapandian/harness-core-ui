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
import type { SaveCacheS3StepProps } from './SaveCacheS3Step'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheS3StepInputSetBasic: React.FC<SaveCacheS3StepProps> = ({
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
              label: { labelKey: 'pipelineSteps.awsConnectorLabel', tooltipId: 'saveCacheS3Connector' },
              type: Connectors.AWS
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.region) === MultiTypeInputType.RUNTIME && {
            'spec.region': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && {
            'spec.bucket': { tooltipId: 's3Bucket' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.key) === MultiTypeInputType.RUNTIME && {
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
          ...(getMultiTypeFromValue(template?.spec?.endpoint) === MultiTypeInputType.RUNTIME && {
            'spec.endpoint': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && {
            'spec.archiveFormat': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.override) === MultiTypeInputType.RUNTIME && {
            'spec.override': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.pathStyle) === MultiTypeInputType.RUNTIME && {
            'spec.pathStyle': {}
          })
        }}
        path={path || ''}
        template={template}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}

const SaveCacheS3StepInputSet = connect(SaveCacheS3StepInputSetBasic)
export { SaveCacheS3StepInputSet }
