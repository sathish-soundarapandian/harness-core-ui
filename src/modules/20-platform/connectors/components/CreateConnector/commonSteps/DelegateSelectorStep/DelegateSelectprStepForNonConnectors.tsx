import { getErrorInfoFromErrorObject, ModalErrorHandler, ModalErrorHandlerBinding, StepProps } from '@harness/uicore'
import React, { useState } from 'react'
import type { ConnectorConfigDTO, ResponseNgSmtpDTO } from 'services/cd-ng'

import type { ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import DelegateSelectorStep, { DelegateSelectorProps, DelegateSelectorStepData } from './DelegateSelectorStep'

export type BuildPayLoadDelegateSelectorStepPropForNonConnectorType = (data: ConnectorConfigDTO) => ConnectorConfigDTO

export type CustomHandlerDelegateSelectorProp = (payload: ConnectorConfigDTO) => Promise<ResponseNgSmtpDTO>
interface DelegateSelectorStepForNonConnectorsProps {
  dialogTitle: string
  buildPayloadForNonConnectors: BuildPayLoadDelegateSelectorStepPropForNonConnectorType

  customHandleCreateForNonConnectors: CustomHandlerDelegateSelectorProp
  customHandleUpdateForNonConnectors: CustomHandlerDelegateSelectorProp
}

const DelegateSelectorStepForNonConnectors: React.FC<
  StepProps<ConnectorConfigDTO> & DelegateSelectorProps & DelegateSelectorStepForNonConnectorsProps
> = props => {
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const onErrorHandler = (error: ResponseMessage) => {
    modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(error))
  }
  const afterSuccessHandler = (response: ResponseNgSmtpDTO) => {
    if (response.status === 'SUCCESS') {
      props.nextStep?.(response.data)
    } else {
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(response))
    }
  }
  const onSubmitForNonConnectors = (nonConnectorData: DelegateSelectorStepData) => {
    const payload = props.buildPayloadForNonConnectors(nonConnectorData)
    const connectorCustomCreateOrUpdate = props.isEditMode
      ? props.customHandleUpdateForNonConnectors(payload)
      : props.customHandleCreateForNonConnectors(payload)

    connectorCustomCreateOrUpdate
      ?.then(val => {
        afterSuccessHandler(val as ResponseNgSmtpDTO)
      })
      .catch((error: ResponseMessage) => {
        onErrorHandler(error)
      })
  }

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <DelegateSelectorStep {...props} onSubmitForNonConnectors={onSubmitForNonConnectors} />
    </>
  )
}

export default DelegateSelectorStepForNonConnectors
