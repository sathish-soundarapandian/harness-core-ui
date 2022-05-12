/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Classes, Menu } from '@blueprintjs/core'

import { Card, Text, Container, CardBody } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { EnvironmentResponse } from 'services/cd-ng'

import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'

import { EnvironmentName, EnvironmentTypes, LastUpdatedBy } from '../EnvironmentsList/EnvironmentsListColumns'

import css from './EnvironmentsGrid.module.scss'

export interface EnvironmentCardProps {
  environment: EnvironmentResponse
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function EnvironmentCard({ environment, onEdit, onDelete }: EnvironmentCardProps): React.ReactElement {
  const { getString } = useStrings()

  // TODO: To be handled better
  const prop = {
    row: {
      original: { ...environment }
    }
  }

  return (
    <Card
      className={css.environmentCard}
      interactive
      onClick={() => onEdit(defaultTo(environment?.environment?.identifier, ''))}
    >
      <Container padding={'xlarge'} border={{ bottom: true }}>
        <CardBody.Menu
          menuContent={
            <Menu style={{ minWidth: 'unset' }}>
              <RbacMenuItem
                icon="edit"
                text={getString('edit')}
                onClick={() => onEdit(defaultTo(environment?.environment?.identifier, ''))}
                permission={{
                  resource: {
                    resourceType: ResourceType.ENVIRONMENT_GROUP
                  },
                  permission: PermissionIdentifier.EDIT_ENVIRONMENT_GROUP
                }}
              />
              <RbacMenuItem
                icon="trash"
                text={getString('delete')}
                onClick={() => onDelete(defaultTo(environment?.environment?.identifier, ''))}
                permission={{
                  resource: {
                    resourceType: ResourceType.ENVIRONMENT_GROUP
                  },
                  permission: PermissionIdentifier.DELETE_ENVIRONMENT_GROUP
                }}
              />
            </Menu>
          }
          menuPopoverProps={{
            className: Classes.DARK
          }}
        />
        <EnvironmentName
          row={{
            original: { ...environment }
          }}
        />
        <Container margin={{ top: 'medium' }}>
          <EnvironmentTypes {...(prop as any)} />
        </Container>
      </Container>
      <Container padding={'xlarge'}>
        <Text margin={{ bottom: 'small' }}>Updated By</Text>
        <LastUpdatedBy lastModifiedAt={environment.lastModifiedAt} />
      </Container>
    </Card>
  )
}
