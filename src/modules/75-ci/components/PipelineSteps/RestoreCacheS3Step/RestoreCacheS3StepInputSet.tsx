/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import type { RestoreCacheS3StepProps } from './RestoreCacheS3Step'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheS3StepInputSet: React.FC<RestoreCacheS3StepProps> = ({
  template,
  path,
  readonly,
  stepViewType
}) => {
  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: { labelKey: 'pipelineSteps.awsConnectorLabel', tooltipId: 'restoreCacheAwsConnector' },
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
            'spec.key': { tooltipId: 'restoreCacheKey' }
          })
        }}
        path={path || ''}
        isInputSetView={true}
        template={template}
      />
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && {
            'spec.archiveFormat': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.pathStyle) === MultiTypeInputType.RUNTIME && {
            'spec.pathStyle': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.failIfKeyNotFound) === MultiTypeInputType.RUNTIME && {
            'spec.failIfKeyNotFound': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.endpoint) === MultiTypeInputType.RUNTIME && {
            'spec.endpoint': {}
          })
        }}
        path={path || ''}
        template={template}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}
