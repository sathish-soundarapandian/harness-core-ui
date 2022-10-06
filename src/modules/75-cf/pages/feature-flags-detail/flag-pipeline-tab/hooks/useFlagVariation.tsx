/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { CFVariationColors } from '@cf/constants'
import type { Variation } from 'services/cf'

interface UseFlagVariationProps {
  flagVariations: Variation[]
}

interface UseFlagVariationReturn {
  getVariationColorById: (variationIdentifier: string) => string
  getVariationColorByName: (variationName: string) => string
  getVariationNameById: (variationIdentifier: string) => string
}

const useFlagVariation = ({ flagVariations }: UseFlagVariationProps): UseFlagVariationReturn => {
  const variationColorMap = flagVariations.reduce<Record<string, string>>(
    (map, variation, variationIndex) => ({
      ...map,
      [variation.identifier]: CFVariationColors[variationIndex]
    }),
    {}
  )

  const getVariationColorById = (variationIdentifier: string): string => {
    return variationColorMap[variationIdentifier]
  }

  const getVariationColorByName = (variationName: string): string => {
    const flagVariation = flagVariations.find(x => x.name === variationName) as Variation
    return variationColorMap[flagVariation.identifier]
  }

  const getVariationNameById = (variationIdentifier: string): string => {
    return flagVariations.find(variation => variation.identifier === variationIdentifier)?.name as string
  }

  return {
    getVariationColorById,
    getVariationColorByName,
    getVariationNameById
  }
}

export default useFlagVariation
