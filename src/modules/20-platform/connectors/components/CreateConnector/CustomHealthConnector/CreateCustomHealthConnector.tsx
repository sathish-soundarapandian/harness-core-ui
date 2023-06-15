/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Connectors } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { buildCustomHealthPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { CustomHealthHeadersAndParams } from './components/CustomHealthHeadersAndParams/CustomHealthHeadersAndParams'
import { FieldNames } from './CreateCustomHealthConnector.constants'
import { CustomHealthValidationPath } from './components/CustomHealthValidationPath/CustomHealthValidationPath'

export function CustomHealthConnector(props: ConnectionConfigProps): JSX.Element[] {
  const { getString } = useStrings()
  return [
    <CustomHealthHeadersAndParams
      {...props}
      name={getString('common.headers')}
      addRowButtonLabel={getString('connectors.addHeader')}
      nameOfObjectToUpdate="headers"
      key={FieldNames.HEADERS}
    />,
    <CustomHealthHeadersAndParams
      {...props}
      name={getString('connectors.parameters')}
      addRowButtonLabel={getString('connectors.addParameter')}
      key={FieldNames.PARAMETERS}
      nameOfObjectToUpdate="params"
    />,
    <CustomHealthValidationPath
      {...props}
      key={FieldNames.VALIDATION_PATH}
      name={getString('connectors.validationPath')}
    />
  ]
}

export default cvConnectorHOC({
  connectorType: Connectors.CUSTOM_HEALTH,
  buildSubmissionPayload: buildCustomHealthPayload,
  nestedStep: CustomHealthConnector
})
