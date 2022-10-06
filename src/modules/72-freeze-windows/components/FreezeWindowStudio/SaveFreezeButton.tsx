/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Spinner } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, getErrorInfoFromErrorObject, useToaster } from '@wings-software/uicore'
import { useCreateFreeze } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'

export const SaveFreezeButton = () => {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const {
    state: { freezeObj }
  } = React.useContext(FreezeWindowContext)
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const {
    mutate: createFreeze,
    loading,
    error
  } = useCreateFreeze({
    // loading
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    }
  })

  React.useEffect(() => {
    const errorMessage = loading ? '' : error ? getErrorInfoFromErrorObject(error) : ''
    if (errorMessage) {
      clear()
      showError(errorMessage)
    }
  }, [loading])

  const onSave = () => {
    try {
      // check errors
      createFreeze(yamlStringify({ freeze: freezeObj }), { headers: { 'content-type': 'application/json' } })
    } catch (e) {
      // console.log(e)
    }
  }

  if (loading) {
    return (
      <Container padding={'medium'}>
        <Spinner size={Spinner.SIZE_SMALL} />
      </Container>
    )
  }

  return (
    <div>
      <Button variation={ButtonVariation.PRIMARY} text={getString('save')} icon="send-data" onClick={onSave} />
    </div>
  )
}
