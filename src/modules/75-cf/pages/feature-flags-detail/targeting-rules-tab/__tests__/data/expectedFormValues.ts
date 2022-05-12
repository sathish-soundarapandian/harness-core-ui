/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TargetingRuleItemStatus, TargetingRuleItemType, TargetingRulesFormValues } from '../../types'

const expectedFormValues: TargetingRulesFormValues = {
  offVariation: 'false',
  onVariation: 'true',
  state: 'off',
  targetingRuleItems: [
    {
      priority: 100,
      status: TargetingRuleItemStatus.LOADED,
      targetGroups: [
        {
          label: 'target_group_4',
          value: 'target_group_4',
          priority: 100,
          ruleId: '9dec5abb-002e-45b3-b241-963ac5d9acde'
        },
        {
          label: 'target_group_5',
          value: 'target_group_5',
          priority: 101,
          ruleId: '3ead64d0-3226-4726-8415-acce803fa34e'
        },
        {
          label: 'target_group_2',
          priority: 1,
          ruleId: 'UUID',
          value: 'target_group_2'
        }
      ],
      targets: [
        {
          value: 'target1',
          label: 'target_1'
        },
        {
          value: 'target2',
          label: 'target_2'
        }
      ],
      type: TargetingRuleItemType.VARIATION,
      variationIdentifier: 'false',
      variationName: 'False'
    },
    {
      status: TargetingRuleItemStatus.LOADED,
      bucketBy: 'name',
      clauses: [
        {
          attribute: '',
          id: '0023fcae-39ee-4cc5-ae6b-ea7ba20733dc',
          negate: false,
          op: 'segmentMatch',
          values: ['targetGroup6']
        }
      ],
      priority: 102,
      ruleId: '455c109e-c995-4a4c-adb0-086ddd22ca39',
      type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
      variations: [
        {
          variation: 'true',
          weight: 70
        },
        {
          variation: 'false',
          weight: 30
        }
      ]
    },
    {
      priority: 103,
      status: TargetingRuleItemStatus.ADDED,
      targetGroups: [],
      targets: [],
      type: TargetingRuleItemType.VARIATION,
      variationIdentifier: 'true',
      variationName: 'True'
    }
  ]
}

export default expectedFormValues
