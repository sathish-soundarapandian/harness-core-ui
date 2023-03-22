import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  Layout,
  MultiTextInput,
  MultiTypeInputType,
  Label,
  Button,
  useToaster,
  getErrorInfoFromErrorObject,
  Container,
  Card
} from '@harness/uicore'
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
  console.log({ timeout })
  const params = useParams<AccountPathProps>()
  const [timeoutLocal, setTimeoutLocal] = useState<number>()
  const { accountId } = params
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [saving, setSaving] = useState(false)
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
        <Layout.Horizontal spacing={'large'} flex>
          <Label>{getString('authSettings.sessionTimeOut')}</Label>
          <MultiTextInput
            name="sessionTimeOut"
            textProps={{ type: 'number', min: MINIMUM_SESSION_TIME_OUT }}
            allowableTypes={[MultiTypeInputType.FIXED]}
            value={timeoutLocal}
            onChange={value => {
              setTimeoutLocal(value as number)
            }}
          />
          <Button
            text={getString('save')}
            disabled={loading}
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
