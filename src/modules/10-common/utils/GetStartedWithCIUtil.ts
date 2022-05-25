/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  ResponseOrganizationResponse,
  ResponseProjectResponse,
  getOrganizationPromise,
  ResponseModuleLicenseDTO,
  postProjectPromise,
  postOrganizationPromise,
  startFreeLicensePromise,
  startTrialLicensePromise,
  ModuleLicenseDTO
} from 'services/cd-ng'
import { LicenseStoreContextProps, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import {
  DEFAULT_ORG_ID,
  DEFAULT_ORG_NAME,
  DEFAULT_PROJECT_ID,
  DEFAULT_PROJECT_NAME,
  Status
} from '@common/utils/CIConstants'
import { Editions } from '@common/constants/SubscriptionTypes'

export interface StartFreeLicenseAndSetupProjectCallback {
  orgId: string
  projectId: string
}

export interface SetUpCIInterface {
  accountId: string
  onSetUpSuccessCallback: ({ orgId, projectId }: StartFreeLicenseAndSetupProjectCallback) => void
  onSetupFailureCallback?: (error: any) => void
  licenseInformation:
    | {
        [key: string]: ModuleLicenseDTO
      }
    | Record<string, undefined>
  updateLicenseStore: (data: Partial<Pick<LicenseStoreContextProps, 'licenseInformation'>>) => void
  edition?: Editions
}

function startPlanByEdition(accountId: string, edition: Editions): Promise<ResponseModuleLicenseDTO> {
  switch (edition) {
    case Editions.FREE: {
      return startFreeLicensePromise({
        body: undefined,
        queryParams: {
          accountIdentifier: accountId,
          moduleType: 'CI'
        },
        requestOptions: {
          headers: {
            'content-type': 'application/json'
          }
        }
      })
    }
    case Editions.ENTERPRISE:
    case Editions.TEAM:
    default: {
      return startTrialLicensePromise({
        body: {
          edition,
          moduleType: 'CI'
        },
        queryParams: {
          accountIdentifier: accountId
        },
        requestOptions: {
          headers: {
            'content-type': 'application/json'
          }
        }
      })
    }
  }
}

const startPlanAndSetupProject = ({
  accountId,
  orgId: organizationId,
  onSetUpSuccessCallback,
  edition,
  onSetupFailureCallback,
  licenseInformation,
  updateLicenseStore
}: {
  accountId: string
  orgId: string
  onSetUpSuccessCallback: ({ orgId, projectId }: StartFreeLicenseAndSetupProjectCallback) => void
  onSetupFailureCallback?: (error?: any) => void
  licenseInformation:
    | {
        [key: string]: ModuleLicenseDTO
      }
    | Record<string, undefined>
  updateLicenseStore: (data: Partial<Pick<LicenseStoreContextProps, 'licenseInformation'>>) => void
  edition?: Editions
}) => {
  if (edition) {
    startPlanByEdition(accountId, edition)
      .then((startPlanResponse: ResponseModuleLicenseDTO) => {
        const { data: startPlanData, status: startPlanStatus } = startPlanResponse
        /* istanbul ignore else */ if (startPlanStatus === Status.SUCCESS) {
          handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, 'ci', startPlanData)
          setupProjectAndNavigateToDefaultProject({
            accountId,
            organizationId,
            onSetUpSuccessCallback,
            onSetupFailureCallback
          })
        } else if (startPlanStatus === Status.ERROR || startPlanStatus === Status.FAILURE) {
          onSetupFailureCallback?.()
        }
      })
      .catch(e => onSetupFailureCallback?.(e))
  } else {
    setupProjectAndNavigateToDefaultProject({
      accountId,
      organizationId,
      onSetUpSuccessCallback,
      onSetupFailureCallback
    })
  }
}

const setupProjectAndNavigateToDefaultProject = ({
  accountId,
  organizationId,
  onSetUpSuccessCallback,
  onSetupFailureCallback
}: {
  accountId: string
  organizationId: string
  onSetUpSuccessCallback: ({ orgId, projectId }: StartFreeLicenseAndSetupProjectCallback) => void
  onSetupFailureCallback?: (error?: any) => void
}) => {
  const UNIQUE_PROJECT_ID = `${DEFAULT_PROJECT_ID}_${new Date().getTime().toString()}`
  postProjectPromise({
    body: {
      project: {
        identifier: UNIQUE_PROJECT_ID,
        name: DEFAULT_PROJECT_NAME,
        orgIdentifier: organizationId
      }
    },
    queryParams: { accountIdentifier: accountId, orgIdentifier: organizationId }
  })
    .then((createProjectResponse: ResponseProjectResponse) => {
      const { data: projectData, status: createProjectResponseStatus } = createProjectResponse
      /* istanbul ignore else */ if (createProjectResponseStatus === 'SUCCESS' && projectData?.project.identifier) {
        onSetUpSuccessCallback({
          orgId: organizationId,
          projectId: projectData.project.identifier
        })
      }
    })
    .catch(e => onSetupFailureCallback?.(e))
}

export const setUpCI = ({
  accountId,
  edition,
  onSetUpSuccessCallback,
  onSetupFailureCallback,
  licenseInformation,
  updateLicenseStore
}: SetUpCIInterface): void => {
  try {
    getOrganizationPromise({
      identifier: DEFAULT_ORG_ID,
      queryParams: {
        accountIdentifier: accountId
      }
    })
      .then((fetchOrgResponse: ResponseOrganizationResponse) => {
        const { data: orgData, status: fetchOrgResponseStatus } = fetchOrgResponse
        if (fetchOrgResponseStatus === Status.SUCCESS && orgData?.organization.identifier === DEFAULT_ORG_ID) {
          startPlanAndSetupProject({
            accountId,
            orgId: DEFAULT_ORG_ID,
            onSetUpSuccessCallback,
            edition,
            onSetupFailureCallback,
            licenseInformation,
            updateLicenseStore
          })
        } else {
          // Org with id "default" doesn't exist. We need to create an org in this case.
          const UNIQUE_ORD_ID = `${DEFAULT_ORG_ID}_${new Date().getTime().toString()}`
          postOrganizationPromise({
            body: {
              organization: {
                identifier: UNIQUE_ORD_ID,
                name: DEFAULT_ORG_NAME
              }
            },
            queryParams: {
              accountIdentifier: accountId
            }
          })
            .then((createOrgResponse: ResponseOrganizationResponse) => {
              const { status: createOrgStatus, data: createOrgData } = createOrgResponse
              /* istanbul ignore else */ if (createOrgStatus === 'SUCCESS' && createOrgData?.organization?.identifier) {
                startPlanAndSetupProject({
                  accountId,
                  orgId: createOrgData?.organization?.identifier,
                  onSetUpSuccessCallback,
                  edition,
                  licenseInformation,
                  updateLicenseStore
                })
              }
            })
            .catch(e => onSetupFailureCallback?.(e))
        }
      })
      .catch(e => onSetupFailureCallback?.(e))
  } catch (e) {
    onSetupFailureCallback?.(e)
  }
}
