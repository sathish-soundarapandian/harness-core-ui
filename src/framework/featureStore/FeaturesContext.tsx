/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { isEmpty, isEqual } from 'lodash-es'
import produce from 'immer'

import { useParams } from 'react-router-dom'
import { useToaster } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetEnabledFeatureRestrictionDetailByAccountId,
  useGetFeatureRestrictionDetail,
  useGetAllFeatureRestrictionMetadata,
  FeatureRestrictionDetailRequestDTO,
  ModuleLicenseDTO
} from 'services/cd-ng'
import type { RestrictionType } from '@common/constants/SubscriptionTypes'
import { Editions } from '@common/constants/SubscriptionTypes'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'

import type { FeatureIdentifier } from './FeatureIdentifier'
import type {
  FeatureDetail,
  FeatureMetaData,
  ModuleType,
  FeatureRequest,
  FeaturesRequest,
  FeatureRequestOptions,
  CheckFeatureReturn
} from './featureStoreUtil'

type Features = Map<FeatureIdentifier, FeatureDetail>
type FeatureMap = Map<FeatureIdentifier, FeatureMetaData>

interface GetHighestEditionProps {
  licenseInformation?: { [key: string]: ModuleLicenseDTO } | Record<string, undefined>
  licenseState: {
    [key: string]: LICENSE_STATE_VALUES
  }
}
interface GetEditionProps extends GetHighestEditionProps {
  moduleType: ModuleType
  isCommunity: boolean
}

interface GetRestrictionTypeProps extends GetHighestEditionProps {
  featureRequest?: FeatureRequest
  isCommunity: boolean
}

export interface FeaturesContextProps {
  // features only cache enabled features
  features: Features
  featureMap: FeatureMap
  getEdition: (props: GetEditionProps) => Editions | undefined
  requestFeatures: (featureRequest: FeatureRequest | FeaturesRequest, options?: FeatureRequestOptions) => void
  checkFeature: (featureName: FeatureIdentifier) => CheckFeatureReturn
  requestLimitFeature: (featureRequest: FeatureRequest) => void
  checkLimitFeature: (featureName: FeatureIdentifier) => CheckFeatureReturn
  getRestrictionType: (props: GetRestrictionTypeProps) => RestrictionType | undefined
  getHighestEdition: (props: GetHighestEditionProps) => Editions
}

const defaultReturn = {
  enabled: true
}

export const FeaturesContext = createContext<FeaturesContextProps>({
  // features caches features which restrictionType is AVAILABILITY and enabled
  features: new Map<FeatureIdentifier, FeatureDetail>(),
  // featureMap caches all feature metadata, featureName: { edition, restrictionType }
  featureMap: new Map<FeatureIdentifier, FeatureMetaData>(),
  getEdition: () => {
    return undefined
  },
  requestFeatures: () => void 0,
  checkFeature: () => {
    return defaultReturn
  },
  requestLimitFeature: () => void 0,
  checkLimitFeature: () => {
    return defaultReturn
  },
  getRestrictionType: () => {
    return undefined
  },
  getHighestEdition: () => {
    return Editions.FREE
  }
})

export function useFeaturesContext(): FeaturesContextProps {
  return useContext(FeaturesContext)
}

let pendingAvailRequests: (FeatureRequest | FeaturesRequest)[] = []
let pendingLimitRequests: FeatureRequest[] = []

