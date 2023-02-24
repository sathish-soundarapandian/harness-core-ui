/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Column } from 'react-table'
import { defaultTo } from 'lodash-es'

import { Button, ButtonVariation, Container, Heading, Icon, Layout, TableV2 } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { EnvironmentResponse } from 'services/cd-ng'

import { useDeepCompareEffect } from '@common/hooks'

import {
  DeleteCheckbox,
  EnvironmentName,
  EnvironmentTypes,
  withEnvironment
} from '@cd/components/EnvironmentsV2/EnvironmentsList/EnvironmentsListColumns'

import { LastUpdatedBy } from '../EnvironmentGroupsList/EnvironmentGroupsListColumns'

import EmptyEnvironmentGroup from '../images/EmptyEnvironmentGroup.svg'

type CustomColumn<T extends Record<string, any>> = Column<T>

export function EnvironmentList({
  list,
  showModal,
  onDeleteEnvironments
}: {
  list: EnvironmentResponse[]
  showModal: () => void
  onDeleteEnvironments: (environmentsToRemove: EnvironmentResponse[]) => void
}): JSX.Element {
  const { getString } = useStrings()
  const [environmentsToRemove, setEnvironmentsToRemove] = useState<EnvironmentResponse[]>([])

  const onCheckboxSelect = useCallback((event: FormEvent<HTMLInputElement>, item: EnvironmentResponse): void => {
    const identifier = item.environment?.identifier
    if ((event.target as any).checked && identifier) {
      setEnvironmentsToRemove(prevEnvs => [...defaultTo(prevEnvs, []), item])
    } else {
      setEnvironmentsToRemove(prevEnvs =>
        prevEnvs.filter((selectedEnv: EnvironmentResponse) => selectedEnv.environment?.identifier !== identifier)
      )
    }
  }, [])

  useDeepCompareEffect(() => {
    setEnvironmentsToRemove([])
  }, [list])

  const onDeleteEnvironmentsRef = useRef(onDeleteEnvironments)

  useEffect(() => {
    onDeleteEnvironmentsRef.current = onDeleteEnvironments
  }, [onDeleteEnvironments])

  const envColumns: CustomColumn<EnvironmentResponse>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '50%',
        Cell: withEnvironment(EnvironmentName)
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        id: 'type',
        width: '15%',
        Cell: withEnvironment(EnvironmentTypes)
      },
      {
        Header: getString('lastUpdatedBy').toUpperCase(),
        id: 'lastUpdatedBy',
        width: '30%',
        Cell: withEnvironment(LastUpdatedBy)
      },
      {
        Header: (
          <Icon
            name={'main-trash'}
            onClick={() => onDeleteEnvironmentsRef.current(environmentsToRemove)}
            style={{ cursor: 'pointer' }}
          />
        ),
        id: 'delete',
        width: '5%',
        Cell: DeleteCheckbox,
        onCheckboxSelect,
        environmentsToRemove
      }
    ],
    [environmentsToRemove, getString, onCheckboxSelect]
  )

  const hasEnvs = Boolean(list.length)
  const emptyEnvs = Boolean(list.length === 0)

  return (
    <>
      {hasEnvs && (
        <Container padding={{ top: 'medium' }} border={{ top: true }}>
          <TableV2<EnvironmentResponse> columns={envColumns} data={list} />
        </Container>
      )}
      {emptyEnvs && (
        <Layout.Vertical flex={{ align: 'center-center' }} height={'70vh'}>
          <img src={EmptyEnvironmentGroup} alt={getString('cd.noEnvironment.title')} />
          <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
            {getString('common.environmentGroup.noEnvironment')}
          </Heading>
          <Button text={getString('environment')} icon="plus" onClick={showModal} variation={ButtonVariation.PRIMARY} />
        </Layout.Vertical>
      )}
    </>
  )
}
