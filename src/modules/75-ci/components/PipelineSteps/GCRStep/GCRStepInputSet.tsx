/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import type { GCRStepProps } from './GCRStep'
import { CIStep } from '../CIStep/CIStep'
import { ArtifactStepCommon } from '../CIStep/ArtifactStepCommon'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GCRStepInputSetBasic: React.FC<GCRStepProps> = ({
  template,
  path,
  readonly,
  allowableTypes,
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
              label: { labelKey: 'pipelineSteps.gcpConnectorLabel', tooltipId: 'gcrConnector' },
              type: Connectors.GCP
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.host) === MultiTypeInputType.RUNTIME && {
            'spec.host': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.projectID) === MultiTypeInputType.RUNTIME && {
            'spec.projectID': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.imageName) === MultiTypeInputType.RUNTIME && {
            'spec.imageName': {}
          })
        }}
        path={path || ''}
        isInputSetView={true}
        template={template}
      />
      <ArtifactStepCommon
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        formik={formik}
        artifactConnectorType={Connectors.GCP}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}

const GCRStepInputSet = connect(GCRStepInputSetBasic)
export { GCRStepInputSet }
