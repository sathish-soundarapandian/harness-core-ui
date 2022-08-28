/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isNil } from 'lodash-es'
import { Button, ButtonVariation, Card, Icon, Layout, Text, useConfirmationDialog } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import cx from 'classnames'
import { Intent } from '@blueprintjs/core'
import { iconMap } from '@pipeline/components/PipelineStudio/StepPalette/iconMap'
import type { TemplateStepNode } from 'services/pipeline-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import css from './StepTemplateCard.module.scss'

interface StepTemplateCardProps {
  stepNode: TemplateStepNode
  stepsFactory: AbstractStepFactory
  className?: string
  isReadOnly?: boolean
  onRemoveClick: (_stepNode: TemplateStepNode) => void
  onCardClick: (_stepNode: TemplateStepNode) => void
}

export function StepTemplateCard(props: StepTemplateCardProps): React.ReactElement | null {
  const { templateTypes } = useDeploymentContext()

  const { stepNode, stepsFactory, className, isReadOnly, onRemoveClick, onCardClick } = props

  const { name, identifier, template } = stepNode || {}
  const { templateRef } = template || {}

  const templateScope = getScopeFromValue(templateRef)
  const templateIdentifier = getIdentifierFromValue(templateRef)
  const templateType = get(templateTypes, templateScope === Scope.PROJECT ? templateIdentifier : templateRef)

  const step = stepsFactory.getStep(templateType)

  const { getString } = useStrings()
  const { showSuccess } = useToaster()

  const { openDialog: openRemoveStepTemplateDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    cancelButtonText: getString('no'),
    contentText: getString('cd.removeStepTemplateConfirmationLabel', { name: name }),
    titleText: getString('cd.removeStepTemplate'),
    confirmButtonText: getString('yes'),
    buttonIntent: Intent.DANGER,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        onRemoveClick?.(stepNode)
        Promise.resolve()
        showSuccess(getString('cd.removeStepTemplateSuccess'))
      }
    }
  })

  return (
    <Layout.Vertical spacing="small">
      <Card
        interactive={!isNil(step)}
        selected={false}
        className={cx(css.paletteCard, className)}
        data-testid={`step-card-${identifier}`}
        onClick={() => {
          onCardClick?.(stepNode)
        }}
      >
        <Icon size={10} name="template-library" className={css.templateLibraryIcon} />
        {!isReadOnly && (
          <Button
            className={css.closeNode}
            minimal
            icon="cross"
            variation={ButtonVariation.PRIMARY}
            iconProps={{ size: 10 }}
            onClick={e => {
              e.stopPropagation()
              openRemoveStepTemplateDialog()
            }}
            withoutCurrentColor={true}
          />
        )}
        <Icon
          name={!isNil(step) ? step.getIconName?.() : iconMap[templateType || '']}
          size={!isNil(step?.getIconSize?.()) ? step?.getIconSize?.() : 25}
          {...(!isNil(step) && !isNil(step?.getIconColor?.()) ? { color: step.getIconColor() } : {})}
          style={{ color: step?.getIconColor?.() }}
        />
      </Card>
      <Text lineClamp={1} className={css.stepTemplateCardText} width={64} font="small" color={Color.GREY_600}>
        {name}
      </Text>
    </Layout.Vertical>
  )
}
