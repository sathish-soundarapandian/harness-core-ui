/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { Button, ButtonVariation, Card, Container, Heading, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import type { EntityConfig, FreezeObj, ResourcesInterface, ValidationErrorType } from '@freeze-windows/types'
import { FieldVisibility, getFieldsVisibility } from '@freeze-windows/utils/FreezeWindowStudioUtil'
import { ConfigsSectionWithRef } from './ConfigSection'
import css from './FreezeWindowStudioConfigSection.module.scss'

interface FreezeStudioConfigSectionProps {
  onBack: () => void
  onNext: () => void
  isReadOnly: boolean
  resources: ResourcesInterface
  validationErrors: ValidationErrorType
}

export const FreezeStudioConfigSection = (
  { onNext, onBack, resources, validationErrors, isReadOnly }: FreezeStudioConfigSectionProps,
  formikRef: unknown
) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze,
    freezeWindowLevel
  } = React.useContext(FreezeWindowContext)

  const fieldsVisibility: FieldVisibility = React.useMemo(() => {
    return getFieldsVisibility(freezeWindowLevel)
  }, [freezeWindowLevel])

  /* istanbul ignore next */
  const entityConfigs = freezeObj?.entityConfigs || []

  return (
    <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('common.coverage')}
      </Heading>
      <Card className={css.sectionCard}>
        <Heading color={Color.GREY_700} level={4} style={{ fontWeight: 600, fontSize: '14px', lineHeight: '24px' }}>
          {getString('freezeWindows.freezeStudio.defineResources')}
        </Heading>
        <ConfigsSectionWithRef
          entityConfigs={entityConfigs as EntityConfig[]}
          getString={getString}
          updateFreeze={updateFreeze}
          resources={resources}
          fieldsVisibility={fieldsVisibility}
          isReadOnly={isReadOnly}
          ref={formikRef as React.MutableRefObject<FormikProps<FreezeObj>>}
          validationErrors={validationErrors}
        />
      </Card>
      <Layout.Horizontal spacing="small" margin={{ top: 'xxlarge' }}>
        <Button
          margin={{ top: 'medium' }}
          icon="chevron-left"
          onClick={onBack}
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
        />
        <Button
          margin={{ top: 'medium' }}
          rightIcon="chevron-right"
          onClick={onNext}
          variation={ButtonVariation.PRIMARY}
          text={getString('continue')}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export const FreezeStudioConfigSectionWithRef = React.forwardRef(FreezeStudioConfigSection)
