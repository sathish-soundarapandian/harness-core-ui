/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import classnames from 'classnames'
import {
  Button,
  ButtonVariation,
  Card,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import type { EntityConfig } from '@freeze-windows/types'
import { getInitialValuesForConfigSection } from './FreezeWindowStudioUtil'
import css from './FreezeWindowStudio.module.scss'

interface FreezeStudioConfigSectionProps {
  isReadOnly: boolean
  onBack: () => void
  onNext: () => void
}

interface ConfigRendererProps {
  config: EntityConfig
  isEdit: boolean
  getString: UseStringsReturn['getString']
  index: number
  updateFreeze: (freeze: any) => void
  formikProps: any
}

const ConfigRenderer = ({ config, isEdit, getString, index, updateFreeze, formikProps }: ConfigRendererProps) => {
  const [isEditView, setEditView] = React.useState(isEdit)
  const setVisualView = () => {
    const values = formikProps.values.entity
    // todo: update only current one
    updateFreeze({ entityConfigs: values })
    setEditView(false)
  }
  return (
    <Container
      padding="large"
      className={classnames(css.configFormContainer, { [css.isEditView]: isEditView })}
      margin={{ top: 'xlarge' }}
    >
      {isEditView ? (
        <FormikForm>
          <FormInput.Text name={`entity[${index}].entity.rule`} label={getString('name')} />
          <button onClick={setVisualView}>Save</button>
        </FormikForm>
      ) : (
        <div>
          {config.entity?.rule}
          <button onClick={() => setEditView(true)}>Edit</button>
        </div>
      )}
    </Container>
  )
}

interface ConfigsSectionProps {
  entityConfigs: EntityConfig[]
  getString: UseStringsReturn['getString']
  updateFreeze: (freeze: any) => void
}
const ConfigsSection = ({ entityConfigs, getString, updateFreeze }: ConfigsSectionProps) => {
  const [initialValues, setInitialValues] = React.useState(getInitialValuesForConfigSection(entityConfigs))
  React.useEffect(() => {
    setInitialValues(getInitialValuesForConfigSection(entityConfigs))
  }, [])
  return (
    <Formik initialValues={initialValues} onSubmit={noop} formName="freezeWindowStudioConfigForm">
      {formikProps =>
        entityConfigs.map((config: EntityConfig, index: number) => (
          <ConfigRenderer
            key={index}
            config={config}
            isEdit={false}
            getString={getString}
            index={index}
            updateFreeze={updateFreeze}
            formikProps={formikProps}
          />
        ))
      }
    </Formik>
  )
}

export const FreezeStudioConfigSection: React.FC<FreezeStudioConfigSectionProps> = ({ onNext, onBack }) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze
  } = React.useContext(FreezeWindowContext)

  const entityConfigs = freezeObj?.entityConfigs || []

  return (
    <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('freezeWindows.freezeStudio.freezeConfiguration')}
      </Heading>
      <Card className={css.sectionCard}>
        <Heading color={Color.GREY_700} level={4} style={{ fontWeight: 600, fontSize: '14px', lineHeight: '24px' }}>
          {getString('freezeWindows.freezeStudio.defineResources')}
        </Heading>
        <ConfigsSection
          entityConfigs={entityConfigs as EntityConfig[]}
          getString={getString}
          updateFreeze={updateFreeze}
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
