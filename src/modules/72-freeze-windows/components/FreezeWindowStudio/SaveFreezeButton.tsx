/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Spinner } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, getErrorInfoFromErrorObject, useToaster } from '@wings-software/uicore'
import { useCreateFreeze } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import routes from '@common/RouteDefinitions'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { DefaultFreezeId } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowReducer'
import type { WindowPathProps } from '@freeze-windows/types'

export const SaveFreezeButton = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { showError, clear } = useToaster()
  const [isMounted, setIsMounted] = React.useState<boolean>(false)
  const {
    state: { freezeObj }
    // refetchFreezeObj
  } = React.useContext(FreezeWindowContext)
  const {
    accountId: accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    // windowIdentifier,
    module
  } = useParams<WindowPathProps & ModulePathParams>()
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
    if (!isMounted) {
      setIsMounted(true)
      return
    }
    const errorMessage = loading ? '' : error ? getErrorInfoFromErrorObject(error) : ''
    if (errorMessage) {
      clear()
      showError(errorMessage)
    }
    if (!errorMessage && !loading && freezeObj.identifier !== DefaultFreezeId) {
      history.push(
        routes.toFreezeWindowStudio({
          projectIdentifier,
          orgIdentifier,
          accountId: accountIdentifier,
          module,
          windowIdentifier: freezeObj.identifier as string
        })
      )
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
