/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard, PageSpinner } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import {
  ConnectorConfigDTO,
  NgSmtpDTO,
  useCreateSmtpConfig,
  useUpdateSmtp
} from 'services/cd-ng'
import StepSmtpDetails from './views/StepDetails'
import StepCredentials from './views/StepCredentials'
import StepTestConnection from './views/StepTestConnection'
import DelegateSelectorStep, {
  CustomHandlerDelegateSelectorProp,
  NonConnectorsTypeToUseDelegateStep} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export interface CreateSmtpWizardProps {
  onSuccess?: (smtp: NgSmtpDTO) => void
  hideModal?: () => void
}

export interface SmtpSharedObj {
  detailsData?: NgSmtpDTO
  isEdit?: boolean
}

const CreateSmtpWizard: React.FC<CreateSmtpWizardProps & SmtpSharedObj> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()

  const { loading: saveSmtpLoading, mutate: createSmtpConfig } = useCreateSmtpConfig({
    queryParams: { accountIdentifier: accountId }
  })
  const { loading: updateSmtpLoading, mutate: updateSmtp } = useUpdateSmtp({
    queryParams: { accountIdentifier: accountId }
  })

  return (
    <>
      {updateSmtpLoading || saveSmtpLoading ? (
        <PageSpinner
          message={props.isEdit ? getString('common.smtp.updatingSMTP') : getString('common.smtp.savingSMTP')}
        />
      ) : null}
      <StepWizard icon="smtp" iconProps={{ size: 56, color: Color.WHITE }} title={getString('common.smtp.conifg')}>
        <StepSmtpDetails name={getString('details')} {...props} />
        <StepCredentials name={getString('credentials')} {...props} />
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          buildPayloadForNonConnectors={data => {
            const delegateSelectors = data?.delegateSelectors
            const value = { ...data?.value, delegateSelectors }
            let returnValue: ConnectorConfigDTO = { ...data, accountId, value }
            delete returnValue?.delegateSelectors
            return returnValue
          }}
          customHandleCreateForNonConnectors={createSmtpConfig as CustomHandlerDelegateSelectorProp}
          customHandleUpdateForNonConnectors={updateSmtp as CustomHandlerDelegateSelectorProp}
          disableGitSync
          {...props}
          isEditMode={!!props.isEdit}
          connectorInfo={undefined}
          nonConnectorsTypeToUseDelegateStep={NonConnectorsTypeToUseDelegateStep.SMTP}
        />
        <StepTestConnection name={getString('common.smtp.testConnection')} {...props} />
      </StepWizard>
    </>
  )
}

export default CreateSmtpWizard
