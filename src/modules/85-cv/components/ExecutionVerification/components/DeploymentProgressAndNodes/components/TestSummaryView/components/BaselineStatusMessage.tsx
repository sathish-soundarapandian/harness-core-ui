import React from 'react'
import { useStrings } from 'framework/strings'
import type { VerificationOverview } from 'services/cv'
import { StatusMessageDisplay } from '../../StatusMessageDisplay/StatusMessageDisplay'
import { getStatusMessage } from './BaselineStatusMessage.utils'

interface BaselineStatusMessageProps {
  data: VerificationOverview | null
}

export default function BaselineStatusMessage(props: BaselineStatusMessageProps): JSX.Element | null {
  const { data } = props

  const { getString } = useStrings()

  const message = getStatusMessage(data, getString)

  if (!data || !message) {
    return null
  }

  return <StatusMessageDisplay message={message} messageTestId="baselineStatusMessage" />
}
