/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useState } from 'react'
import { FormInput, MultiTypeInputType, SelectOption, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { HealthSourceParamValuesRequest, useGetParamValues } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'

export interface CommonHealthSourceFieldProps {
  field: FieldMapping
  isConnectorRuntimeOrExpression?: boolean
  connectorIdentifier: string
  providerType: HealthSourceParamValuesRequest['providerType']
}

export default function CommonHealthSourceField(props: CommonHealthSourceFieldProps): JSX.Element {
  const { field, isConnectorRuntimeOrExpression, connectorIdentifier, providerType } = props
  const { values } = useFormikContext<CommonCustomMetricFormikInterface>()
  const { isTemplate, expressions } = useContext(SetupSourceTabsContext)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [listOptions, setListOptions] = useState<SelectOption[]>([])
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { label, identifier, placeholder, type, isTemplateSupportEnabled, allowCreatingNewItems } = field
  const shouldShowTemplatisedComponent = isTemplate && isTemplateSupportEnabled
  const shouldFetchDropdownOptions = !(isTemplate && isTemplateSupportEnabled && isConnectorRuntimeOrExpression)
  const fieldValue = values?.[identifier] as string

  const { mutate: fetchParamValues, loading } = useGetParamValues({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const fetchParamValuesData = async (): Promise<void> => {
    const requestBody = {
      connectorIdentifier,
      providerType,
      paramName: identifier
    }
    try {
      const data = await fetchParamValues(requestBody)
      const paramValues = data?.resource?.paramValues || []
      const listOptionsData = paramValues.map(el => {
        return {
          label: el?.name as string,
          value: el?.value as string
        }
      })
      setListOptions(listOptionsData)
    } catch (errorData) {
      showError(getErrorMessage(errorData) as string)
    }
  }

  useEffect(() => {
    if (type === FIELD_ENUM.DROPDOWN && shouldFetchDropdownOptions) {
      fetchParamValuesData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchDropdownOptions, type])

  const renderField = (): JSX.Element => {
    switch (type) {
      case FIELD_ENUM.DROPDOWN:
        return (
          <>
            {shouldShowTemplatisedComponent ? (
              <FormInput.MultiTypeInput
                label={label}
                useValue
                name={identifier}
                selectItems={listOptions}
                data-testid={identifier}
                multiTypeInputProps={{
                  expressions,
                  /**
                   * Ignoring TS and ESLint as selectProps in MultiTypeInput requesting
                   * for all the select component props
                   *
                   * selectProps?: Omit<SelectProps, 'onChange' | 'value'>
                   *
                   * */
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  selectProps: { allowCreatingNewItems },
                  allowableTypes: isConnectorRuntimeOrExpression
                    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                }}
              />
            ) : (
              <FormInput.Select
                label={label}
                value={fieldValue ? { label: fieldValue, value: fieldValue } : undefined}
                name={identifier}
                disabled={loading}
                placeholder={loading ? getString('loading') : placeholder}
                items={listOptions}
                data-testid={identifier}
                selectProps={{ allowCreatingNewItems: true }}
              />
            )}
          </>
        )
      default:
        return <></>
    }
  }

  return <>{renderField()}</>
}
