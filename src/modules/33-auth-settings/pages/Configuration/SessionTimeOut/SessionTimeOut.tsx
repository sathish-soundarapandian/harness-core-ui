import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  Layout,
  Text,
  Button,
  useToaster,
  getErrorInfoFromErrorObject,
  Container,
  Card,
  Color,
  TextInput
} from '@harness/uicore'
import { Intent } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSetSessionTimeoutAtAccountLevel } from 'services/cd-ng'
import css from './SessionTimeOut.module.scss'

interface SessionTimeOutProps {
  timeout: number | undefined
  setUpdating: Dispatch<SetStateAction<boolean>>
}
const MINIMUM_SESSION_TIME_OUT = 30
const SessionTimeOut: React.FC<SessionTimeOutProps> = ({ timeout, setUpdating }) => {
  const params = useParams<AccountPathProps>()
  const [timeoutLocal, setTimeoutLocal] = useState<number>()
  const { accountId } = params
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string>()
  React.useEffect(() => {
    if (setUpdating) {
      setUpdating(saving)
    }
  }, [saving, setUpdating])
  const {
    loading,
    mutate: saveSessionTimeout,
    error
  } = useSetSessionTimeoutAtAccountLevel({ queryParams: { accountIdentifier: accountId } })
  useEffect(() => {
    setTimeoutLocal(timeout)
  }, [timeout])

  useEffect(() => {
    if (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }, [error])
  return (
    <Container margin="xlarge">
      <Card className={css.card}>
        <Layout.Horizontal spacing={'large'} flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Text color={Color.BLACK}>{getString('authSettings.sessionTimeOut')}</Text>

          <TextInput
            className={css.textInpt}
            value={timeoutLocal as any}
            type="number"
            min={MINIMUM_SESSION_TIME_OUT}
            errorText={errorMsg}
            intent={errorMsg ? Intent.DANGER : Intent.NONE}
            onChange={e => {
              const val = parseInt((e.currentTarget as HTMLInputElement).value)
              setTimeoutLocal(val)
              if (val < MINIMUM_SESSION_TIME_OUT) {
                setErrorMsg(getString('authSettings.sessionTimeOutErrorMessage', { minimum: MINIMUM_SESSION_TIME_OUT }))
              } else {
                setErrorMsg(undefined)
              }
            }}
          />

          <Button
            text={getString('save')}
            disabled={loading || !timeoutLocal || !!errorMsg}
            onClick={() => {
              if (timeoutLocal) {
                setSaving(true)
                saveSessionTimeout({ sessionTimeOutInMinutes: timeoutLocal }).then(() => {
                  setSaving(false)
                })
              }
            }}
          />
        </Layout.Horizontal>
      </Card>
    </Container>
  )
}
export default SessionTimeOut
