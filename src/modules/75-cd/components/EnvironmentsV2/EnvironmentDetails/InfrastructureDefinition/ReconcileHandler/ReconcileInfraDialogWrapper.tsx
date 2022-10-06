/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Dialog, Icon, Layout, Text } from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { Color, FontVariation } from '@wings-software/design-system'

import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import type { TemplateResponse } from 'services/template-ng'
import type { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { ReconcileInfraDialog } from './ReconcileInfraDialog'
import css from './ReconcileHandler.module.scss'

export interface OutOfSyncErrorStripProps {
  entity: TemplateErrorEntity
  originalYaml: string
  isReadOnly: boolean
  updateRootEntity: (entityYaml: string) => Promise<void>
  isEdit?: boolean
}

const ReconcileInfraDialogWrapper = ({
  entity,
  originalYaml,
  isReadOnly,
  updateRootEntity,
  isEdit = true
}: OutOfSyncErrorStripProps): JSX.Element => {
  const { getString } = useStrings()

  const [resolvedTemplateResponses, setResolvedTemplateResponses] = React.useState<TemplateResponse[]>([])

  const [showReconcileDialog, hideReconcileDialog] = useModalHook(() => {
    const onClose = (): void => {
      hideReconcileDialog()
    }

    return (
      <Dialog enforceFocus={false} isOpen={true} onClose={onClose} className={css.reconcileDialog}>
        <ReconcileInfraDialog
          isEdit={isEdit}
          originalEntityYaml={originalYaml}
          updateRootEntity={async (entityYaml: string) => {
            hideReconcileDialog()
            await updateRootEntity(entityYaml)
          }}
        />
      </Dialog>
    )
  }, [resolvedTemplateResponses, originalYaml, entity, setResolvedTemplateResponses, updateRootEntity])

  return (
    <Container className={css.mainContainer}>
      <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <Icon name="warning-sign" intent={Intent.DANGER} />
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.RED_600}>
          {getString('pipeline.outOfSyncErrorStrip.updatedTemplateInfo', { entity: entity.toLowerCase() })}
        </Text>
        <Button
          text={getString('pipeline.outOfSyncErrorStrip.reconcile')}
          variation={ButtonVariation.SECONDARY}
          disabled={isReadOnly}
          size={ButtonSize.SMALL}
          onClick={showReconcileDialog}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default ReconcileInfraDialogWrapper
