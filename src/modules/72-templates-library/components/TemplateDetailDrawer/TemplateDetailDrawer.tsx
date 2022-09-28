/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { TemplateDetails } from '../TemplateDetails/TemplateDetails'
import css from './TemplateDetailDrawer.module.scss'

export interface TemplateDetailsDrawerProps {
  template: TemplateSummaryResponse
  onClose: () => void
}

export const TemplateDetailsDrawer: React.FC<TemplateDetailsDrawerProps> = props => {
  const { onClose, template } = props
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF

  const getTemplateDetails: React.ReactElement = React.useMemo(
    () => (template ? <TemplateDetails template={template} /> : <></>),
    [template]
  )

  return (
    <Drawer
      onClose={onClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={600}
      isOpen={!!template}
      position={Position.RIGHT}
    >
      <Button minimal className={css.almostFullScreenCloseBtn} icon="cross" withoutBoxShadow onClick={onClose} />
      {template && (
        <>{isGitSyncEnabled ? <GitSyncStoreProvider>{getTemplateDetails}</GitSyncStoreProvider> : getTemplateDetails}</>
      )}
    </Drawer>
  )
}
