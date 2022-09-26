/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Button, ButtonVariation, Container, Formik, FormikForm, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import css from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowStudio.module.scss'

const EMPTY_OBJECT_READ_ONLY = {}

interface CreateNewFreezeWindowProps {
  onClose: (identifier?: string) => void
  updateFreeze: (response: any) => void
}

export const CreateNewFreezeWindow: React.FC<CreateNewFreezeWindowProps> = ({ onClose, updateFreeze }) => {
  const { getString } = useStrings()

  const onSubmit = (values: any) => {
    updateFreeze({ ...values })
    onClose(values.identifier)
  }

  const onCancel = React.useCallback(() => onClose(), [])

  return (
    <Formik
      initialValues={EMPTY_OBJECT_READ_ONLY}
      onSubmit={onSubmit}
      formName="createNewFreezeWindow"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema()
      })}
    >
      {formikProps => {
        return (
          <FormikForm className={css.createNewFreezeForm}>
            <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
              <NameIdDescriptionTags
                formikProps={formikProps}
                identifierProps={{
                  inputLabel: getString('name'),
                  isIdentifierEditable: true
                }}
              />
              <Layout.Horizontal spacing="small" margin={{ top: 'xxlarge' }}>
                <Button type="submit" variation={ButtonVariation.PRIMARY} text={getString('start')} />
                <Button onClick={onCancel} variation={ButtonVariation.SECONDARY} text={getString('cancel')} />
              </Layout.Horizontal>
            </Container>
          </FormikForm>
        )
      }}
    </Formik>
  )
}
