/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isNil } from 'lodash-es'
import { Button, ButtonVariation, Card, Icon, Layout, Text } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import cx from 'classnames'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import css from './StepTemplateCard.module.scss'

interface StepTemplateCardProps {
  className?: string
  onSelect: (template: TemplateSummaryResponse) => void
  onPreview?: (template: TemplateSummaryResponse) => void
  onOpenEdit?: (template: TemplateSummaryResponse) => void
  onOpenSettings?: (templateIdentifier: string) => void
  onDelete?: (template: TemplateSummaryResponse) => void
  templateDetails: TemplateSummaryResponse
  selectedTemplate?: TemplateSummaryResponse
}

export function StepTemplateCard(props: StepTemplateCardProps): React.ReactElement | null {
  const { stepsFactory, isReadOnly } = useDeploymentContext()
  const { onSelect, onDelete, templateDetails, className } = props
  const { childType: templateType } = templateDetails || {}
  const step = stepsFactory.getStep(templateType)

  const handleCardClick = (): void => {
    onSelect(templateDetails)
  }
  const handleDelete = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    onDelete?.(templateDetails)
  }

  const templateRef = getScopeBasedTemplateRef(templateDetails)
  return (
    <Layout.Vertical spacing="small" flex={{ alignItems: 'center' }}>
      <Card
        interactive={!isNil(step)}
        selected={false}
        className={cx(css.paletteCard, className)}
        data-testid={`step-card-${templateRef}`}
        onClick={handleCardClick}
      >
        <Icon size={10} name="template-library" className={css.templateLibraryIcon} />
        {!isReadOnly && (
          <Button
            className={css.closeNode}
            minimal
            icon="cross"
            variation={ButtonVariation.PRIMARY}
            iconProps={{ size: 10 }}
            onClick={handleDelete}
            withoutCurrentColor={true}
          />
        )}
        {
          /* istanbul ignore next */
          !isNil(step) ? (
            <Icon
              name={step.getIconName?.()}
              size={defaultTo(step.getIconSize?.(), 25)}
              color={step.getIconColor?.()}
            />
          ) : null
        }
      </Card>
      <div className={css.stepTemplateCardText}>
        <Text width={100} font={{ size: 'small', align: 'center' }} lineClamp={3} color={Color.GREY_600}>
          {templateDetails?.name}
        </Text>
      </div>
    </Layout.Vertical>
  )
}
