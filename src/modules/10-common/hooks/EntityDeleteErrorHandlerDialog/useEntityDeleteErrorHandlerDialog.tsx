/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  useConfirmationDialog,
  Text,
  UseConfirmationDialogReturn,
  Button,
  ButtonVariation,
  Layout,
  Container,
  Checkbox
} from '@harness/uicore'
import { FontVariation, Intent } from '@harness/design-system'
import { Callout } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import css from './EntityDeleteErrorHandlerDialog.module.scss'

export interface EntityInfo {
  type: string
  name: string
}

interface ContentTextProps {
  entity: EntityInfo
  forceDeleteCallback?: () => void
  forcedDeleteEnabled: boolean
  setForcedDeleteEnabled: (status: boolean) => void
}

interface CustomButtonContainerProps extends Omit<ContentTextProps, 'setForcedDeleteEnabled' | 'entity'> {
  closeDialog: () => void
  redirectToReferencedBy: () => void
}

export interface UseEntityDeleteErrorHandlerDialogProps
  extends Omit<ContentTextProps, 'forcedDeleteEnabled' | 'setForcedDeleteEnabled'> {
  titleText?: React.ReactNode
  redirectToReferencedBy: () => void
}

export const ContentText = (props: ContentTextProps): JSX.Element => {
  const { entity, forcedDeleteEnabled, setForcedDeleteEnabled } = props
  const { type, name } = entity
  const { getString } = useStrings()
  const typeLabelText = type.toLowerCase()

  const toggleForcedDelete = (): void => {
    setForcedDeleteEnabled(!forcedDeleteEnabled)
  }

  return (
    <Layout.Vertical>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.BODY2_SEMI }}>
        {getString('common.referenceTextWarning', {
          type: typeLabelText,
          name
        })}
      </Text>
      {props.forceDeleteCallback ? (
        <Checkbox
          name={`forcedDelete-${type}`}
          label={getString('common.forcedDeleteLabel', { type: typeLabelText })}
          onClick={() => toggleForcedDelete()}
        />
      ) : null}
      {forcedDeleteEnabled ? (
        <Callout className={css.forcedDeleteWarning} intent="warning">
          {getString('common.forcedDeleteWarning', { type: typeLabelText })}
        </Callout>
      ) : null}
    </Layout.Vertical>
  )
}

export const CustomButtonContainer = (props: CustomButtonContainerProps): JSX.Element => {
  const { closeDialog, forceDeleteCallback, redirectToReferencedBy, forcedDeleteEnabled } = props
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing={'small'} flex={{ justifyContent: 'space-between' }} width={'100%'}>
      <Container>
        <Button
          margin={{ right: 'small' }}
          text={getString('common.referenceButtonText')}
          variation={ButtonVariation.PRIMARY}
          onClick={() => redirectToReferencedBy()}
        />
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={closeDialog} />
      </Container>
      {forceDeleteCallback ? (
        <Button
          text={getString('delete')}
          variation={ButtonVariation.SECONDARY}
          disabled={!forcedDeleteEnabled}
          intent={Intent.DANGER}
          onClick={() => {
            forceDeleteCallback()
            closeDialog()
          }}
        />
      ) : null}
    </Layout.Horizontal>
  )
}

export const useEntityDeleteErrorHandlerDialog = (
  props: UseEntityDeleteErrorHandlerDialogProps
): UseConfirmationDialogReturn => {
  const { getString } = useStrings()
  const {
    entity,
    titleText = getString('common.cantDeleteEntity', {
      entity: entity.type.toLowerCase()
    }),
    redirectToReferencedBy,
    forceDeleteCallback
  } = props
  const [forcedDeleteEnabled, setForcedDeleteEnabled] = useState<boolean>(false)
  const onClose = (): void => {
    setForcedDeleteEnabled(false)
    closeDialog()
  }

  const { openDialog, closeDialog } = useConfirmationDialog({
    contentText: (
      <ContentText
        entity={entity}
        forceDeleteCallback={forceDeleteCallback}
        forcedDeleteEnabled={forcedDeleteEnabled}
        setForcedDeleteEnabled={setForcedDeleteEnabled}
      />
    ),
    titleText: titleText,
    customButtons: (
      <CustomButtonContainer
        closeDialog={onClose}
        redirectToReferencedBy={redirectToReferencedBy}
        forceDeleteCallback={forceDeleteCallback}
        forcedDeleteEnabled={forcedDeleteEnabled}
      />
    ),
    intent: Intent.DANGER,
    onCloseDialog: () => setForcedDeleteEnabled(false)
  })

  return { openDialog, closeDialog }
}
