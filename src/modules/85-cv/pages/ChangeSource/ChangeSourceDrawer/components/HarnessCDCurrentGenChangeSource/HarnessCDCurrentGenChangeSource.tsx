/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { FormInput, Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  GetListApplicationsQueryParams,
  useGetListApplications,
  useGetListEnvironments,
  useGetListServices
} from 'services/portal'
import type { UpdatedChangeSourceDTO } from '../../ChangeSourceDrawer.types'
import {
  getApplicationsData,
  getEnvironmentsData,
  getHarnessCDFieldValue,
  getPlaceHolder,
  getServicesData,
  showToasterError
} from './HarnessCDCurrentGenChangeSource.utils'

export default function HarnessCDCurrentGenChangeSource({
  formik: { values: formValues, setFieldValue }
}: {
  formik: FormikProps<UpdatedChangeSourceDTO>
}): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const [showEnvAndServices, setShowEnvAndServices] = useState<boolean>(false)
  const [currentApplicationId, setCurrentApplicationId] = useState<string>('')

  const servicesAndEnvQueryParams = useMemo(() => {
    return {
      appId: !currentApplicationId
        ? formValues?.spec?.harnessApplicationId
        : formValues?.spec?.harnessApplicationId?.value,
      accountId,
      details: false
    }
  }, [accountId, currentApplicationId, formValues?.spec?.harnessApplicationId])

  const {
    data: environmentsData,
    loading: loadingEnvironments,
    error: errorEnvironments,
    refetch: refetchEnvironments
  } = useGetListEnvironments({
    queryParams: servicesAndEnvQueryParams,
    lazy: true
  })

  const {
    data: servicesData,
    loading: loadingServices,
    error: errorServices,
    refetch: refetchServices
  } = useGetListServices({
    queryParams: servicesAndEnvQueryParams,
    lazy: true
  })

  const {
    data: applicationsData,
    loading: applicationsLoading,
    error: applicationsError
  } = useGetListApplications({
    queryParams: {
      accountId,
      details: false
    } as GetListApplicationsQueryParams
  })

  // on selecting appId in the dropdown
  useEffect(() => {
    if (formValues?.spec?.harnessApplicationId) {
      if (!showEnvAndServices) {
        setShowEnvAndServices(true)
      }

      // if env/service is selected then it has to be reset on appId change from the dropdown
      if (currentApplicationId) {
        let updatedSpecs = { ...formValues?.spec }

        if (formValues?.spec?.harnessServiceId) {
          updatedSpecs = { ...updatedSpecs, harnessServiceId: '' }
        }
        if (formValues?.spec?.harnessEnvironmentId) {
          updatedSpecs = { ...updatedSpecs, harnessEnvironmentId: '' }
        }
        setFieldValue('spec', updatedSpecs)
      }

      // Fetching service and envs for selected appId
      Promise.all([
        refetchEnvironments({ queryParams: servicesAndEnvQueryParams }),
        refetchServices({ queryParams: servicesAndEnvQueryParams })
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues?.spec?.harnessApplicationId, currentApplicationId])

  // showing error in case of any api errors.
  useEffect(() => {
    showToasterError(errorEnvironments, clear, showError)
    showToasterError(errorServices, clear, showError)
    showToasterError(applicationsError, clear, showError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorEnvironments, errorServices, applicationsError])

  const applications = useMemo(() => getApplicationsData(applicationsData), [applicationsData])
  const services = useMemo(() => getServicesData(servicesData), [servicesData])
  const environments = useMemo(() => getEnvironmentsData(environmentsData), [environmentsData])

  return (
    <Layout.Horizontal spacing={'xxlarge'}>
      <FormInput.Select
        name="spec.harnessApplicationId"
        label={getString('cv.changeSource.HarnessCDCurrentGen.applicationId')}
        placeholder={getPlaceHolder(
          applicationsLoading,
          getString('cv.changeSource.HarnessCDCurrentGen.selectHarnessAppId'),
          getString('loading')
        )}
        items={applications}
        onChange={application => {
          setFieldValue('spec', { ...formValues?.spec, harnessApplicationId: application })
          setCurrentApplicationId(application.value as string)
        }}
        value={getHarnessCDFieldValue(currentApplicationId, applications, formValues?.spec?.harnessApplicationId)}
      />
      {showEnvAndServices ? (
        <>
          <FormInput.Select
            name="spec.harnessServiceId"
            label={getString('cv.harnessService')}
            placeholder={getPlaceHolder(
              loadingServices,
              getString('cv.changeSource.HarnessCDCurrentGen.selectHarnessService'),
              getString('loading')
            )}
            items={services}
            onChange={service => setFieldValue('spec', { ...formValues?.spec, harnessServiceId: service })}
            value={getHarnessCDFieldValue(currentApplicationId, services, formValues?.spec?.harnessServiceId)}
          />
          <FormInput.Select
            name="spec.harnessEnvironmentId"
            label={getString('cv.harnessEnvironment')}
            placeholder={getPlaceHolder(
              loadingEnvironments,
              getString('cv.changeSource.HarnessCDCurrentGen.selectHarnessEnv'),
              getString('loading')
            )}
            items={environments}
            onChange={environment => setFieldValue('spec', { ...formValues?.spec, harnessEnvironmentId: environment })}
            value={getHarnessCDFieldValue(currentApplicationId, environments, formValues?.spec?.harnessEnvironmentId)}
          />
        </>
      ) : null}
    </Layout.Horizontal>
  )
}
