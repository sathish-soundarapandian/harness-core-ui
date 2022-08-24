/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { variableSchema } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import { InstanceScriptTypes } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraSpecifications/DeploymentInfraSpecifications'
import type { ShellScriptInlineSource, StoreConfigWrapper } from 'services/cd-ng'

type CustomDeploymentInfraNGVariable = {
  value?: number | string
  id?: string
  name?: string
  type?: 'String' | 'Secret' | 'Connector'
}

interface InstanceAttributeVariable {
  id?: string
  fieldName?: string
  jsonPath?: string
  description?: string
}

export interface DeploymentInfra {
  variables?: Array<CustomDeploymentInfraNGVariable>
  fetchInstancesScript?: {
    store?: StoreConfigWrapper | ShellScriptInlineSource
  }
  instancesListPath?: string
  instanceAttributes?: Array<InstanceAttributeVariable>
}

export function getValidationSchema(getString: UseStringsReturn['getString']): any {
  return Yup.object().shape({
    variables: variableSchema(getString),
    fetchInstancesScript: Yup.object().shape({
      store: Yup.object().shape({
        type: Yup.string(),
        spec: Yup.object()
          .when('type', {
            is: value => value === InstanceScriptTypes.Inline,
            then: Yup.object().shape({
              content: Yup.string()
                .trim()
                .required(getString('pipeline.customDeployment.errors.fetchScriptBodyRequired'))
            })
          })
          .when('type', {
            is: value => value === InstanceScriptTypes.FileStore,
            then: Yup.object().shape({
              store: Yup.object({
                spec: Yup.object().shape({
                  /* istanbul ignore next */
                  files: Yup.lazy((value): Yup.Schema<unknown> => {
                    if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
                      Yup.array(Yup.string().trim().required(getString?.('cd.pathCannotBeEmpty')))
                        .required(getString?.('cd.filePathRequired'))
                        .min(1, getString?.('cd.filePathRequired'))
                        .ensure()
                    }
                    return Yup.string().required(getString('cd.filePathRequired'))
                  })
                })
              })
            })
          })
      })
    }),
    instancesListPath: Yup.string().required(getString('pipeline.ci.validations.pathRequiredForHostPath')),
    instanceAttributes: Yup.array()
      .of(
        Yup.object().shape({
          fieldName: Yup.string().required(getString('common.validation.nameIsRequired')),
          jsonPath: Yup.string().required(getString('common.validation.valueIsRequired'))
        })
      )
      .min(1, getString?.('cd.filePathRequired'))
      .ensure()
  })
}
