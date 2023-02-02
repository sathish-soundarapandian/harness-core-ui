/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseString } from 'services/cd-ng'

export const mockTemplatesInputYaml: ResponseString = {
  status: 'SUCCESS',
  data:
    'type: "HarnessApproval"\ntimeout: "<+input>"' +
    '\nspec:\n  approvalMessage: "<+input>"\n  approvers:\n    userGroups: "<+input>"\n    minimumCount: "<+input>"' +
    '\nenforce:\n  policySets: "<+input>"\ndelegateSelectors: "<+input>"\n'
}
