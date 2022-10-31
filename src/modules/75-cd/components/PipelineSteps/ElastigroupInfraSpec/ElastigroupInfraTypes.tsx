/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import type { AllowedTypes } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ElastigroupInfrastructure, StoreConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { getConnectorSchema } from '../PipelineStepsUtil'

export interface ElastigroupInfrastructureTemplate {
  configuration: {
    store: {
      type: string
      spec: {
        files: string
        secretFiles: string
      }
    }
  }
  connectorRef: string
}

export type ConnectorTypes = 'Harness'

export enum fileTypes {
  ENCRYPTED = 'encrypted',
  FILE_STORE = 'fileStore'
}

export interface ElastigroupInfraSpecEditableProps {
  initialValues: ElastigroupInfrastructure
  allValues?: ElastigroupInfrastructure
  onUpdate?: (data: ElastigroupInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ElastigroupInfrastructure
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ElastigroupInfrastructure
  allowableTypes: AllowedTypes
}

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    configuration: Yup.object().shape({
      store: Yup.object().shape({
        type: Yup.string().required(getString('typeLabel')),
        spec: Yup.object().test(
          'spec',
          getString('cd.steps.elastigroup.elastigroupConfigReq'),
          (value: StoreConfig): boolean => {
            if (value.files) {
              return !isEmpty(value.files)
            } else if (value.secretFiles) {
              return !isEmpty(value.secretFiles)
            }
            return false
          }
        )
      })
    })
  })
}
