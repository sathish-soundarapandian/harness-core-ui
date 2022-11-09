/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Checkbox, Container, Layout, Text, useConfirmationDialog } from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

interface GetEditModesReturnTypes {
  enableEditMode: () => Promise<boolean>
}

export function useEnableEditModes(): GetEditModesReturnTypes {
  const { getString } = useStrings()
  const [modalProps, setModalProps] = React.useState<{
    resolve: (isAlwaysEditModeOn: boolean) => void
    reject: () => void
  }>()
  const [isAlwaysEditModeOn, setIsAlwaysEditModeOn] = React.useState<boolean>(false)

  function EditModePreferenceComp(): JSX.Element {
    return (
      <Container padding={{ bottom: 'medium' }}>
        <Layout.Vertical spacing={'small'}>
          <Checkbox
            onChange={e => setIsAlwaysEditModeOn((e.target as any).checked)}
            checked={isAlwaysEditModeOn}
            large
            label={getString('pipeline.alwaysEditModeYAML')}
          />
          {isAlwaysEditModeOn && (
            <Text font={{ size: 'small' }} intent="warning">
              {getString('pipeline.warningForInvalidYAMLDiscard')}
            </Text>
          )}
        </Layout.Vertical>
      </Container>
    )
  }

  const { openDialog } = useConfirmationDialog({
    contentText: getString('yamlBuilder.enableEditContext'),
    titleText: getString('confirm'),
    confirmButtonText: getString('enable'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    children: <EditModePreferenceComp />,
    onCloseDialog: (didConfirm): void => {
      if (didConfirm) {
        modalProps?.resolve(isAlwaysEditModeOn)
      } else {
        modalProps?.reject()
      }
    }
  })

  const enableEditMode: () => Promise<boolean> = () => {
    return new Promise((resolve, reject) => {
      setModalProps({
        resolve: (_isAlwaysEditModeOn: boolean) => {
          resolve(_isAlwaysEditModeOn)
        },
        reject: () => {
          reject()
        }
      })
      openDialog()
    })
  }

  return {
    enableEditMode
  }
}
