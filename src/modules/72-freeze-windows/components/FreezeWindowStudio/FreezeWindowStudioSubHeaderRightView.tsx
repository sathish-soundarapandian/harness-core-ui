/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { WindowPathProps } from '@freeze-windows/types'
import { DefaultFreezeId } from './FreezeWindowContext/FreezeWindowReducer'
import { FreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import { SaveFreezeButton } from './SaveFreezeButton'
import css from './FreezeWindowStudio.module.scss'

export const FreezeWindowStudioSubHeaderRightView = () => {
  const { getString } = useStrings()
  const {
    state: { isUpdated },
    isReadOnly,
    refetchFreezeObj
  } = React.useContext(FreezeWindowContext)
  const { windowIdentifier } = useParams<WindowPathProps>()

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isUpdated && !isReadOnly && (
        <Button
          variation={ButtonVariation.LINK}
          intent="warning"
          className={css.unsavedChanges}
          // onClick={openDiffModal}
        >
          {getString('unsavedChanges')}
        </Button>
      )}
      <div className={css.headerSaveBtnWrapper}>
        <SaveFreezeButton />
      </div>
      {windowIdentifier !== DefaultFreezeId && !isReadOnly && (
        <Button
          disabled={!isUpdated}
          className={css.discardBtn}
          variation={ButtonVariation.SECONDARY}
          text={getString('pipeline.discard')}
          onClick={() => {
            // updateFreeze({ freezeObj: oldFreezeObj })
            refetchFreezeObj()
          }}
        />
      )}
    </div>
  )
}

// todo handle isYamlEditable: false
