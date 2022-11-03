/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    artifactType: Yup.string().required(getString('cd.artifactSource.artifactRepositoryTypeIsRequired')),
    connectorId: Yup.mixed().when('artifactType', {
      is: artifactType => !isEmpty(artifactType),
      then: Yup.mixed().test({
        test(value: string | undefined | ConnectorConfigDTO): boolean | Yup.ValidationError {
          return isEmpty(value) ? this.createError({ message: getString('validation.sshConnectorRequired') }) : true
        }
      })
    })
  })
}
