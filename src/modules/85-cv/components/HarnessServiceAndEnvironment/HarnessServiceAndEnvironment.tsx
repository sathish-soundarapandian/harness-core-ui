/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { FormInput, SelectOption } from '@harness/uicore'
import type { CustomRenderProps } from '@harness/uicore/dist/components/FormikForm/FormikForm'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  useGetServiceListForProject,
  GetServiceListForProjectQueryParams,
  useGetEnvironmentListForProject
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import {
  ServiceSelectOrCreate,
  ServiceSelectOrCreateProps
} from './components/ServiceSelectOrCreate/ServiceSelectOrCreate'
import {
  EnvironmentSelectOrCreate,
  EnvironmentSelectOrCreateProps
} from './components/EnvironmentSelectOrCreate/EnvironmentSelectOrCreate'
import {
  EnvironmentMultiSelectOrCreate,
  EnvironmentMultiSelectOrCreateProps
} from './components/EnvironmentMultiSelectAndEnv/EnvironmentMultiSelectAndEnv'
import {
  ServiceMultiSelectOrCreate,
  ServiceMultiSelectOrCreateProps
} from './components/ServiceMultiSelectOrCreate/ServiceMultiSelectOrCreate'
import { getQueryParams, getScopedServiceEnvironmentOption } from './HarnessServiceAndEnvironment.utils'
import css from './HarnessServiceAndEnvironment.module.scss'

export function useGetHarnessServices(includeAccountAndOrgLevel?: boolean) {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([])
  const queryParams: GetServiceListForProjectQueryParams = getQueryParams({
    includeAccountAndOrgLevel,
    params: { accountId, orgIdentifier, projectIdentifier }
  })
  const { error, loading, data } = useGetServiceListForProject({ queryParams })

  useEffect(() => {
    if (loading) {
      setServiceOptions([{ label: getString('loading'), value: '' }])
    } else if (error) {
      clear()
      showError(error?.message, 7000)
      setServiceOptions([])
    } else if (data?.data?.content) {
      const options = getScopedServiceEnvironmentOption({
        content: data.data.content,
        scopedIdentifiers: includeAccountAndOrgLevel
      })
      setServiceOptions(options)
    }
  }, [loading, error, data])

  return { serviceOptions, setServiceOptions }
}

export function useGetHarnessEnvironments(includeAccountAndOrgLevel?: boolean) {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const [environmentOptions, setEnvironmentOptions] = useState<SelectOption[]>([])
  const queryParams: GetServiceListForProjectQueryParams = getQueryParams({
    includeAccountAndOrgLevel,
    params: { accountId, orgIdentifier, projectIdentifier }
  })
  const { error, loading, data } = useGetEnvironmentListForProject({ queryParams })

  useEffect(() => {
    if (loading) {
      setEnvironmentOptions([{ label: getString('loading'), value: '' }])
    } else if (error) {
      clear()
      showError(error?.message, 7000)
      setEnvironmentOptions([])
    } else if (data?.data?.content) {
      const options = getScopedServiceEnvironmentOption({
        content: data.data.content,
        scopedIdentifiers: includeAccountAndOrgLevel
      })
      setEnvironmentOptions(options)
    }
  }, [loading, error, data])

  return { environmentOptions, setEnvironmentOptions }
}

export function HarnessService(props: ServiceSelectOrCreateProps): JSX.Element {
  return <ServiceSelectOrCreate {...props} className={cx(css.serviceEnvDropdown, props.className)} />
}

export function HarnessEnvironment(props: EnvironmentSelectOrCreateProps): JSX.Element {
  return <EnvironmentSelectOrCreate {...props} className={cx(css.serviceEnvDropdown, props.className)} />
}

export function HarnessServiceAsFormField(props: {
  customRenderProps: Omit<CustomRenderProps, 'render'>
  serviceProps: ServiceSelectOrCreateProps | ServiceMultiSelectOrCreateProps
  customLoading?: boolean
  isMultiSelectField?: boolean
}): JSX.Element {
  const { customRenderProps, serviceProps, customLoading, isMultiSelectField } = props

  return (
    <FormInput.CustomRender
      {...customRenderProps}
      tooltipProps={{ dataTooltipId: 'serviceSelectOrCreate' }}
      render={formikProps =>
        isMultiSelectField ? (
          <ServiceMultiSelectOrCreate
            {...(serviceProps as ServiceMultiSelectOrCreateProps)}
            customLoading={customLoading}
            onSelect={selectedOption => {
              formikProps.setFieldValue(customRenderProps.name, selectedOption)
              ;(serviceProps as ServiceMultiSelectOrCreateProps).onSelect?.(selectedOption)
            }}
          />
        ) : (
          <ServiceSelectOrCreate
            {...(serviceProps as ServiceSelectOrCreateProps)}
            customLoading={customLoading}
            onSelect={selectedOption => {
              formikProps.setFieldValue(customRenderProps.name, selectedOption)
              ;(serviceProps as ServiceSelectOrCreateProps).onSelect?.(selectedOption)
            }}
          />
        )
      }
    />
  )
}

export function HarnessEnvironmentAsFormField(props: {
  customRenderProps: Omit<CustomRenderProps, 'render'>
  environmentProps: EnvironmentSelectOrCreateProps | EnvironmentMultiSelectOrCreateProps
  isMultiSelectField?: boolean
}): JSX.Element {
  const { customRenderProps, environmentProps, isMultiSelectField } = props

  return (
    <FormInput.CustomRender
      {...customRenderProps}
      tooltipProps={{ dataTooltipId: 'environmentSelectOrCreate' }}
      key={`${
        Array.isArray(environmentProps.item)
          ? (environmentProps.item?.[0]?.value as string)
          : (environmentProps.item?.value as string)
      }`}
      render={formikProps =>
        isMultiSelectField ? (
          <EnvironmentMultiSelectOrCreate
            {...(environmentProps as EnvironmentMultiSelectOrCreateProps)}
            onSelect={selectedOption => {
              formikProps.setFieldValue(customRenderProps.name, selectedOption)
              ;(environmentProps as EnvironmentMultiSelectOrCreateProps).onSelect?.(selectedOption)
            }}
          />
        ) : (
          <EnvironmentSelectOrCreate
            {...(environmentProps as EnvironmentSelectOrCreateProps)}
            onSelect={selectedOption => {
              formikProps.setFieldValue(customRenderProps.name, selectedOption)
              ;(environmentProps as EnvironmentSelectOrCreateProps).onSelect?.(selectedOption)
            }}
          />
        )
      }
    />
  )
}
