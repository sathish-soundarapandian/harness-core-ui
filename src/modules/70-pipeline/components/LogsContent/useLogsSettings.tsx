import React from 'react'
import { Checkbox, Layout, useConfirmationDialog } from '@harness/uicore'
import { isEmpty, isUndefined } from 'lodash-es'
import { Intent } from '@harness/design-system'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useStrings } from 'framework/strings'

interface LogsSettingsReturn {
  openDialog: () => void
}

export function useLogSettings(): LogsSettingsReturn {
  const { getString } = useStrings()
  const { preference: logsInfoViewSettings, setPreference: setLogsInfoPreference } = usePreferenceStore<
    string | undefined
  >(PreferenceScope.USER, 'logsInfoViewSettings')
  const { preference: logsDateTimeViewSettings, setPreference: setLogsDateTimePreference } = usePreferenceStore<
    string | undefined
  >(PreferenceScope.USER, 'logsDateTimeViewSettings')

  const [showLogLevel, setShowLogLevel] = React.useState<boolean>(
    logsInfoViewSettings ? logsInfoViewSettings === 'true' : true
  )
  const [showDateTimeInformation, setDateTimeInformation] = React.useState<boolean>(
    logsDateTimeViewSettings ? logsDateTimeViewSettings === 'true' : true
  )

  React.useEffect(() => {
    // Initialising Preference Store
    if (isUndefined(logsInfoViewSettings)) {
      setLogsInfoPreference('true')
    } else {
      // If the perference store manually gets updated or is updated through an API call
      if (logsInfoViewSettings !== String(showLogLevel)) {
        setShowLogLevel(!isEmpty(logsInfoViewSettings) ? logsInfoViewSettings === 'true' : true)
      }
    }
    if (isUndefined(logsDateTimeViewSettings)) {
      setLogsDateTimePreference('true')
    } else {
      // If the perference store manually gets updated or is updated through an API call
      if (logsDateTimeViewSettings !== String(showDateTimeInformation)) {
        setDateTimeInformation(!isEmpty(logsDateTimeViewSettings) ? logsDateTimeViewSettings === 'true' : true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsInfoViewSettings, logsDateTimeViewSettings])

  function LogsSettingsPreferenceComp(): JSX.Element {
    return (
      <Layout.Vertical spacing={'small'} padding={{ bottom: 'xxlarge' }}>
        <Checkbox
          onChange={e => setShowLogLevel((e.target as any).checked)}
          checked={showLogLevel}
          large
          label={getString('pipeline.logLevelSettings')}
          data-testId={'log-level'}
        />
        <Checkbox
          onChange={e => setDateTimeInformation((e.target as any).checked)}
          checked={showDateTimeInformation}
          large
          label={getString('pipeline.logDateTimeSettings')}
          data-testId={'log-date-time'}
        />
      </Layout.Vertical>
    )
  }

  const { openDialog, closeDialog } = useConfirmationDialog({
    titleText: getString('pipeline.configureLogSettings'),
    contentText: getString('pipeline.logSettingsHeader'),
    confirmButtonText: getString('enable'),
    children: <LogsSettingsPreferenceComp />,
    cancelButtonText: getString('cancel'),
    onCloseDialog: (didConfirm): void => {
      if (didConfirm) {
        setLogsInfoPreference(String(showLogLevel))
        setLogsDateTimePreference(String(showDateTimeInformation))
      }
      closeDialog()
    },
    intent: Intent.WARNING
  })

  return {
    openDialog: openDialog
  }
}
