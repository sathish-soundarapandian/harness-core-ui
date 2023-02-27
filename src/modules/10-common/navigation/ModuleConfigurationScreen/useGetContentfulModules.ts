/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import type { Entry, Asset } from 'contentful'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import Contentful, { ContentfulEnvironment } from './Contentful'

const CONTENT_TYPE = 'module'

export interface LottieContent {
  activeModule: NavModuleName
  json: Asset
}

export enum ModuleContentType {
  CENTER_ALIGNED_IMAGE_DESC = 'carouselImageAndDesc',
  LOTTIE = 'lottie'
}

export interface ModuleContentWithType<T> {
  type: ModuleContentType
  data: T
}

export interface CenterAlignedImageDescription {
  primaryText?: string
  secondoryText?: string
  image: Asset
}

interface ContentfulModulesResponse {
  identifier: NavModuleName
  label: string
  data: Entry<CenterAlignedImageDescription | LottieContent>[]
}

export interface MassagedModuleData {
  label: string
  data: ModuleContentWithType<CenterAlignedImageDescription | LottieContent>[]
}

export interface UseGetContentfulModulesReturnType {
  contentfulModuleMap: Partial<Record<NavModuleName, MassagedModuleData>> | undefined
  loading: boolean
}

const useGetContentfulModules = (): UseGetContentfulModulesReturnType => {
  const [moduleContentfulDataMap, setModuleContentfulDataMap] = useState<
    Partial<Record<NavModuleName, MassagedModuleData>> | undefined
  >()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // Try to cache this data
    /* istanbul ignore next */
    if (
      !moduleContentfulDataMap &&
      window.newNavContentfulAccessToken &&
      window.newNavContetfulSpace &&
      window.newNavContentfulEnvironment
    ) {
      Contentful.initialise(
        window.newNavContentfulAccessToken,
        window.newNavContetfulSpace,
        window.newNavContentfulEnvironment as ContentfulEnvironment
      )
      setLoading(true)
      Contentful.getClient()
        .getEntries<ContentfulModulesResponse>({
          content_type: CONTENT_TYPE,
          include: 10
        })
        .then(response => {
          if (response && response.items.length > 0) {
            const map: Partial<Record<NavModuleName, MassagedModuleData>> = {}

            response.items.forEach(item => {
              const data = item.fields.data.reduce<
                ModuleContentWithType<CenterAlignedImageDescription | LottieContent>[]
              >((final, component) => {
                if (component.sys.contentType.sys.id) {
                  final.push({
                    type: component.sys.contentType.sys.id as ModuleContentType,
                    data: { ...component.fields }
                  })
                }
                return final
              }, [])

              map[item.fields.identifier] = {
                label: item.fields.label,
                data
              }
            })

            setModuleContentfulDataMap(map)
          }
        })
        .catch(() => {
          window.bugsnagClient?.notify?.(new Error('Error fetching module information'))
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [])

  return {
    contentfulModuleMap: moduleContentfulDataMap,
    loading
  }
}

export default useGetContentfulModules
