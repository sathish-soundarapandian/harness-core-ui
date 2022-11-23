/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './SaveAndDiscardButton.module.scss'

interface SaveAndDiscardButtonInterface {
  isUpdated: boolean
  onSave: (data: any) => void | Promise<void>
  onDiscard: () => void
  className?: string
  RbacPermission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
}

export default function SaveAndDiscardButton({
  isUpdated,
  onSave,
  onDiscard,
  className,
  RbacPermission
}: SaveAndDiscardButtonInterface): JSX.Element {
  const { getString } = useStrings()
  return (
    <>
      <div className={cx(css.saveHeader, className)}>
        {isUpdated && <div className={css.tagRender}>{getString('unsavedChanges')}</div>}
        <RbacButton
          intent="primary"
          text={getString('save')}
          onClick={onSave}
          icon="send-data"
          className={css.saveButton}
          permission={RbacPermission}
        />
        <Button
          disabled={!isUpdated}
          onClick={onDiscard}
          className={css.discardBtn}
          text={getString('common.discard')}
        />
      </div>
    </>
  )
}
