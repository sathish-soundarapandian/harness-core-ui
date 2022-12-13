import React from 'react'
import { defaultTo } from 'lodash-es'
import { Color } from '@harness/design-system'
import { Icon, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import type { ReferenceSelectProps } from '@common/components/ReferenceSelect/ReferenceSelect'
import { Failure, getServiceAccessListPromise, ServiceDefinition, ServiceResponseDTO } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
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
    selectAnReferenceLabel: 'Select an existing service',
    selected,
    placeholder,
    defaultScope,
    createNewLabel: 'Service',
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
                projectIdentifier: projectIdentifier,
                orgIdentifier: orgIdentifier
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
    noRecordsText: 'No services found',
    componentName: 'Service',
    noDataCard: {
      message: 'No Services Found'
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
