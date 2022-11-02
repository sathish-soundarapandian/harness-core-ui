/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getDistribution } from '../AddSlos/AddSLOs.utils'

describe('Validate  AddSLO', () => {
  test('should validate getDistribution', () => {
    const serviceLevelObjectivesDetails = [
      {
        accountId: 'default',
        serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
        weightagePercentage: 50
      },
      {
        accountId: 'default',
        serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
        weightagePercentage: 50
      }
    ]
    const updatedServiceLevelObjectivesDetails = getDistribution(30, 1, serviceLevelObjectivesDetails)
    const clonedServiceLevelObjectivesDetails = [...serviceLevelObjectivesDetails]
    clonedServiceLevelObjectivesDetails[0].weightagePercentage = 70
    clonedServiceLevelObjectivesDetails[1].weightagePercentage = 30
    expect(updatedServiceLevelObjectivesDetails).toEqual(clonedServiceLevelObjectivesDetails)
  })
})
