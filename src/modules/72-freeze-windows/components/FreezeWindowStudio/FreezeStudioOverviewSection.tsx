/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import noop from 'lodash-es/noop'
import isEmpty from 'lodash-es/isEmpty'
import { Card, Container, Heading, FormikForm, ButtonVariation, Button, Formik } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { DefaultFreezeId } from './FreezeWindowContext/FreezeWindowReducer'
import { FreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import { getInitialValues } from './FreezeWindowStudioUtil'
import css from './FreezeWindowStudio.module.scss'

interface FreezeStudioOverviewSectionProps {
  isReadOnly: boolean
  onNext: () => void
}

export const FreezeStudioOverviewSection: React.FC<FreezeStudioOverviewSectionProps> = ({ isReadOnly, onNext }) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze
  } = React.useContext(FreezeWindowContext)

  const [initialValues, setInitialValues] = React.useState({ identifier: DefaultFreezeId })
  const validate = React.useCallback((formData: any) => updateFreeze({ ...freezeObj, ...formData }), [])

  React.useEffect(() => {
    setInitialValues(getInitialValues(freezeObj))
  }, [freezeObj.identifier])

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
      {formikProps => (
        <FormikForm>
          <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
            <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
              {getString('freezeWindows.freezeStudio.freezeOverview')}
            </Heading>
            <Card className={css.sectionCard}>
              <NameIdDescriptionTags
                formikProps={formikProps}
                identifierProps={{
                  inputLabel: getString('name'),
                  isIdentifierEditable: true, // todo: edit case, not editable
                  inputGroupProps: { disabled: isReadOnly, inputGroup: { autoFocus: true } }
                }}
                descriptionProps={{ disabled: isReadOnly }}
                tagsProps={{ disabled: isReadOnly }}
                // className={css.nameIdDescriptionTags}
              />
            </Card>
            <Container margin={{ top: 'xxlarge' }}>
              <Button
                margin={{ top: 'medium' }}
                // type="submit"
                // disabled={isStageCreationDisabled()}
                rightIcon="chevron-right"
                onClick={async () => {
                  const formErrors = await formikProps.validateForm(formikProps.values)
                  if (isEmpty(formErrors)) {
                    onNext()
                  }
                }}
                variation={ButtonVariation.PRIMARY}
                text={getString('continue')}
              />
            </Container>
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}
