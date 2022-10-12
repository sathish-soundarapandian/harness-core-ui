/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { WindowPathProps } from '@freeze-windows/types'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { DefaultFreezeId } from './FreezeWindowContext/FreezeWindowReducer'
import { FreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import { useSaveFreeze } from './useSaveFreeze'
import css from './FreezeWindowStudio.module.scss'

export const FreezeWindowStudioSubHeaderRightView = () => {
  const { getString } = useStrings()
  const {
    state: { isUpdated },
    isReadOnly,
    refetchFreezeObj
  } = React.useContext(FreezeWindowContext)
  const {
    accountId: accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    windowIdentifier
  } = useParams<WindowPathProps>()
  const { onSave, isSaveDisabled, isSaveInProgress } = useSaveFreeze()

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isReadOnly && (
        <div className={css.readonlyAccessTag}>
          <Icon name="eye-open" size={16} />
          <div className={css.readonlyAccessText}>{getString('common.readonlyPermissions')}</div>
        </div>
      )}

      {isUpdated && !isReadOnly && (
        <Button variation={ButtonVariation.LINK} intent="warning" className={css.unsavedChanges}>
          {getString('unsavedChanges')}
        </Button>
      )}
      <div className={css.headerSaveBtnWrapper}>
        <RbacButton
          onClick={onSave}
          disabled={isSaveDisabled}
          variation={ButtonVariation.PRIMARY}
          text={getString('save')}
          icon="send-data"
          loading={isSaveInProgress}
          permission={{
            permission: PermissionIdentifier.MANAGE_DEPLOYMENT_FREEZE,
            resource: {
              resourceType: ResourceType.DEPLOYMENTFREEZE
            },
            resourceScope: {
              accountIdentifier,
              orgIdentifier,
              projectIdentifier
            }
          }}
        />
      </div>
      {windowIdentifier !== DefaultFreezeId && !isReadOnly && (
        <Button
          disabled={!isUpdated}
          className={css.discardBtn}
          variation={ButtonVariation.SECONDARY}
          text={getString('pipeline.discard')}
          onClick={() => {
            refetchFreezeObj()
          }}
        />
      )}
    </div>
  )
}

// todo handle isYamlEditable: false
