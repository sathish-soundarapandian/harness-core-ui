/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Color } from '@harness/design-system'
import { Icon, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import type { ReferenceSelectProps } from '@common/components/ReferenceSelect/ReferenceSelect'
import { EnvironmentResponseDTO, Failure, getEnvironmentAccessListPromise } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import css from './FormMultiTypeEnvironmentField.module.scss'

export function getReferenceFieldProps({
  defaultScope,
  projectIdentifier,
  orgIdentifier,
  name,
  width,
  selected,
  placeholder,
  isMultiSelect,
  accountIdentifier,
  setPagedEnvironmentData,
  selectedEnvironments,
  getString
}: any): Omit<
  ReferenceSelectProps<EnvironmentResponseDTO>,
  'onChange' | 'onMultiSelectChange' | 'onCancel' | 'pagination'
> {
  return {
    name,
    width,
    selectAnReferenceLabel: 'Select an existing Environment',
    selected,
    placeholder,
    defaultScope,
    createNewLabel: 'Environment',
    isNewConnectorLabelVisible: true,
    fetchRecords: (done, search, page, scope, signal = undefined) => {
      const request = getEnvironmentAccessListPromise(
        {
          queryParams: {
            page: page,
            accountIdentifier: accountIdentifier,
            orgIdentifier: scope !== Scope.ACCOUNT ? orgIdentifier : undefined,
            projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
            searchTerm: search
          }
        },
        signal
      )
      return request
        .then(responseData => {
          if (responseData?.data?.length) {
            setPagedEnvironmentData(responseData)
            const environmentsList = responseData?.data?.map(environment => ({
              identifier: defaultTo(environment.environment?.identifier, ''),
              name: defaultTo(environment.environment?.name, ''),
              record: {
                identifier: defaultTo(environment.environment?.identifier, ''),
                name: defaultTo(environment.environment?.name, ''),
                description: environment.environment?.description,
                tags: environment.environment?.tags,
                type: environment.environment?.type,
                projectIdentifier: projectIdentifier,
                orgIdentifier: orgIdentifier
              }
            }))
            done(environmentsList)
          } else done([])
        })
        .catch((err: Failure) => {
          throw err.message
        })
    },
    projectIdentifier,
    orgIdentifier,
    noRecordsText: 'No environments found',
    componentName: 'Environment',
    noDataCard: {
      message: 'No Environments Found'
    },
    isMultiSelect,
    selectedReferences: selectedEnvironments,
    recordRender: function recordRender({ item, selected: checked }) {
      return (
        <Layout.Horizontal margin={{ left: 'small' }} flex={{ distribution: 'space-between' }} className={css.item}>
          <Layout.Horizontal spacing="medium" className={css.leftInfo}>
            <Icon className={cx(css.iconCheck, { [css.iconChecked]: checked })} size={14} name="pipeline-approval" />
            <div className={css.serviceNameId}>
              <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.BLACK}>
                {item.record.name}
              </Text>
              <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                {`${getString('common.ID')}: ${item.identifier}`}
              </Text>
            </div>
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
    }
  }
}
