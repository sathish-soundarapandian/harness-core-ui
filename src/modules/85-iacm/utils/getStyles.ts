/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import approvalStepCss from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageSetupShellMode.module.scss'

const styles = {
  approvalStepCss
}

export const getStyles = (key: string): unknown => get(styles, key)
