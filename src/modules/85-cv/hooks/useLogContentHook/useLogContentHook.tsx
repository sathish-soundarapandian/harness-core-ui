/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useModalHook } from '@harness/use-modal'
import { Classes } from '@blueprintjs/core'
import { Dialog } from '@harness/uicore'
import VerifyStepLogContent from './views/VerifyStepLogContent'
import SLOLogContent from './views/SLOLogContent'
import MonitoredServiceLogContent from './views/MonitoredServiceLogContent'
import type { UseLogContentHookProps, UseLogContentHookReturn } from './useLogContentHook.types';
import { LogTypes } from './useLogContentHook.types'
import css from './useLogContentHook.module.scss'

export const useLogContentHook = ({
  verifyStepExecutionId,
  sloIdentifier,
  serviceName,
  envName,
  monitoredServiceIdentifier,
  monitoredServiceStartTime,
  monitoredServiceEndTime,
  showTimelineSlider
}: UseLogContentHookProps): UseLogContentHookReturn => {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [logType, setLogType] = useState<LogTypes>(LogTypes.ExecutionLog)

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={() => {
          setIsFullScreen(false)
          hideModal()
        }}
        className={cx(css.dialog, { [css.fullScreen]: isFullScreen }, Classes.DIALOG)}
      >
        <div>
          {verifyStepExecutionId && (
            <VerifyStepLogContent
              logType={logType}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              verifyStepExecutionId={verifyStepExecutionId}
            />
          )}
          {!verifyStepExecutionId && sloIdentifier && (
            <SLOLogContent
              logType={logType}
              identifier={sloIdentifier}
              serviceName={serviceName}
              envName={envName}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
            />
          )}
          {!verifyStepExecutionId && !sloIdentifier && monitoredServiceIdentifier && (
            <MonitoredServiceLogContent
              logType={logType}
              monitoredServiceIdentifier={monitoredServiceIdentifier}
              serviceName={serviceName}
              envName={envName}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              startTime={monitoredServiceStartTime}
              endTime={monitoredServiceEndTime}
              showTimelineSlider={showTimelineSlider}
            />
          )}
        </div>
      </Dialog>
    ),
    [
      verifyStepExecutionId,
      sloIdentifier,
      serviceName,
      envName,
      isFullScreen,
      setIsFullScreen,
      logType,
      monitoredServiceIdentifier,
      monitoredServiceStartTime,
      monitoredServiceEndTime
    ]
  )

  const open = (_logType: LogTypes): void => {
    setLogType(_logType)
    showModal()
  }

  return {
    openLogContentHook: open,
    closeLogContentHook: hideModal
  }
}
