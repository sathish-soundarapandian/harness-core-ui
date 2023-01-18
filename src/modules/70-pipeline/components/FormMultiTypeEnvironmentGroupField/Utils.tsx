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
import { EnvironmentGroupResponseDTO, Failure, getEnvironmentGroupListPromise } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import environmentGroupEmptyStateSvc from '@pipeline/icons/noDataFound.svg'
import css from './FormMultiTypeEnvironmentGroupField.module.scss'

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
  setPagedEnvironmentGroupData,
  selectedEnvironmentGroups,
  getString
}: any): Omit<
  ReferenceSelectProps<EnvironmentGroupResponseDTO>,
  'onChange' | 'onMultiSelectChange' | 'onCancel' | 'pagination'
> {
  return {
    name,
    width,
    selectAnReferenceLabel: getString('pipeline.envGroupLabel'),
    selected,
    placeholder,
    defaultScope,
    createNewLabel: getString('common.environmentGroup.label'),
    isNewConnectorLabelVisible: true,
    fetchRecords: (done, search, page, scope, signal = undefined) => {
      const request = getEnvironmentGroupListPromise(
        {
          queryParams: {
            accountIdentifier: accountIdentifier,
            projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
            orgIdentifier: scope !== Scope.ACCOUNT ? orgIdentifier : undefined,
            page: page ? page - 1 : 0,
            searchTerm: search
          },
          body: {
            filterType: 'EnvironmentGroup'
          }
        },
        signal
      )
      return request
        .then(responseData => {
          if (responseData?.data?.content?.length) {
            setPagedEnvironmentGroupData(responseData)
            const environmentGroupList = responseData?.data?.content?.map(environmentGroup => ({
              identifier: defaultTo(environmentGroup.envGroup?.identifier, ''),
              name: defaultTo(environmentGroup.envGroup?.name, ''),
              record: {
                accountId: defaultTo(environmentGroup.envGroup?.accountId, ''),
                deleted: defaultTo(environmentGroup.envGroup?.deleted, false),
                description: defaultTo(environmentGroup.envGroup?.description, ''),
                envIdentifiers: defaultTo(environmentGroup.envGroup?.envIdentifiers, []),
                envResponse: defaultTo(environmentGroup.envGroup?.envResponse, []),
                gitDetails: environmentGroup.envGroup?.gitDetails,
                identifier: defaultTo(environmentGroup.envGroup?.identifier, ''),
                name: defaultTo(environmentGroup.envGroup?.name, ''),
                orgIdentifier: scope !== Scope.ACCOUNT ? orgIdentifier : undefined,
                projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
                tags: environmentGroup.envGroup?.tags
              }
            }))
            done(environmentGroupList)
          } else done([])
        })
        .catch((err: Failure) => {
          throw err.message
        })
    },
    projectIdentifier,
    orgIdentifier,
    noRecordsText: getString('pipeline.noEnvironmentGroupsFound'),
    componentName: getString('common.environmentGroup.label'),
    noDataCard: {
      image: environmentGroupEmptyStateSvc,
      message: getString('pipeline.noEnvironmentGroupsFound'),
      containerClassName: css.noDataCardContainerConnector,
      className: css.noDataCardContainerContent
    },
    isMultiSelect,
    selectedReferences: selectedEnvironmentGroups,
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
