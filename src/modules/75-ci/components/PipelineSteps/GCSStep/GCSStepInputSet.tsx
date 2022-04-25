/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { GCSStepProps } from './GCSStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GCSStepInputSet: React.FC<GCSStepProps> = ({ template, path, readonly, stepViewType }) => {
  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: { labelKey: 'pipelineSteps.gcpConnectorLabel', tooltipId: 'gcsConnector' },
              type: Connectors.GCP
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && {
            'spec.bucket': { tooltipId: 'gcsBucket' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.sourcePath) === MultiTypeInputType.RUNTIME && {
            'spec.sourcePath': {}
          })
        }}
        path={path || ''}
      />
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.target) === MultiTypeInputType.RUNTIME && {
            'spec.target': { tooltipId: 'gcsS3Target' }
          })
        }}
        path={path || ''}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}
