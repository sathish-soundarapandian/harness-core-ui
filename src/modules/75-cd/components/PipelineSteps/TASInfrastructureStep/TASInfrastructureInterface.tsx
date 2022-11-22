/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@harness/uicore'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { TanzuApplicationServiceInfrastructure } from 'services/cd-ng' // add new type here
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { UseStringsReturn } from 'framework/strings'
import { getConnectorSchema } from '../PipelineStepsUtil' // define new schema validations

export const organizationLabel = 'orgLabel'
export const spaceGroupLabel = 'cd.steps.tasInfra.space'

export type TASInterface =
  // Omit<
  TanzuApplicationServiceInfrastructure
// , 'useClusterAdminCredentials'>
export type TASInfrastructureTemplate = { [key in keyof TASInterface]: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getValue = (item: { label?: string; value?: string } | string | any): string => {
  return typeof item === 'string' ? (item as string) : item?.value
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TASFieldTypes = { label?: string; value?: string } | string | any
export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    organization: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore next */ if (typeof value === 'string') {
        return Yup.string().required(
          getString('common.validation.fieldIsRequired', { name: getString(organizationLabel) })
        )
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: getString(organizationLabel) })
            })
          }
          return true
        }
      })
    }),
    space: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore next */ if (typeof value === 'string') {
        return Yup.string().required(
          getString('common.validation.fieldIsRequired', { name: getString(spaceGroupLabel) })
        )
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: getString(spaceGroupLabel) })
            })
          }
          return true
        }
      })
    })
  })
}
export interface TASInfrastructureSpecEditableProps {
  initialValues: TanzuApplicationServiceInfrastructure
  allValues?: TanzuApplicationServiceInfrastructure
  onUpdate?: (data: TanzuApplicationServiceInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: TASInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TanzuApplicationServiceInfrastructure
  allowableTypes: AllowedTypes
}
