import { get } from 'lodash-es'
import approvalStepCss from '@pipeline/components/CommonPipelineStages/ApprovalStage/ApprovalStageSetupShellMode.module.scss'

const styles = {
  approvalStepCss
}

export const getStyles = (key: string): unknown => get(styles, key)
