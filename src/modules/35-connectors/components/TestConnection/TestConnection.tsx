/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation } from '@harness/uicore'
import type { ResponseConnectorValidationResult, ConnectorInfoDTO, EntityGitDetails } from 'services/cd-ng'
import type { UseGetMockData } from '@common/utils/testUtils'
import useTestConnectionModal from '@connectors/common/useTestConnectionModal/useTestConnectionModal'
import { useStrings } from 'framework/strings'

interface TestConnectionProps {
  refetchConnector: () => Promise<any>
  connector: ConnectorInfoDTO
  gitDetails?: EntityGitDetails
  testUrl: string
  testConnectionMockData?: UseGetMockData<ResponseConnectorValidationResult>
  className?: string
}
const TestConnection: React.FC<TestConnectionProps> = props => {
  const { connector, gitDetails, testUrl } = props
  const { openErrorModal } = useTestConnectionModal({
    onClose: () => {
      props.refetchConnector()
    }
  })
  const { getString } = useStrings()
  return (
    <Button
      withoutBoxShadow
      className={props.className}
      text={getString('connectors.stepThreeName')}
      onClick={() => {
        openErrorModal({ connector, gitDetails, testUrl })
      }}
      variation={ButtonVariation.SECONDARY}
    />
  )
}
export default TestConnection
