/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import OverviewStep from './steps/OverviewStep'
import type { permission } from './constants'
import { CO_PERMISSION } from './constants'
import ConnectionDetailsStep from './steps/ConnectionDetailsStep'
import TestConnectionStep from './steps/TestConnectionStep'
import css from './AWSCOConnector.module.scss'

interface ConnectorConfig {
  permission?: permission
}

interface COAWSConnectorProps extends ConnectorConfig {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  onSuccess: (data?: ConnectorInfoDTO) => void | Promise<void>
  // onFailure: (data?: ConnectorRequestBody) => void | Promise<void>
}

const AWSCOConnector: React.FC<COAWSConnectorProps> = props => {
  const { onSuccess } = props
  const { getString } = useStrings()
  return (
    <section className={css.wrapper}>
      <StepWizard<ConnectorInfoDTO>
        icon="service-aws"
        iconProps={{ size: 37 }}
        title={getString('ce.connector.AWS.title')}
      >
        <OverviewStep
          name={getString('ce.connector.AWS.overview.title')}
          type={Connectors.AWS_CO}
          permission={CO_PERMISSION} // TODO : ACCEPT permission from parent
        />
        <ConnectionDetailsStep name={getString('ce.connector.AWS.crossAccountRole.title')} />
        <TestConnectionStep name={'Test Connection'} onSuccess={onSuccess} onFailure={onSuccess} />
      </StepWizard>
    </section>
  )
}

export default AWSCOConnector
