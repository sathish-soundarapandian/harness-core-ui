/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DefaultView } from '@pipeline/components/execution/StepDetails/views/DefaultView/DefaultView'
import { DefaultConsoleViewStepDetails } from '@pipeline/components/LogsContent/LogsContent'
import { DefaultTriggerInfoCell } from '@pipeline/pages/execution-list/ExecutionListTable/ExecutionListCells'
import { ExecutionFactory } from './ExecutionFactory'

const factory = new ExecutionFactory({
  defaultStepDetails: {
    component: DefaultView
  },
  defaultConsoleViewStepDetails: {
    component: DefaultConsoleViewStepDetails
  },
  defaultExecutionTriggerCell: {
    component: DefaultTriggerInfoCell
  }
})

export default factory
