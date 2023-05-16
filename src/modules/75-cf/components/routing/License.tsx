/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { ModuleName } from 'framework/types/ModuleName'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext';
import { LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'

/* istanbul ignore next */
export const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: 'cf'
      })}
    />
  )
}

/* istanbul ignore next */
export const RedirectToSubscriptions = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: ModuleName.CF.toLowerCase() as Module
      })}
    />
  )
}

export const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.FF_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptions
}
