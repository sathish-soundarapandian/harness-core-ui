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
import { getInitialValuesForConfigSection, convertValuesToYamlObj, getFieldsVisibility } from './FreezeWindowStudioUtil'
import {
  ServiceFieldRenderer,
  EnvironmentTypeRenderer,
  Organizationfield,
  OrgFieldViewMode,
  ProjectFieldViewMode,
  ProjectField,
  FIELD_KEYS
} from './FreezeStudioConfigSectionRenderers'
import css from './FreezeWindowStudio.module.scss'

interface FreezeStudioConfigSectionProps {
  isReadOnly: boolean
  onBack: () => void
  onNext: () => void
}

interface ConfigRendererProps {
  entityConfigs: EntityConfig[]
  config: EntityConfig
  isEdit: boolean
  getString: UseStringsReturn['getString']
  index: number
  updateFreeze: (freeze: any) => void
  formikProps: any
}

const ConfigViewModeRenderer = ({ config, getString, setEditView, deleteConfig }) => {
  const { name, entities } = config || {}
  const entitiesMap =
    entities?.reduce((accum, item) => {
      if (item?.type) {
        accum[item.type] = item
      }
      return accum
    }, {}) || {}
  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
      <Layout.Vertical>
        {name}
        <OrgFieldViewMode data={entitiesMap[FIELD_KEYS.Org]} getString={getString} />
        <ProjectFieldViewMode data={entitiesMap[FIELD_KEYS.Proj]} getString={getString} />
      </Layout.Vertical>
      <Layout.Horizontal>
        <Button icon="edit" minimal withoutCurrentColor onClick={setEditView} />
        <Button icon="trash" minimal withoutCurrentColor onClick={deleteConfig} />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

const ConfigEditModeRenderer = ({
  index,
  getString,
  formikProps,
  resources,
  saveEntity,
  setVisualView,
  fieldsVisibility
}) => {
  return (
    <FormikForm>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
          <Layout.Vertical width={'400px'}>
            <FormInput.Text name={`entity[${index}].name`} label={getString('name')} />
            {fieldsVisibility.showOrgField ? (
              <Organizationfield
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index]}
                setFieldValue={formikProps.setFieldValue}
                organizations={resources.orgs || []}
              />
            ) : null}
            {fieldsVisibility.showProjectField ? (
              <ProjectField
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index]}
                setFieldValue={formikProps.setFieldValue}
                projects={resources.projects || []}
              />
            ) : null}
          </Layout.Vertical>
          <Layout.Horizontal spacing="small">
            <Button icon="tick" minimal withoutCurrentColor className={css.tickButton} onClick={saveEntity} />
            <Button icon="cross" minimal withoutCurrentColor className={css.crossButton} onClick={setVisualView} />
          </Layout.Horizontal>
        </Layout.Horizontal>
        <hr className={css.separator} />
        <Layout.Vertical>
          <Layout.Horizontal spacing="medium">
            <ServiceFieldRenderer
              getString={getString}
              name={`entity[${index}].${FIELD_KEYS.Service}`}
              isDisabled={true}
            />
            <EnvironmentTypeRenderer getString={getString} name={`entity[${index}].${FIELD_KEYS.EnvType}`} />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </FormikForm>
  )
}

const ConfigRenderer = ({
  config,
  isEdit,
  getString,
  index,
  updateFreeze,
  formikProps,
  entityConfigs,
  resources,
  fieldsVisibility
}: ConfigRendererProps) => {
  const [isEditView, setEditView] = React.useState(isEdit)
  const saveEntity = () => {
    const values = formikProps.values.entity

    const updatedEntityConfigs = [...entityConfigs]
    updatedEntityConfigs[index] = convertValuesToYamlObj(updatedEntityConfigs[index], values[index])

    updateFreeze({ entityConfigs: updatedEntityConfigs })
    setEditView(false)
  }

  const setVisualViewMode = React.useCallback(() => {
    setEditView(false)
  }, [])
  const setEditViewMode = React.useCallback(() => {
    setEditView(true)
  }, [])

  const deleteConfig = () => {
    const updatedEntityConfigs = entityConfigs.filter((config, i) => index !== i)
    updateFreeze({ entityConfigs: updatedEntityConfigs })
  }

  return (
    <Container
      padding="large"
      className={classnames(css.configFormContainer, { [css.isEditView]: isEditView })}
      margin={{ top: 'xlarge' }}
    >
      {isEditView ? (
        <ConfigEditModeRenderer
          index={index}
          getString={getString}
          formikProps={formikProps}
          resources={resources}
          saveEntity={saveEntity}
          setVisualView={setVisualViewMode}
          fieldsVisibility={fieldsVisibility}
        />
      ) : (
        <ConfigViewModeRenderer
          config={config}
          getString={getString}
          setEditView={setEditViewMode}
          deleteConfig={deleteConfig}
          fieldsVisibility={fieldsVisibility}
        />
      )}
    </Container>
  )
}

interface ConfigsSectionProps {
  entityConfigs: EntityConfig[]
  getString: UseStringsReturn['getString']
  updateFreeze: (freeze: any) => void
}
const ConfigsSection = ({
  entityConfigs,
  getString,
  updateFreeze,
  resources,
  fieldsVisibility
}: ConfigsSectionProps) => {
  const [initialValues, setInitialValues] = React.useState(getInitialValuesForConfigSection(entityConfigs))
  React.useEffect(() => {
    setInitialValues(getInitialValuesForConfigSection(entityConfigs))
  }, [])
  return (
    <>
      <Formik initialValues={initialValues} onSubmit={noop} formName="freezeWindowStudioConfigForm">
        {formikProps =>
          entityConfigs.map((config: EntityConfig, index: number) => (
            <ConfigRenderer
              key={index}
              config={config}
              isEdit={index === 0}
              getString={getString}
              index={index}
              updateFreeze={updateFreeze}
              formikProps={formikProps}
              entityConfigs={entityConfigs}
              resources={resources}
              fieldsVisibility={fieldsVisibility}
            />
          ))
        }
      </Formik>
      <Button
        minimal
        withoutBoxShadow
        intent="primary"
        text="Add rule"
        icon="plus"
        onClick={() => console.log('Hello World')}
        className={css.addNewRuleButton}
      />
    </>
  )
}

export const FreezeStudioConfigSection: React.FC<FreezeStudioConfigSectionProps> = ({ onNext, onBack, resources }) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze,
    freezeWindowLevel
  } = React.useContext(FreezeWindowContext)

  const fieldsVisibility = React.useMemo(() => {
    return getFieldsVisibility(freezeWindowLevel)
  }, [freezeWindowLevel])
  // console.log('freezeWindowLevel', freezeWindowLevel)
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
          resources={resources}
          fieldsVisibility={fieldsVisibility}
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