export function FeaturesProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [features, setFeatures] = useState<Features>(new Map<FeatureIdentifier, FeatureDetail>())
  const [featureMap, setFeatureMap] = useState<FeatureMap>(new Map<FeatureIdentifier, FeatureMetaData>())
  const [hasErr, setHasErr] = useState<boolean>(false)
  const { showError } = useToaster()
  const { getString } = useStrings()

  const { accountId } = useParams<AccountPathProps>()

  const {
    data: enabledFeatureList,
    refetch: getEnabledFeatures,
    error: gettingEnabledFeaturesError
  } = useGetEnabledFeatureRestrictionDetailByAccountId({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const { data: metadata, error: gettingFeatureMetadataError } = useGetAllFeatureRestrictionMetadata({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    if (!isEmpty(enabledFeatureList)) {
      const list = enabledFeatureList?.data?.reduce((acc, curr) => {
        if (curr?.name) {
          acc?.set(curr.name as FeatureIdentifier, {
            featureName: curr.name as FeatureIdentifier,
            enabled: !!curr.allowed,
            moduleType: curr.moduleType
          })
        }
        return acc
      }, new Map<FeatureIdentifier, FeatureDetail>())
      list && setFeatures(list)
    }
  }, [enabledFeatureList])

  useEffect(() => {
    if (!isEmpty(metadata)) {
      const list = metadata?.data?.reduce((acc, curr) => {
        if (curr?.name && curr?.restrictionMetadata) {
          acc?.set(curr.name as FeatureIdentifier, {
            moduleType: curr.moduleType as ModuleType,
            restrictionMetadataMap: curr.restrictionMetadata
          })
        }
        return acc
      }, new Map<FeatureIdentifier, FeatureMetaData>())
      list && setFeatureMap(list)
    }
  }, [metadata])

  useEffect(() => {
    if (gettingEnabledFeaturesError) {
      // set err flag to true
      setHasErr(true)
      showError(gettingEnabledFeaturesError.message || getString('somethingWentWrong'))
      // reset the queque
      pendingAvailRequests = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gettingEnabledFeaturesError])

  useEffect(() => {
    if (gettingFeatureMetadataError) {
      showError(gettingFeatureMetadataError.message || getString('somethingWentWrong'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gettingFeatureMetadataError])

  async function getEnabledFeatureList(featureRequest: FeatureRequest | FeaturesRequest): Promise<void> {
    // check if this request is already queued
    if (pendingAvailRequests.length === 0) {
      pendingAvailRequests.push(featureRequest)
    } else {
      return
    }
    await getEnabledFeatures({})
    // reset the queque
    pendingAvailRequests = []

    // reset hasErr
    setHasErr(false)
  }

  // this function is called from `useFeature` hook to cache all enabled AVAILABILITY features
  async function requestFeatures(
    featureRequest: FeatureRequest | FeaturesRequest,
    options?: FeatureRequestOptions
  ): Promise<void> {
    const { skipCache = false, skipCondition } = options || {}

    // exit early if we already fetched features before
    // disabling this will disable caching, because it will make a fresh request and update in the store
    if (!skipCache && features.size > 0) {
      return
    }

    // exit early if user has defined a skipCondition and if it returns true
    if (skipCondition && skipCondition(featureRequest) === true) {
      return
    }

    getEnabledFeatureList(featureRequest)
  }

  function checkFeature(featureName: FeatureIdentifier): CheckFeatureReturn {
    const featureDetail = features.get(featureName)
    // absence of featureName means feature disabled
    // api call fails by default set all features to be true
    const enabled = !!featureDetail?.enabled || hasErr
    const moduleType = featureDetail?.moduleType
    return {
      enabled,
      featureDetail: {
        ...featureDetail,
        featureName,
        enabled,
        moduleType,
        apiFail: hasErr
      }
    }
  }

  const [featureDetailMap, setFeatureDetailMap] = useState<Map<FeatureIdentifier, FeatureDetail>>(
    new Map<FeatureIdentifier, FeatureDetail>()
  )
  const { mutate: getFeatureDetails } = useGetFeatureRestrictionDetail({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  // limit feature request
  async function requestLimitFeature(featureRequest: FeatureRequest): Promise<void> {
    const { featureName } = featureRequest

    // when feature metadata call fails, feature is taken as limit one and comes here
    if (gettingFeatureMetadataError) {
      return
    }

    // check if this request is already queued
    if (!pendingLimitRequests.find(req => isEqual(req, featureRequest))) {
      pendingLimitRequests.push(featureRequest)
    } else {
      return
    }

    try {
      // const res = await getFeatureDetails({
      //   name: featureName as FeatureRestrictionDetailRequestDTO['name']
      // })

      const res = {
        status: 'SUCCESS',
        data: {
          name: 'SRM_SERVICES',
          description: 'Maximum active services at any point in time',
          moduleType: 'CV',
          allowed: true,
          restrictionType: 'STATIC_LIMIT',
          restriction: {
            restrictionType: 'STATIC_LIMIT',
            limit: 5,
            count: 4
          }
        },
        metaData: null,
        correlationId: 'cbb40ca5-2077-4147-9e61-1525b509951b'
      }

      // remove the request from queque
      pendingLimitRequests = pendingLimitRequests.filter(request => request !== featureRequest)

      const allowed = res?.data?.allowed
      const restriction = res?.data?.restriction
      const enabled = !!allowed
      let limit: number, count: number
      const apiFail = false
      const moduleType = res?.data?.moduleType
      if (restriction) {
        limit = restriction.limit
        count = restriction.count
      }

      setFeatureDetailMap(oldMap => {
        return produce(oldMap, draft => {
          // update current feature in the map
          draft.set(featureName, {
            featureName,
            enabled,
            limit,
            count,
            apiFail,
            moduleType
          })
        })
      })
    } catch (ex) {
      showError(ex.data?.message || getString('somethingWentWrong'))
      // remove the request from queque
      pendingLimitRequests = pendingLimitRequests.filter(request => request !== featureRequest)
      setFeatureDetailMap(oldMap => {
        return produce(oldMap, draft => {
          // update current feature in the map
          draft.set(featureName, {
            featureName,
            enabled: true,
            apiFail: true,
            moduleType: undefined
          })
        })
      })
    }
  }

  function compareEditions(edition1: Editions, edition2: Editions): Editions {
    if (edition1 === Editions.ENTERPRISE || edition2 === Editions.ENTERPRISE) {
      return Editions.ENTERPRISE
    }
    if (edition1 === Editions.TEAM || edition2 === Editions.TEAM) {
      return Editions.TEAM
    }
    return Editions.FREE
  }

  // this is to return highest edition from all module licenses: FREE, COMMUNITY < TEAM < ENTERPRISE
  // if no module licenses, then return FREE as default
  function getHighestEdition({ licenseInformation, licenseState }: GetHighestEditionProps): Editions {
    let edition = Editions.FREE

    const { CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE, CV_LICENSE_STATE } = licenseState

    if (CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CI']?.edition as Editions, edition)
    }

    if (FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CF']?.edition as Editions, edition)
    }

    if (CD_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CD']?.edition as Editions, edition)
    }

    if (CCM_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CE']?.edition as Editions, edition)
    }

    if (CV_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
      edition = compareEditions(licenseInformation?.['CE']?.edition as Editions, edition)
    }

    return edition
  }

  function getEdition({
    moduleType,
    licenseInformation,
    licenseState,
    isCommunity
  }: GetEditionProps): Editions | undefined {
    // if no license available, reture Free for default
    if (licenseInformation === undefined || isEmpty(licenseInformation)) {
      return Editions.FREE
    }

    if (isCommunity) {
      return Editions.COMMUNITY
    }

    const { CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE, CV_LICENSE_STATE } = licenseState

    switch (moduleType) {
      case 'CORE': {
        return getHighestEdition({ licenseInformation, licenseState })
      }
      case 'CI': {
        if (CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CI']?.edition as Editions) || Editions.FREE
        }
        break
      }
      case 'CD': {
        if (CD_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CD']?.edition as Editions) || Editions.FREE
        }
        break
      }
      case 'CF': {
        if (FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CF']?.edition as Editions) || Editions.FREE
        }
        break
      }
      case 'CE': {
        if (CCM_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
          return (licenseInformation['CE']?.edition as Editions) || Editions.FREE
        }
        break
      }
    }

    return undefined
  }

  // find restrictionType by featureName and edition
  function getRestrictionType({
    featureRequest,
    licenseInformation,
    licenseState,
    isCommunity
  }: GetRestrictionTypeProps): RestrictionType | undefined {
    if (featureRequest) {
      const featureMetadata = featureMap.get(featureRequest.featureName)
      const { moduleType, restrictionMetadataMap } = featureMetadata || {}
      const edition = getEdition({ moduleType, licenseInformation, licenseState, isCommunity })
      if (edition) {
        return restrictionMetadataMap?.[edition]?.restrictionType as RestrictionType
      }
    }
    return undefined
  }

  function checkLimitFeature(featureName: FeatureIdentifier): CheckFeatureReturn {
    // api call fails by default set feature to be true
    const featureDetail = featureDetailMap.get(featureName)
    const enabled = featureDetail?.apiFail || !!featureDetail?.enabled
    return {
      enabled,
      featureDetail
    }
  }

  return (
    <FeaturesContext.Provider
      value={{
        features,
        featureMap,
        getEdition,
        requestFeatures,
        requestLimitFeature,
        checkLimitFeature,
        checkFeature,
        getRestrictionType,
        getHighestEdition
      }}
    >
      {props.children}
    </FeaturesContext.Provider>
  )
}
