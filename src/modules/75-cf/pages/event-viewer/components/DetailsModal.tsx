/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, Layout, Button, ButtonVariation } from '@harness/uicore'
import MonacoEditor from 'react-monaco-editor'
import { useStrings } from 'framework/strings'
export interface DetailsModalProps {
  hideModal: () => void
  isOpen: boolean,
  details: string
}
import css from '../FeatureFlagsEventViewer.module.scss'

export const DetailsModal: React.FC<DetailsModalProps> = ({ hideModal, isOpen, details }) => {
  const { getString } = useStrings()
  
  return (
    <Dialog
      className={css.dialog}
      isOpen={isOpen}
      enforceFocus={false}
      title="Event Details"
      onClose={hideModal}
      footer={(
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
          <Button
            variation={ButtonVariation.TERTIARY}
            onClick={hideModal}
            text={getString('close')}
          />
        </Layout.Horizontal>
      )}
    >
      <MonacoEditor
        width="404"
        height="250"
        language="json"
        value={details}
        options={{
          readOnly:true,
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
            handleMouseWheel:false
          },
          minimap: { enabled: false }
        }}
      />
    </Dialog>
  )
} 