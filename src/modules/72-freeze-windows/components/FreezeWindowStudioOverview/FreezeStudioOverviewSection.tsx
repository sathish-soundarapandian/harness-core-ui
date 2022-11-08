/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { Card, Container, Heading, FormikForm, ButtonVariation, Button, Formik } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { FreezeObj, WindowPathProps } from '@freeze-windows/types'
import { DefaultFreezeId } from '@freeze-windows/context/FreezeWindowReducer'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import { getInitialValues } from '@freeze-windows/utils/FreezeWindowStudioUtil'
import css from '../FreezeWindowStudioConfigSection/FreezeWindowStudioConfigSection.module.scss'

interface FreezeStudioOverviewSectionProps {
  isReadOnly: boolean
  onNext: () => void
}

export const FreezeStudioOverviewSection = (
  { isReadOnly, onNext }: FreezeStudioOverviewSectionProps,
  formikRef: unknown
) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze
  } = React.useContext(FreezeWindowContext)
  const { windowIdentifier } = useParams<WindowPathProps>()

  const [initialValues, setInitialValues] = React.useState({ identifier: DefaultFreezeId })
  const validate = React.useCallback(
    (formData: any) => {
      updateFreeze({ ...freezeObj, ...formData })
    },
    [freezeObj.identifier, freezeObj.name, freezeObj.description, freezeObj.tags]
  )

  React.useEffect(() => {
    setInitialValues(getInitialValues(freezeObj))
  }, [freezeObj.identifier, freezeObj.name, freezeObj.description, freezeObj.tags])

  return (
    <Formik
      enableReinitialize
      onSubmit={noop}
      formName="freezeWindowStudioOverviewForm"
      initialValues={initialValues}
      validate={validate}
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema()
      })}
    >
      {formikProps => {
        ;(formikRef as React.MutableRefObject<FormikProps<FreezeObj>>).current = formikProps as any
        return (
          <FormikForm>
            <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
              <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
                {getString('overview')}
              </Heading>
              <Card className={css.sectionCard}>
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{
                    inputLabel: getString('name'),
                    isIdentifierEditable: windowIdentifier === DefaultFreezeId && !isReadOnly,
                    inputGroupProps: { disabled: isReadOnly, inputGroup: { autoFocus: true } }
                  }}
                  descriptionProps={{ disabled: isReadOnly }}
                  tagsProps={{ disabled: isReadOnly }}
                />
              </Card>
              <Container margin={{ top: 'xxlarge' }}>
                <Button
                  margin={{ top: 'medium' }}
                  rightIcon="chevron-right"
                  onClick={onNext}
                  variation={ButtonVariation.PRIMARY}
                  text={getString('continue')}
                />
              </Container>
            </Container>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const FreezeStudioOverviewSectionWithRef = React.forwardRef(FreezeStudioOverviewSection)
