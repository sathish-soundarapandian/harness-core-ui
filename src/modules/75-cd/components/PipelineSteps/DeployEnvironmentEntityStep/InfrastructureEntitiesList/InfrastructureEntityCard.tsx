/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import {
  Button,
  ButtonVariation,
  Card,
  Text,
  Color,
  AllowedTypes,
  Container,
  Layout,
  TagsPopover
} from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { InfrastructureDefinitionConfig } from 'services/cd-ng'

import css from './InfrastructureEntitiesList.module.scss'

export interface InfrastructureData {
  infrastructure: InfrastructureDefinitionConfig & { yaml: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infrastructureInputs?: any
}

export interface InfrastructureEntityCardProps extends InfrastructureData {
  defaultExpanded?: boolean
  readonly?: boolean
  stageIdentifier?: string
  deploymentType?: string
  allowableTypes?: AllowedTypes
  onEditClick(svc: InfrastructureData): void
  onDeleteClick(svc: InfrastructureData): void
}

export function InfrastructureEntityCard(props: InfrastructureEntityCardProps): React.ReactElement {
  const { infrastructure, infrastructureInputs, readonly, onEditClick, onDeleteClick } = props
  const { getString } = useStrings()

  return (
    <Card className={css.card}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Layout.Vertical>
          <Layout.Horizontal
            flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
            spacing="small"
            margin={{ bottom: 'xsmall' }}
          >
            <Text color={Color.PRIMARY_7}>{infrastructure.name}</Text>
            {!isEmpty(infrastructure.tags) && (
              <TagsPopover iconProps={{ size: 14, color: Color.GREY_600 }} tags={defaultTo(infrastructure.tags, {})} />
            )}
          </Layout.Horizontal>

          <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
            {getString('common.ID')}: {infrastructure.identifier}
          </Text>
        </Layout.Vertical>

        <Container>
          <Button
            variation={ButtonVariation.ICON}
            icon="edit"
            data-testid={`edit-infrastructure-${infrastructure.identifier}`}
            disabled={readonly}
            onClick={() => onEditClick({ infrastructure, infrastructureInputs })}
          />
          <Button
            variation={ButtonVariation.ICON}
            icon="remove-minus"
            data-testid={`delete-infrastructure-${infrastructure.identifier}`}
            disabled={readonly}
            onClick={() => onDeleteClick({ infrastructure, infrastructureInputs })}
          />
        </Container>
      </Layout.Horizontal>
    </Card>
  )
}
