import React from 'react'
import { Button, ButtonSize, ButtonVariation, useToggleOpen } from '@harness/uicore'
import { DelegateTaskLogsModal, DelegateTaskLogsProps } from '@common/components/DelegateTaskLogs/DelegateTaskLogs'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isOnPrem } from '@common/utils/utils'
import { useStrings } from 'framework/strings'

interface DelegateTaskLogsButtonProps extends DelegateTaskLogsProps {
  areLogsAvailable?: boolean
}

export default function DelegateTaskLogsButton({
  telemetry,
  areLogsAvailable,
  startTime,
  endTime,
  taskIds
}: DelegateTaskLogsButtonProps): JSX.Element | null {
  const { isOpen, open: openDelegateTaskLogsModal, close: closeDelegateTaskLogsModal } = useToggleOpen(false)
  const { getString } = useStrings()
  const { DEL_FETCH_TASK_LOG_API } = useFeatureFlags()

  return DEL_FETCH_TASK_LOG_API && !isOnPrem() ? (
    <>
      <Button
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.SMALL}
        onClick={openDelegateTaskLogsModal}
        width={210}
        disabled={!areLogsAvailable}
        tooltip={getString('common.noDelegateLogs')}
        tooltipProps={{ disabled: areLogsAvailable }}
      >
        {getString('common.viewText')} {getString('common.logs.delegateTaskLogs')}
      </Button>
      <DelegateTaskLogsModal
        isOpen={isOpen}
        close={closeDelegateTaskLogsModal}
        taskIds={taskIds || []}
        startTime={startTime}
        endTime={endTime}
        telemetry={telemetry}
      />
    </>
  ) : null
}
