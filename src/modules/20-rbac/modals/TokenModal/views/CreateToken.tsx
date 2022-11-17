/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { ModalErrorHandlerBinding } from '@harness/uicore'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { TokenDTO, useCreateToken } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import TokenForm, { TokenFormData } from './TokenForm'

export interface TokenModalProps {
  data?: TokenDTO
  apiKeyIdentifier: string
  isEdit?: boolean
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
  onSubmit: () => void
  onClose: () => void
}

const CreateTokenForm: React.FC<TokenModalProps> = props => {
  const { onSubmit } = props
  const { accountId } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createToken, loading: saving } = useCreateToken({ queryParams: { accountIdentifier: accountId } })
  const [token, setToken] = useState<string>()

  const handleSubmit = async (values: TokenFormData): Promise<void> => {
    modalErrorHandler?.hide()
    const dataToSubmit = Object.assign({}, omit(values, ['expiryDate']))
    /* istanbul ignore else */ if (values['expiryDate']) {
      dataToSubmit['validTo'] = Date.parse(values['expiryDate'])
    }
    try {
      const created = await createToken(dataToSubmit)
      /* istanbul ignore else */ if (created) {
        showSuccess(getString('rbac.token.form.createSuccess', { name: values.name }))
        onSubmit()
        setToken(created.data)
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <TokenForm
      {...props}
      onSubmit={handleSubmit}
      token={token}
      setModalErrorHandler={setModalErrorHandler}
      loading={saving}
    />
  )
}

export default CreateTokenForm
