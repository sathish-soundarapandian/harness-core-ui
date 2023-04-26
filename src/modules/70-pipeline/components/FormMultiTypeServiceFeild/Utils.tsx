/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { Failure, getServiceAccessListPromise, ServiceDefinition, ServiceResponseDTO } from 'services/cd-ng'
import type { ReferenceSelectProps } from '@common/components/ReferenceSelect/ReferenceSelect'
import { Scope } from '@common/interfaces/SecretsInterface'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import serviceEmptyStateSvg from '@pipeline/icons/emptyInstanceDetail.svg'
import css from './FormMultiTypeServiceField.module.scss'

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
  deploymentType,
  gitOpsEnabled,
  deploymentMetadata,
  setPagedServiceData,
  selectedServices,
  getString
}: any): Omit<
  ReferenceSelectProps<ServiceResponseDTO>,
  'onChange' | 'onMultiSelectChange' | 'onCancel' | 'pagination'
> {
  return {
    name,
    width,
    selectAnReferenceLabel: getString('pipeline.serviceLabel'),
    selected,
    placeholder,
    defaultScope,
    createNewLabel: getString('service'),
    isNewConnectorLabelVisible: true,
    fetchRecords: (done, search, page, scope, signal = undefined) => {
      const request = getServiceAccessListPromise(
        {
          queryParams: {
            page: page,
            accountIdentifier: accountIdentifier,
            orgIdentifier: scope !== Scope.ACCOUNT ? orgIdentifier : undefined,
            projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
            searchTerm: search,
            type: deploymentType as ServiceDefinition['type'],
            gitOpsEnabled: gitOpsEnabled,
            deploymentMetadataYaml: deploymentMetadata ? yamlStringify(deploymentMetadata) : undefined,
            deploymentTemplateIdentifier: ''
          }
        },
        signal
      )
      return request
        .then(responseData => {
          if (responseData?.data?.length) {
            setPagedServiceData(responseData)
            const servicesList = responseData?.data?.map(service => ({
              identifier: defaultTo(service.service?.identifier, ''),
              name: defaultTo(service.service?.name, ''),
              record: {
                identifier: defaultTo(service.service?.identifier, ''),
                name: defaultTo(service.service?.name, ''),
                description: service.service?.description,
                tags: service.service?.tags,
                orgIdentifier: scope !== Scope.ACCOUNT ? orgIdentifier : undefined,
                projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined
              }
            }))
            done(servicesList)
          } else done([])
        })
        .catch((err: Failure) => {
          throw err.message
        })
    },
    projectIdentifier,
    orgIdentifier,
    noRecordsText: getString('pipeline.noServicesFound'),
    componentName: getString('service'),
    noDataCard: {
      image: serviceEmptyStateSvg,
      message: getString('pipeline.noServicesFound'),
      containerClassName: css.noDataCardContainerConnector,
      className: css.noDataCardContainerContent
    },
    isMultiSelect,
    selectedReferences: selectedServices,
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
