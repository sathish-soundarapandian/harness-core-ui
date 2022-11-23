/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Button, FormInput, Formik, FormikForm, Layout, ButtonVariation } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useUpdateAccountNameNG } from 'services/cd-ng'
import { NameSchema } from '@common/utils/Validation'
import css from '../AccountOverview.module.scss'

interface FormValues {
  name: string
}

interface AccountNameFormProps {
  name: string
  setUpdateAccountName: (value: boolean) => void
  refetchAcct: () => void
}

const AccountNameForm: React.FC<AccountNameFormProps> = ({
  name,
  setUpdateAccountName,
  refetchAcct
}: AccountNameFormProps) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const {
    mutate: updateAcctName,
    loading: updatingAcctName,
    cancel
  } = useUpdateAccountNameNG({
    accountIdentifier: accountId
  })

  const handleSubmit = async (values: FormValues): Promise<FormValues> => {
    try {
      await updateAcctName({
        name: values.name.trim()
      })
      refetchAcct()
    } catch (err) {
      showError(err.data?.message || getString('somethingWentWrong'))
    }
    setUpdateAccountName(false)
    return values
  }

  return (
    <Formik<FormValues>
      initialValues={{
        name: name
      }}
      onSubmit={(value: FormValues) => handleSubmit(value)}
      formName="accountNameForm"
      validationSchema={Yup.object().shape({
        name: NameSchema()
      })}
    >
      {() => (
        <FormikForm>
          <Layout.Horizontal spacing="medium">
            <FormInput.Text name="name" className={css.nameInput} />
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('save')}
              type="submit"
              disabled={updatingAcctName}
            />
            <Button
              text={getString('cancel')}
              onClick={() => {
                if (updatingAcctName) {
                  cancel()
                }
                setUpdateAccountName(false)
              }}
              variation={ButtonVariation.TERTIARY}
            />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}

export default AccountNameForm
