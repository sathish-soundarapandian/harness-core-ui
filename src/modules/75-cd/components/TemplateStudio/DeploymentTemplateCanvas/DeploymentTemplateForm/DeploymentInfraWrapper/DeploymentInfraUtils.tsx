/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { uniqBy } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { InstanceScriptTypes } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraSpecifications/DeploymentInfraSpecifications'
import { NameSchema } from '@common/utils/Validation'

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    variables: Yup.array().of(
      Yup.object({
        name: Yup.string().required(getString('common.validation.nameIsRequired')),
        type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
      })
    ),
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
            /* istanbul ignore next */
            then: Yup.object().shape({
              /* istanbul ignore next */
              files: Yup.lazy((value): Yup.Schema<unknown> => {
                if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
                  return Yup.array().of(Yup.string().required(getString('pipeline.manifestType.pathRequired')))
                }
                return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
              })
            })
          })
      })
    }),
    instancesListPath: Yup.string().required(getString('pipeline.ci.validations.pathRequiredForHostPath')),
    instanceAttributes: Yup.array()
      .of(
        Yup.object().shape({
          name: NameSchema(),
          jsonPath: Yup.string().required(getString('common.validation.valueIsRequired'))
        })
      )
      .test('keysShouldBeUnique', getString('pipeline.customDeployment.validations.nameUnique'), values => {
        if (!values) return true
        return uniqBy(values, 'name').length === values.length
      })
      .min(1, getString?.('cd.filePathRequired'))
      .ensure()
  })
}
