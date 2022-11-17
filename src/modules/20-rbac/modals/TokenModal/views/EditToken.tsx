/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { ModalErrorHandlerBinding } from '@harness/uicore'
import { defaultTo, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { useUpdateToken } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import TokenForm, { TokenFormData } from './TokenForm'
import type { TokenModalProps } from './CreateToken'

const EditTokenForm: React.FC<TokenModalProps> = props => {
  const { data: tokenData, onSubmit, onClose } = props
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()

  const { accountId } = useParams<ProjectPathProps>()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const { mutate: editToken, loading: updating } = useUpdateToken({
    identifier: encodeURIComponent(defaultTo(tokenData?.identifier, ''))
  })

  const handleSubmit = async (values: TokenFormData): Promise<void> => {
    modalErrorHandler?.hide()
    const dataToSubmit = Object.assign({}, omit(values, ['expiryDate']))
    /* istanbul ignore else */ if (values['expiryDate']) {
      dataToSubmit['validTo'] = Date.parse(values['expiryDate'])
    }
    try {
      const updated = await editToken(dataToSubmit, { queryParams: { accountIdentifier: accountId } })
      /* istanbul ignore else */ if (updated) {
        showSuccess(getString('rbac.token.form.editSuccess', { name: values.name }))
        onSubmit()
        onClose()
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return <TokenForm {...props} onSubmit={handleSubmit} setModalErrorHandler={setModalErrorHandler} loading={updating} />
}

export default EditTokenForm
