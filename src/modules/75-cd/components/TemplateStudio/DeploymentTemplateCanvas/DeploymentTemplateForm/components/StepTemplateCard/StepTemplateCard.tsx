/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isNil, defaultTo } from 'lodash-es'
import { Button, ButtonVariation, Card, Icon, Layout, Text, useConfirmationDialog } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import cx from 'classnames'
import { Intent } from '@blueprintjs/core'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import css from './StepTemplateCard.module.scss'

interface StepTemplateCardProps {
  stepNode: TemplateStepNode
  className?: string
  onRemoveClick: (_stepNode: TemplateStepNode) => void
  onCardClick: (_stepNode: TemplateStepNode) => void
}

export function StepTemplateCard(props: StepTemplateCardProps): React.ReactElement | null {
  const { templateTypes, stepsFactory, isReadOnly } = useDeploymentContext()
  const { stepNode, className, onRemoveClick, onCardClick } = props
  const { name, identifier, template } = stepNode || {}
  const step = stepsFactory.getStep(get(templateTypes, template.templateRef))
  const { getString } = useStrings()
  const { showSuccess } = useToaster()

  const handleCardClick = React.useCallback(() => {
    onCardClick?.(stepNode)
  }, [onCardClick, stepNode])

  const { openDialog: openRemoveStepTemplateDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    cancelButtonText: getString('no'),
    contentText: getString('cd.removeStepTemplateConfirmationLabel', { name: name }),
    titleText: getString('cd.removeStepTemplate'),
    confirmButtonText: getString('yes'),
    buttonIntent: Intent.DANGER,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        onRemoveClick?.(stepNode)
        showSuccess(getString('cd.removeStepTemplateSuccess'))
      }
    }
  })

  const handleRemoveTemplateClick = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      e.stopPropagation()
      openRemoveStepTemplateDialog()
    },
    [openRemoveStepTemplateDialog]
  )

  return (
    <Layout.Vertical spacing="small">
      <Card
        interactive={!isNil(step)}
        selected={false}
        className={cx(css.paletteCard, className)}
        data-testid={`step-card-${identifier}`}
        onClick={handleCardClick}
      >
        <Icon size={10} name="template-library" className={css.templateLibraryIcon} />
        {!name && <Icon name="warning-sign" intent={Intent.WARNING} size={10} className={css.warningIcon} />}
        {!isReadOnly && (
          <Button
            className={css.closeNode}
            minimal
            icon="cross"
            variation={ButtonVariation.PRIMARY}
            iconProps={{ size: 10 }}
            onClick={handleRemoveTemplateClick}
            withoutCurrentColor={true}
          />
        )}
        {!isNil(step) ? (
          <Icon name={step.getIconName?.()} size={defaultTo(step.getIconSize?.(), 25)} color={step.getIconColor?.()} />
        ) : null}
      </Card>
      <Text lineClamp={1} className={css.stepTemplateCardText} width={64} font="small" color={Color.GREY_600}>
        {name}
      </Text>
    </Layout.Vertical>
  )
}
