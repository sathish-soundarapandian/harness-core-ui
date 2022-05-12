/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, isEqual } from 'lodash-es'

import { Button, ButtonVariation, Container, ExpandingSearchInput, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { EnvironmentGroupResponse, EnvironmentResponse } from 'services/cd-ng'

import ModalEnvironmentList from '../ModalEnvironmentList'

import css from '../EnvironmentGroups.module.scss'

export default function EditEnvironmentGroupModal({
  selectedEnvs,
  onEnvironmentUpdate
}: {
  selectedEnvs: EnvironmentGroupResponse[]
  onEnvironmentUpdate: (envsChanged: boolean, newEnvs?: EnvironmentResponse[]) => void
}) {
  const [newEnvs, setNewEnvs] = useState<EnvironmentResponse[]>(selectedEnvs)
  const [searchTerm, setSearchTerm] = useState('')

  const { getString } = useStrings()

  const onSelectedEnvironmentChange = (
    checked: boolean,
    selectedEnvironments: (string | EnvironmentResponse)[],
    item: EnvironmentResponse
  ) => {
    const identifier = item?.environment?.identifier
    if (checked && identifier) {
      setNewEnvs([...defaultTo(selectedEnvironments, []), item] as EnvironmentResponse[])
    } else {
      setNewEnvs([
        ...(selectedEnvironments as EnvironmentResponse[]).filter(
          /* istanbul ignore next */ (selectedEnv: EnvironmentResponse) =>
            selectedEnv.environment?.identifier !== identifier
        )
      ])
    }
  }

  return (
    <Layout.Vertical>
      <Container margin={{ bottom: 'small' }}>
        <ExpandingSearchInput
          alwaysExpanded
          placeholder={'Search Environments'}
          autoFocus={false}
          width={'100%'}
          onChange={setSearchTerm}
          throttle={200}
        />
      </Container>

      <Layout.Horizontal
        height={360}
        border={{
          radius: 4
        }}
      >
        <Layout.Vertical className={css.modalEnvironmentList} width={'50%'} border={{ right: true }}>
          <ModalEnvironmentList
            searchTerm={searchTerm}
            selectedEnvironments={newEnvs}
            onSelectedEnvironmentChange={onSelectedEnvironmentChange}
          />
        </Layout.Vertical>
        <Layout.Vertical
          flex={{ justifyContent: 'center', alignItems: 'flex-start' }}
          padding={{ left: 'medium', right: 'medium' }}
          width={'50%'}
        >
          <Text
            font={{ variation: FontVariation.H5 }}
            padding={{ bottom: 'medium' }}
            margin={{ bottom: 'medium' }}
            border={{ bottom: true }}
            width={'100%'}
          >
            {newEnvs.length} environment(s)
          </Text>
          {newEnvs.map(
            /*istanbul ignore next*/ data => (
              <Text
                font={{ weight: 'semi-bold', align: 'left' }}
                color={Color.BLACK}
                width={'280px'}
                lineClamp={1}
                key={data?.environment?.identifier}
              >
                {data?.environment?.name}
              </Text>
            )
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
      <Layout.Horizontal spacing="large">
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('add')}
          data-id="environment-group-edit"
          onClick={() => {
            onEnvironmentUpdate(!isEqual(selectedEnvs, newEnvs), newEnvs)
          }}
        />
        <Button
          variation={ButtonVariation.TERTIARY}
          text={getString('cancel')}
          onClick={/* istanbul ignore next */ () => onEnvironmentUpdate(false)}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
