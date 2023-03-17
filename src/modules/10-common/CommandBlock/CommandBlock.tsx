/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Button, ButtonVariation } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { TelemetryEvent, useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import CopyButton from '../utils/CopyButton'
import css from './CommandBlock.module.scss'
interface DownloadFileProps {
  downloadFileExtension?: string
  downloadFileName?: string
}

interface TelemetryProps {
  copyTelemetryProps?: TelemetryEvent
  downloadTelemetryProps?: TelemetryEvent
}
interface CommandBlockProps {
  commandSnippet: string
  allowCopy?: boolean
  ignoreWhiteSpaces?: boolean
  allowDownload?: boolean
  downloadFileProps?: DownloadFileProps
  telemetryProps?: TelemetryProps
  copySnippet?: string
  copyButtonText?: string
}
enum DownloadFile {
  DEFAULT_NAME = 'commandBlock',
  DEFAULT_TYPE = 'txt'
}

const CommandBlock: React.FC<CommandBlockProps> = ({
  commandSnippet,
  allowCopy,
  ignoreWhiteSpaces = true,
  allowDownload = false,
  downloadFileProps,
  telemetryProps,
  copySnippet,
  copyButtonText
}) => {
  const { trackEvent } = useTelemetry()
  const downloadFileDefaultName = downloadFileProps?.downloadFileName || DownloadFile.DEFAULT_NAME
  const downloadeFileDefaultExtension =
    (downloadFileProps && downloadFileProps.downloadFileExtension) || DownloadFile.DEFAULT_TYPE
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  const { getString } = useStrings()
  const onDownload = () => {
    const content = new Blob([commandSnippet as BlobPart], { type: 'data:text/plain;charset=utf-8' })
    if (linkRef?.current) {
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = `${downloadFileDefaultName}.${downloadeFileDefaultExtension}`
      linkRef.current.click()
    }
  }
  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }} className={css.commandBlock}>
      <Text className={cx(!ignoreWhiteSpaces && css.ignoreWhiteSpaces)} font={{ variation: FontVariation.YAML }}>
        {commandSnippet}
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'center' }} spacing="medium">
        {(allowCopy || copySnippet) && (
          <CopyButton
            textToCopy={copySnippet || commandSnippet}
            text={copyButtonText}
            onCopySuccess={() => {
              if (telemetryProps?.copyTelemetryProps) {
                trackEvent(
                  telemetryProps?.copyTelemetryProps?.eventName,
                  telemetryProps?.copyTelemetryProps?.properties
                )
              }
            }}
          />
        )}
        {allowDownload && (
          <>
            <Button
              className={css.downloadBtn}
              variation={ButtonVariation.LINK}
              text={getString('common.download')}
              onClick={event => {
                event.stopPropagation()
                if (telemetryProps?.downloadTelemetryProps) {
                  trackEvent(
                    telemetryProps?.downloadTelemetryProps.eventName,
                    telemetryProps?.downloadTelemetryProps.properties
                  )
                }
                onDownload()
              }}
            />
            <a className="hide" ref={linkRef} target={'_blank'} />
          </>
        )}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export default CommandBlock
