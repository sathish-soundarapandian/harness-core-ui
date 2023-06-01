/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ModalErrorHandlerBinding, StepWizard, getErrorInfoFromErrorObject } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ConnectorInfoDTO, NgSmtpDTO, useCreateSmtpConfig, useUpdateSmtp } from 'services/cd-ng'
import StepSmtpDetails from './views/StepDetails'
import StepCredentials from './views/StepCredentials'
import StepTestConnection from './views/StepTestConnection'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
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

  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const { loading: saveSmtpLoading, mutate: createSmtpConfig } = useCreateSmtpConfig({
    queryParams: { accountIdentifier: accountId }
  })
  function createSmtp(data: any, props: any) {
    console.log({ props })
    const returnPromise: Promise<ConnectorInfoDTO> = new Promise(async (resolve, reject) => {
      const createData = await createSmtpConfig(data)

      if (createData.status === 'SUCCESS') {
        resolve(createData as ConnectorInfoDTO)
      } else {
        reject(createData as ConnectorInfoDTO)
      }
    })
    return returnPromise
  }
  const { loading: updateSmtpLoading, mutate: updateSmtp } = useUpdateSmtp({
    queryParams: { accountIdentifier: accountId }
  })

  function updateSmtpLocal(data: any, props: any) {
    console.log({ props })
    const returnPromise: Promise<ConnectorInfoDTO> = new Promise(async (resolve, reject) => {
      const updateData = await updateSmtp(data)

      if (updateData.status === 'SUCCESS') {
        props.nextStep?.({ ...data, uuid: updateData.data?.uuid })

        resolve(updateData as ConnectorInfoDTO)
      } else {
        modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(updateData))

        reject(updateData as ConnectorInfoDTO)
      }
    })
    return returnPromise
  }
  return (
    <StepWizard icon="smtp" iconProps={{ size: 56, color: Color.WHITE }} title={getString('common.smtp.conifg')}>
      <StepSmtpDetails name={getString('details')} {...props} />
      <StepCredentials name={getString('credentials')} {...props} />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        buildPayload={(dataLocal: any) => {
          const data = { ...dataLocal }
          const delegateSelectors = data?.delegateSelectors
          const value = { ...data?.value, delegateSelectors }
          delete data.delegateSelectors
          return { ...data, accountId, value } as any
        }}
        customHandleCreate={createSmtp as any}
        customHandleUpdate={updateSmtpLocal as any}
        disableGitSync
        {...props}
        isEditMode={!!props.isEdit}
        connectorInfo={undefined}
      />
      <StepTestConnection name={getString('common.smtp.testConnection')} {...props} />
    </StepWizard>
  )
}

export default CreateSmtpWizard
