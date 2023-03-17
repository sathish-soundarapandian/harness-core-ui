/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useMemo } from 'react'
import { isEmpty } from 'lodash-es'
import { isOnPrem } from '@common/utils/utils'

interface FavIconInfo {
  ICO: string
  PNG: string
}

enum FavIconSourceTypes {
  STATIC = 'STATIC',
  CDN = 'CDN'
}

type FavIconDetails = Record<FavIconSourceTypes, FavIconInfo>

const DEFAULT_FAVICON_DETAILS: FavIconDetails = {
  STATIC: {
    ICO: 'favicon.ico',
    PNG: 'favicon.png'
  },
  CDN: {
    ICO: 'https://static.harness.io/ng-static/images/favicon.ico',
    PNG: 'https://static.harness.io/ng-static/images/favicon.png'
  }
}

const getFavIconHrefPath = (favIconIdentifier: string) => {
  if (__DEV__) {
    return `/${favIconIdentifier}`
  }
  if (isOnPrem()) {
    return `/ng/static/${favIconIdentifier}`
  }

  return favIconIdentifier
}

// Favicons to be loaded statically instead of CDN for local and ONPREM env and also when CDN is not enabled
// ref -> https://github.com/harness/harness-core-ui/pull/14420
const shouldUseStaticSource = () => __DEV__ || isOnPrem() || !window.HARNESS_ENABLE_CDN

export function useDocumentFavicon(favIconDetails: FavIconDetails | undefined) {
  const favIconSourceType = shouldUseStaticSource() ? FavIconSourceTypes.STATIC : FavIconSourceTypes.CDN

  const favIconInfo = favIconDetails?.[favIconSourceType]
  const defaultFavIconInfo = DEFAULT_FAVICON_DETAILS[favIconSourceType]

  const linkElementIco = useMemo(() => document.getElementById('favicon-x-icon') as HTMLLinkElement, [])
  const linkElementPng = useMemo(() => document.getElementById('favicon-png') as HTMLLinkElement, [])

  const updateFavicon = (favIconToBeUpdated: FavIconInfo): void => {
    if (linkElementIco && favIconToBeUpdated.ICO) {
      linkElementIco.href = getFavIconHrefPath(favIconToBeUpdated.ICO)
    }
    if (linkElementPng && favIconToBeUpdated.PNG) {
      linkElementPng.href = getFavIconHrefPath(favIconToBeUpdated.PNG)
    }
  }

  useEffect(() => {
    if (!isEmpty(favIconInfo)) {
      updateFavicon(favIconInfo as FavIconInfo)
    }

    return () => {
      // reset favicon on unmount
      updateFavicon(defaultFavIconInfo)
    }
  }, [favIconInfo, defaultFavIconInfo])
}
