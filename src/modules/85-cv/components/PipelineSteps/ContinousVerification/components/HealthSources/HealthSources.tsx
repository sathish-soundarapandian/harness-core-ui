/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonVariation, Container, FormInput, Icon, NoDataCard, TableV2, Text } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import type { HealthSource } from 'services/cv'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import noHealthsourcesImage from '@cv/assets/noHealthsources.svg'
import type { HealthSourcesProps } from './HealthSources.types'
import css from './HealthSources.module.scss'

export default function HealthSources(props: HealthSourcesProps): React.ReactElement {
  const { getString } = useStrings()
  const { healthSources, isRunTimeInput, addHealthSource, editHealthSource, deleteHealthSource } = props

  const { projectIdentifier } = useParams<ProjectPathProps>()

  const TypeTableCell = (tableProps: CellProps<HealthSource>): JSX.Element => {
    const type = tableProps?.row?.values?.type
    const name = tableProps?.row?.values?.name
    return (
      <div className={css.healthsourcename}>
        <div className={css.healthsourcetype}>
          <Icon name={getIconBySourceType(type)} size={18} />
        </div>
        <span>{name}</span>
      </div>
    )
  }

  const HealthSourceActions = (tableProps: CellProps<HealthSource>): JSX.Element => {
    return (
      <Container className={css.header}>
        <div className={css.tableType}>{tableProps.value}</div>
        <Container flex>
          <Icon
            name="edit"
            size={14}
            onClick={() => {
              editHealthSource(tableProps?.row?.original)
            }}
            className={css.link}
            padding={'small'}
          />
          <Icon
            name="trash"
            size={14}
            onClick={() => {
              deleteHealthSource?.(tableProps?.row?.original)
            }}
            className={css.link}
            padding={'small'}
          />
        </Container>
      </Container>
    )
  }

  return (
    <>
      <div className={css.header}>
        <p>{getString('connectors.cdng.healthSources.label')}</p>
        {!isRunTimeInput ? (
          <RbacButton
            variation={ButtonVariation.LINK}
            permission={{
              permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
              resource: {
                resourceType: ResourceType.MONITOREDSERVICE,
                resourceIdentifier: projectIdentifier
              }
            }}
            onClick={addHealthSource}
            text={getString('plusAdd')}
            data-testid="plusAdd-button"
            style={{ paddingLeft: 0 }}
          />
        ) : null}
      </div>
      <Text padding={{ bottom: 'medium' }}>{getString('connectors.cdng.healthSources.healthSourceDef')}</Text>
      {isEmpty(healthSources) ? (
        <>
          <NoDataCard
            image={noHealthsourcesImage}
            width={290}
            containerClassName={css.noHealthSourceImage}
            imageClassName={css.noHealthSourceImageClass}
          />
          <FormInput.CustomRender
            name={'spec.healthSources'}
            render={() => <>{getString('connectors.cdng.healthSources.noHealthSourcesDefined')}</>}
          />
        </>
      ) : (
        <TableV2<HealthSource>
          columns={[
            {
              Header: 'Source',
              accessor: 'name',
              width: '60%',
              Cell: TypeTableCell
            },
            {
              Header: 'Type',
              accessor: 'type',
              width: '40%',
              Cell: HealthSourceActions
            }
          ]}
          data={healthSources as HealthSource[]}
          className={css.table}
          rowDataTestID={originalData => `healthSourceTable_${originalData.name}`}
        />
      )}
    </>
  )
}
