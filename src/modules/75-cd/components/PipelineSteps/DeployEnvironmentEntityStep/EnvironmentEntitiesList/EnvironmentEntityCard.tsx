/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Card, Text, Color, AllowedTypes, Container } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { NGEnvironmentInfoConfig } from 'services/cd-ng'

import css from './EnvironmentEntitiesList.module.scss'

export interface EnvironmentData {
  // TODO: Change to V2
  environment: NGEnvironmentInfoConfig & { yaml: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environmentInputs?: any
}

export interface EnvironmentEntityCardProps extends EnvironmentData {
  defaultExpanded?: boolean
  readonly?: boolean
  stageIdentifier?: string
  deploymentType?: string
  allowableTypes?: AllowedTypes
  onEditClick(svc: EnvironmentData): void
  onDeleteClick(svc: EnvironmentData): void
}

export function EnvironmentEntityCard(props: EnvironmentEntityCardProps): React.ReactElement {
  const { environment, environmentInputs, readonly, onEditClick, onDeleteClick } = props
  const { getString } = useStrings()

  return (
    <Card className={css.card}>
      <Container className={css.row}>
        <Container>
          <Text color={Color.PRIMARY_7} font="normal">
            {environment.name}
          </Text>
          <Text color={Color.GREY_500} font="small">
            {getString('idLabel', { id: environment.identifier })}
          </Text>
        </Container>
        <Container>
          <Button
            variation={ButtonVariation.ICON}
            icon="edit"
            data-testid={`edit-service-${environment.identifier}`}
            disabled={readonly}
            onClick={() => onEditClick({ environment, environmentInputs })}
          />
          <Button
            variation={ButtonVariation.ICON}
            icon="trash"
            data-testid={`delete-environment-${environment.identifier}`}
            disabled={readonly}
            onClick={() => onDeleteClick({ environment, environmentInputs })}
          />
        </Container>
      </Container>
    </Card>
  )
}
