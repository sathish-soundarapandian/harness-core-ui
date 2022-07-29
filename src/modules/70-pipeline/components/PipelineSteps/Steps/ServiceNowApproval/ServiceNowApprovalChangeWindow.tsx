/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { FormInput, Layout, Text } from '@harness/uicore'
import type { FormikContextType } from 'formik'
import React from 'react'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import type { ServiceNowApprovalData, ServiceNowTicketTypeSelectOption } from './types'
import css from '../Common/ApprovalRejectionCriteria.module.scss'

interface ServiceNowApprovalChangeWindowProps {
  formik: FormikContextType<ServiceNowApprovalData>
  fetchingServiceNowTicketTypes: boolean
  serviceNowTicketTypesFetchErrorMessage?: string
  readonly: boolean
  serviceNowTicketTypesOptions: ServiceNowTicketTypeSelectOption[]
}

export function ServiceNowApprovalChangeWindow({
  formik,
  fetchingServiceNowTicketTypes,
  serviceNowTicketTypesFetchErrorMessage,
  readonly,
  serviceNowTicketTypesOptions
}: ServiceNowApprovalChangeWindowProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const commonMultiTypeInputProps = (placeholder: string) => ({
    disabled: !formik.values?.spec.enableChangeWindow || readonly || fetchingServiceNowTicketTypes,
    selectItems: fetchingServiceNowTicketTypes
      ? [{ label: getString('pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'), value: '' }]
      : serviceNowTicketTypesOptions,

    placeholder: fetchingServiceNowTicketTypes
      ? getString('pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder')
      : serviceNowTicketTypesFetchErrorMessage
      ? serviceNowTicketTypesFetchErrorMessage
      : `${getString('select')} ${placeholder}`,

    useValue: true,
    multiTypeInputProps: {
      selectProps: {
        addClearBtn: true,
        items: fetchingServiceNowTicketTypes
          ? [{ label: getString('pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'), value: '' }]
          : serviceNowTicketTypesOptions
      },
      expressions
    }
  })

  return (
    <div className={css.approvalChangeWindow}>
      <Text color={Color.GREY_800} font={{ weight: 'semi-bold', size: 'normal' }}>
        {getString('pipeline.serviceNowApprovalStep.approvalChangeWindow')}
      </Text>

      <div className={css.windowSelection}>
        <FormInput.CheckBox
          disabled={readonly}
          name="spec.enableChangeWindow"
          label={getString('enable')}
          tooltipProps={{
            dataTooltipId: 'serviceNowApprovalEnableChangeWindow'
          }}
        />
        <Layout.Horizontal spacing="medium">
          <FormInput.MultiTypeInput
            name="spec.changeWindow.startField"
            label={getString('pipeline.serviceNowApprovalStep.windowStart')}
            {...commonMultiTypeInputProps(getString('pipeline.serviceNowApprovalStep.windowStart'))}
          />
          <FormInput.MultiTypeInput
            name="spec.changeWindow.endField"
            label={getString('pipeline.serviceNowApprovalStep.windowEnd')}
            {...commonMultiTypeInputProps(getString('pipeline.serviceNowApprovalStep.windowEnd'))}
          />
        </Layout.Horizontal>
      </div>
    </div>
  )
}
