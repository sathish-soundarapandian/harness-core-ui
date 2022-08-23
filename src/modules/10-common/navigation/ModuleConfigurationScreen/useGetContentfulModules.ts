import { useEffect, useState } from 'react'
import type { Entry, Asset } from 'contentful'
import Contentful from '@common/Contentful'
import type { ModuleName } from 'framework/types/ModuleName'

const CONTENT_TYPE = 'module'

export interface LottieContent {
  data: object
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
  identifier: ModuleName
  label: string
  data: Entry<CenterAlignedImageDescription | LottieContent>[]
}

// Try to rename types
export interface MassagedModuleData {
  label: string
  data: ModuleContentWithType<CenterAlignedImageDescription | LottieContent>[]
}

export interface UseGetContentfulModulesReturnType {
  contentfulModuleMap: Record<ModuleName, MassagedModuleData> | undefined
  loading: boolean
}

const useGetContentfulModules = (): UseGetContentfulModulesReturnType => {
  const [moduleContentfulDataMap, setModuleContentfulDataMap] = useState<
    Record<ModuleName, MassagedModuleData> | undefined
  >()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // Try to cache this data
    if (!moduleContentfulDataMap) {
      setLoading(true)
      Contentful.getClient()
        .getEntries<ContentfulModulesResponse>({
          content_type: CONTENT_TYPE,
          include: 10
        })
        .then(response => {
          if (response && response.items.length > 0) {
            const map: Record<ModuleName, MassagedModuleData> = response.items.reduce((moduleMap, item) => {
              moduleMap[item.fields.identifier] = {
                type: item.sys.contentType.sys.id,
                label: item.fields.label,
                data: item.fields.data.map(value => {
                  return {
                    type: value.sys.contentType.sys.id,
                    ...value.fields
                  }
                })
              }
              return moduleMap
            }, {})
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
