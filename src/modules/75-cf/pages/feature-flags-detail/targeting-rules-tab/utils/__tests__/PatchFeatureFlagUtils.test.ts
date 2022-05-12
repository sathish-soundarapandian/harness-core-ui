/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormVariationMap, TargetingRuleItemStatus, TargetingRuleItemType, TargetingRulesFormValues } from '../../types'
import { PatchFeatureFlagUtils } from '../PatchFeatureFlagUtils'

describe('PatchFeatureFlagUtils', async () => {
  const submittedValues: TargetingRulesFormValues = {
    state: '',
    onVariation: '',
    offVariation: '',
    targetingRuleItems: [
      {
        status: TargetingRuleItemStatus.LOADED,
        priority: 101,
        type: TargetingRuleItemType.VARIATION,
        variationIdentifier: 'TEST2',
        variationName: 'TEST2',
        targetGroups: [],
        targets: []
      }
    ]
  }

  const initialValues: TargetingRulesFormValues = {
    state: '',
    onVariation: '',
    offVariation: '',
    targetingRuleItems: [
      {
        status: TargetingRuleItemStatus.LOADED,
        priority: 101,
        type: TargetingRuleItemType.VARIATION,
        variationIdentifier: 'TEST2',
        variationName: 'TEST2',
        targetGroups: [],
        targets: []
      }
    ]
  }

  const formVariation: FormVariationMap = {
    status: TargetingRuleItemStatus.LOADED,
    priority: 101,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'TEST',
    variationName: 'TEST',
    targetGroups: [],
    targets: []
  }

  test('it should return empty array if no new target groups found for variation', async () => {
    const componentUnderTest = PatchFeatureFlagUtils(submittedValues, initialValues)

    expect(componentUnderTest.addedTargetGroups(formVariation.variationIdentifier)).toHaveLength(0)
  })

  test('it should return empty array if no removed target groups found for variation', async () => {
    const componentUnderTest = PatchFeatureFlagUtils(submittedValues, initialValues)

    expect(componentUnderTest.removedTargetGroups(formVariation.variationIdentifier)).toHaveLength(0)
  })
})
