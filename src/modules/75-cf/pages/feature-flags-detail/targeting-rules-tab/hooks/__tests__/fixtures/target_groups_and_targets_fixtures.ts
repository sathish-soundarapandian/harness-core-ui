/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TargetingRuleItemStatus, TargetingRuleItemType, VariationPercentageRollout } from '../../../types'

const mockPercentageVariationRollout: VariationPercentageRollout = {
  status: TargetingRuleItemStatus.LOADED,
  priority: 100,
  type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
  bucketBy: '',
  clauses: [{ attribute: '', negate: false, op: 'segmentmatch', id: '', values: [''] }],
  ruleId: 'UUID',
  variations: []
}

const variationAddedFixture = {
  addedTargetingRules: {
    status: TargetingRuleItemStatus.ADDED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        label: 'target1',
        value: 'target_1'
      }
    ],
    targetGroups: [
      {
        priority: 101,
        label: 'target_group_1',
        ruleId: 'UUID',
        value: 'target_group_1'
      },
      {
        priority: 102,
        label: 'target_group_2',
        ruleId: 'UUID',
        value: 'target_group_2'
      }
    ]
  },
  expected: {
    instructions: [
      {
        kind: 'addRule',
        parameters: {
          clauses: [
            {
              op: 'segmentMatch',
              values: ['target_group_1']
            }
          ],
          priority: 101,
          serve: {
            variation: 'true'
          },
          uuid: 'UUID'
        }
      },
      {
        kind: 'addRule',
        parameters: {
          clauses: [
            {
              op: 'segmentMatch',
              values: ['target_group_2']
            }
          ],
          priority: 102,
          serve: {
            variation: 'true'
          },
          uuid: 'UUID'
        }
      },
      {
        kind: 'addTargetsToVariationTargetMap',
        parameters: {
          targets: ['target_1'],
          variation: 'true'
        }
      }
    ]
  }
}

const variationRemovedFixture = {
  initialTargetingRules: {
    status: TargetingRuleItemStatus.ADDED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        label: 'target1',
        value: 'target_1'
      }
    ],
    targetGroups: [
      {
        priority: 101,
        label: 'target_group_1',
        ruleId: 'UUID',
        value: 'target_group_1'
      },
      {
        priority: 102,
        label: 'target_group_2',
        ruleId: 'UUID',
        value: 'target_group_2'
      }
    ]
  },
  removedTargetingRules: {
    status: TargetingRuleItemStatus.DELETED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        label: 'target1',
        value: 'target_1'
      }
    ],
    targetGroups: [
      {
        priority: 101,
        label: 'target_group_1',
        ruleId: 'UUID',
        value: 'target_group_1'
      },
      {
        priority: 102,
        label: 'target_group_2',
        ruleId: 'UUID',
        value: 'target_group_2'
      }
    ]
  },
  expected: {
    instructions: [
      {
        kind: 'removeRule',
        parameters: {
          ruleID: 'UUID'
        }
      },
      {
        kind: 'removeRule',
        parameters: {
          ruleID: 'UUID'
        }
      },
      {
        kind: 'removeTargetsToVariationTargetMap',
        parameters: {
          targets: ['target_1'],
          variation: 'true'
        }
      }
    ]
  }
}

const targetGroupsAddedFixture = {
  initialFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: [
      {
        priority: 101,
        label: 'target_group_1',
        ruleId: 'a3840b52-2b76-45af-93da-2eec20e7299c',
        value: 'target_group_1'
      }
    ]
  },

  newFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: [
      {
        priority: 101,
        label: 'target_group_1',
        ruleId: 'UUID',
        value: 'target_group_1'
      },
      {
        priority: 102,
        label: 'target_group_2',
        ruleId: 'UUID',
        value: 'target_group_2'
      },
      {
        priority: 103,
        label: 'target_group_3',
        ruleId: 'UUID',
        value: 'target_group_3'
      }
    ]
  },
  expected: {
    instructions: [
      {
        kind: 'addRule',
        parameters: {
          clauses: [{ op: 'segmentMatch', values: ['target_group_2'] }],
          priority: 101,
          serve: { variation: 'true' },
          uuid: 'UUID'
        }
      },
      {
        kind: 'addRule',
        parameters: {
          clauses: [{ op: 'segmentMatch', values: ['target_group_3'] }],
          priority: 102,
          serve: { variation: 'true' },
          uuid: 'UUID'
        }
      }
    ]
  }
}

const targetGroupsRemovedFixture = {
  initialFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: [
      {
        priority: 101,
        label: 'target_group_1',
        ruleId: 'a3840b52-2b76-45af-93da-2eec20e7299c',
        value: 'target_group_1'
      },
      {
        priority: 102,
        label: 'target_group_2',
        ruleId: 'a3240b52-2b76-45af-93da-2eec20e33333',
        value: 'target_group_2'
      }
    ]
  },
  newFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [],
    targetGroups: []
  },
  expected: {
    instructions: [
      { kind: 'removeRule', parameters: { ruleID: 'a3840b52-2b76-45af-93da-2eec20e7299c' } },
      { kind: 'removeRule', parameters: { ruleID: 'a3240b52-2b76-45af-93da-2eec20e33333' } }
    ]
  }
}

