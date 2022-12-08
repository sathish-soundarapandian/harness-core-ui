/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { PageError, PageSpinner } from '@harness/uicore'
import { Module, ModuleName } from 'framework/types/ModuleName'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import type { Project } from 'services/cd-ng'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import bgImageURL from './assets/CVLandingPage.svg'

const CVHomePage: React.FC = () => {
  const moduleType = ModuleName.CV
  const module = moduleType.toLowerCase() as Module
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType },
    accountIdentifier: accountId,
    lazy: true
  })

  const { data: licenseData } = data || {}
  const expiryTime = licenseData?.maxExpiryTime
  const updatedLicenseInfo = licenseData && {
    ...licenseInformation?.[moduleType],
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
        routes.toCVSLOs({
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
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  }

  return (
    <HomePageTemplate
      title={getString('common.serviceReliabilityManagement')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('cv.dashboard.subHeading')}
      documentText={getString('cv.learnMore')}
    />
  )
}

export default CVHomePage
