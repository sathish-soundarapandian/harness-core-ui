/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiTypeInputType, SelectOption } from '@harness/uicore'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { AzureWebAppInfrastructure } from 'services/cd-ng' // add new type here
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { UseStringsReturn } from 'framework/strings'
import { getConnectorSchema } from '../PipelineStepsUtil' // define new schema validations

export const subscriptionLabel = 'cd.steps.azureInfraStep.subscription'
export const resourceGroupLabel = 'common.resourceGroupLabel'

export type AzureWebAppInterface = Omit<AzureWebAppInfrastructure, 'useClusterAdminCredentials'>
export type AzureWebAppInfrastructureTemplate = { [key in keyof AzureWebAppInterface]: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getValue = (item: { label?: string; value?: string } | string | any): string => {
  return typeof item === 'string' ? (item as string) : item?.value
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AzureFieldTypes = { label?: string; value?: string } | string | any
export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    subscriptionId: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(
          getString('common.validation.fieldIsRequired', { name: getString('pipeline.ACR.subscription') })
        )
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: getString(subscriptionLabel) })
            })
          }
          return true
        }
      })
    }),
    resourceGroup: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(
          getString('common.validation.fieldIsRequired', { name: getString(resourceGroupLabel) })
        )
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: getString(resourceGroupLabel) })
            })
          }
          return true
        }
      })
    }),
    webApp: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(getString('common.validation.fieldIsRequired', { name: 'Web App' }))
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: 'Web App' })
            })
          }
          return true
        }
      })
    }),
    deploymentSlot: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(
          getString('common.validation.fieldIsRequired', { name: 'Web App Deployment Slot' })
        )
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({
              message: getString('common.validation.fieldIsRequired', { name: 'Web App Deployment Slot' })
            })
          }
          return true
        }
      })
    })
  })
}
export interface AzureWebAppInfrastructureSpecEditableProps {
  initialValues: AzureWebAppInfrastructure
  allValues?: AzureWebAppInfrastructure
  onUpdate?: (data: AzureWebAppInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: AzureWebAppInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AzureWebAppInfrastructure
  allowableTypes: MultiTypeInputType[]
}