const targetAddedFixture = {
  initialFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        label: 'target1',
        value: 'target_1'
      }
    ],
    targetGroups: []
  },
  newFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        label: 'target1',
        value: 'target_1'
      },
      {
        label: 'target2',
        value: 'target_2'
      }
    ],
    targetGroups: []
  },
  expected: {
    instructions: [{ kind: 'addTargetsToVariationTargetMap', parameters: { targets: ['target_2'], variation: 'true' } }]
  }
}

const targetRemovedFixture = {
  initialFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        label: 'target1',
        value: 'target_1'
      },
      {
        label: 'target2',
        value: 'target_2'
      }
    ],
    targetGroups: []
  },
  newFormVariationMap: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.VARIATION,
    variationIdentifier: 'true',
    variationName: 'True',
    targets: [
      {
        label: 'target2',
        value: 'target_2'
      }
    ],
    targetGroups: []
  },
  expected: {
    instructions: [
      { kind: 'removeTargetsToVariationTargetMap', parameters: { targets: ['target_1'], variation: 'true' } }
    ]
  }
}

const percentageRolloutAdded = {
  initialVariationPercentageRollout: {
    bucketBy: 'label',
    clauses: [],
    isVisible: false,
    ruleId: '',
    variations: []
  },
  newPercentageRolloutAdded: {
    status: TargetingRuleItemStatus.ADDED,
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    bucketBy: 'label',
    clauses: [
      {
        attribute: '',
        id: '',
        negate: false,
        op: '',
        values: ['target_group_1']
      }
    ],
    variations: [
      {
        variation: 'true',
        weight: 40
      },
      {
        variation: 'false',
        weight: 60
      }
    ],
    ruleId: 'UUID'
  },
  expected: {
    instructions: [
      {
        kind: 'addRule',
        parameters: {
          uuid: 'UUID',
          priority: 101,
          serve: {
            distribution: {
              bucketBy: 'label',
              variations: [
                { variation: 'true', weight: 40 },
                { variation: 'false', weight: 60 }
              ]
            }
          },
          clauses: [{ op: 'segmentMatch', values: ['target_group_1'] }]
        }
      }
    ]
  }
}

const percentageRolloutUpdated = {
  initialVariationPercentageRollout: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    variations: [
      {
        variation: 'true',
        weight: 30
      },
      {
        variation: 'false',
        weight: 70
      }
    ],
    bucketBy: 'label',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['target_group_1']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c'
  },
  newPercentageRolloutUpdated: {
    status: TargetingRuleItemStatus.LOADED,
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    variations: [
      {
        variation: 'true',
        weight: 90
      },
      {
        variation: 'false',
        weight: 10
      }
    ],
    bucketBy: 'label',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['randomID']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c'
  },
  expected: {
    instructions: [
      {
        kind: 'updateRule',
        parameters: {
          bucketBy: 'label',
          ruleID: '006731d6-1f58-4877-8ff5-68cbb885b75c',
          variations: [
            {
              variation: 'true',
              weight: 90
            },
            {
              variation: 'false',
              weight: 10
            }
          ]
        }
      },
      {
        kind: 'updateClause',
        parameters: {
          clause: {
            attribute: '',
            negate: false,
            op: 'segmentMatch',
            values: ['randomID']
          },
          clauseID: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
          ruleID: '006731d6-1f58-4877-8ff5-68cbb885b75c'
        }
      }
    ]
  }
}

const percentageRolloutRemoved = {
  initialVariationPercentageRollout: {
    status: TargetingRuleItemStatus.DELETED,
    priority: 100,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    variations: [
      {
        variation: 'true',
        weight: 30
      },
      {
        variation: 'false',
        weight: 30
      }
    ],
    bucketBy: 'label',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['target_group_1']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c',
    isVisible: true
  },
  percentageRolloutRemoved: {
    priority: 101,
    type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
    status: TargetingRuleItemStatus.DELETED,
    variations: [
      {
        variation: 'true',
        weight: 90
      },
      {
        variation: 'false',
        weight: 10
      }
    ],
    bucketBy: 'label',
    clauses: [
      {
        attribute: '',
        id: 'e6512660-cb37-4986-9d9c-8d3030f3d53a',
        negate: false,
        op: 'segmentMatch',
        values: ['target_group_1']
      }
    ],
    ruleId: '006731d6-1f58-4877-8ff5-68cbb885b75c',
    isVisible: false
  },
  expected: {
    instructions: [{ kind: 'removeRule', parameters: { ruleID: '006731d6-1f58-4877-8ff5-68cbb885b75c' } }]
  }
}

export {
  mockPercentageVariationRollout,
  variationAddedFixture,
  variationRemovedFixture,
  percentageRolloutAdded,
  percentageRolloutUpdated,
  percentageRolloutRemoved,
  targetGroupsAddedFixture,
  targetGroupsRemovedFixture,
  targetAddedFixture,
  targetRemovedFixture
}
