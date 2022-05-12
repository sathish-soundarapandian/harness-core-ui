/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { FormInput, SelectOption } from '@wings-software/uicore'
import type { CustomRenderProps } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  useGetServiceListForProject,
  GetServiceListForProjectQueryParams,
  useGetEnvironmentListForProject,
  GetEnvironmentListForProjectQueryParams
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
import css from './HarnessServiceAndEnvironment.module.scss'

export function useGetHarnessServices() {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([])
  const { error, loading, data } = useGetServiceListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetServiceListForProjectQueryParams
  })

  useEffect(() => {
    if (loading) {
      setServiceOptions([{ label: getString('loading'), value: '' }])
    } else if (error) {
      clear()
      showError(error?.message, 7000)
      setServiceOptions([])
    } else if (data?.data?.content) {
      const options = []
      for (const service of data.data.content) {
        if (service?.identifier && service.name) {
          options.push({
            label: service.name,
            value: service.identifier
          })
        }
      }
      setServiceOptions(options)
    }
  }, [loading, error, data])

  return { serviceOptions, setServiceOptions }
}

export function useGetHarnessEnvironments() {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const [environmentOptions, setEnvironmentOptions] = useState<SelectOption[]>([])
  const { error, loading, data } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetEnvironmentListForProjectQueryParams
  })

  useEffect(() => {
    if (loading) {
      setEnvironmentOptions([{ label: getString('loading'), value: '' }])
    } else if (error) {
      clear()
      showError(error?.message, 7000)
      setEnvironmentOptions([])
    } else if (data?.data?.content) {
      const options = []
      for (const service of data.data.content) {
        if (service?.identifier && service.name) {
          options.push({
            label: service.name,
            value: service.identifier
          })
        }
      }
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
  serviceProps: ServiceSelectOrCreateProps
  customLoading?: boolean
}): JSX.Element {
  const { customRenderProps, serviceProps, customLoading } = props

  return (
    <FormInput.CustomRender
      {...customRenderProps}
      tooltipProps={{ dataTooltipId: 'serviceSelectOrCreate' }}
      key={typeof serviceProps.item === 'string' ? serviceProps.item : (serviceProps.item?.value as string)}
      render={formikProps => (
        <ServiceSelectOrCreate
          {...serviceProps}
          customLoading={customLoading}
          onSelect={selectedOption => {
            formikProps.setFieldValue(customRenderProps.name, selectedOption)
            serviceProps.onSelect?.(selectedOption)
          }}
        />
      )}
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
