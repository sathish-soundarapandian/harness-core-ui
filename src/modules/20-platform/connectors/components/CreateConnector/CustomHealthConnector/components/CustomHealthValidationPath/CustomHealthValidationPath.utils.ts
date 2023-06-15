/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ConnectionConfigProps } from '@connectors/components/CreateConnector/CommonCVConnector/constants'
import type { CustomHealthValidationPathFormFields } from './CustomHealthValidationPath.types'
import { HTTPRequestMethod } from './components/HTTPRequestMethod/HTTPRequestMethod.types'

export function transformDataToStepData(
  apiData: ConnectionConfigProps['prevStepData']
): CustomHealthValidationPathFormFields {
  if (!apiData?.spec && !apiData?.validationPath) {
    return {
      validationPath: '',
      requestMethod: HTTPRequestMethod.GET
    }
  }

  if (apiData.validationPath) {
    return {
      validationPath: apiData.validationPath,
      requestMethod: apiData.requestMethod,
      requestBody: apiData.requestBody
    }
  }

  return {
    validationPath: apiData.spec.validationPath,
    requestMethod: apiData.spec.method,
    requestBody: apiData.spec.validationBody
  }
}
