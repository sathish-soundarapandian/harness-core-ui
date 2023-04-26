/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { PageError, PageSpinner } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Module, ModuleName } from 'framework/types/ModuleName'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Project, useGetLicensesAndSummary } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import bgImage from '@et/images/cet.svg'

const ETHomePage: React.FC = () => {
  const { getString } = useStrings()
  const moduleType = ModuleName.CET
  const module = moduleType.toLowerCase() as Module
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CET },
    accountIdentifier: accountId,
    lazy: true
  })

  const { data: licenseData } = data || {}
  const expiryTime = licenseData?.maxExpiryTime
  const updatedLicenseInfo = licenseData && {
    ...licenseInformation?.[ModuleName.CET],
    ...pick(licenseData, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    refetch()
  }, [])

  const projectCreateSuccessHandler = (project?: Project): void => {
    if (project) {
      history.push(
        routes.toETMonitoredServices({
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier || '',
          accountId
        })
      )
    }
  }

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    const message = (error?.data as Error)?.message || error?.message
    return <PageError message={message} onClick={() => refetch()} />
  }

  if (data?.status === 'SUCCESS' && !data.data) {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module
      })
    )
  }

  return (
    <HomePageTemplate
      title={getString('et.continuous')}
      bgImageUrl={bgImage}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('et.homepage.slogan')}
      documentText={getString('et.homepage.learnMore')}
      documentURL="https://developer.harness.io/docs/service-reliability-management/continuous-error-tracking/getting-started/cet-overview"
    />
  )
}

export default ETHomePage
