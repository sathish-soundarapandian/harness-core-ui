/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceLevelObjectiveDetailsDTO } from 'services/cv'

export const getDistribution = (
  weight: number,
  currentIndex: number,
  originalList: ServiceLevelObjectiveDetailsDTO[]
): ServiceLevelObjectiveDetailsDTO[] => {
  const clonedArr = [...originalList]
  const length = originalList.length
  const remaining = 100 - Number(weight)
  const newWeight = remaining / (length - 1)

  for (let idx = 0; idx < originalList.length; idx++) {
    if (currentIndex === idx) {
      clonedArr[idx].weightagePercentage = Number(weight)
    } else {
      clonedArr[idx].weightagePercentage = newWeight
    }
  }

  return clonedArr
}
