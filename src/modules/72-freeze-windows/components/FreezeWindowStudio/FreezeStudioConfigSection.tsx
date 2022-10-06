/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { isEmpty, noop } from 'lodash-es'
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
import {
  EntityConfig,
  EntityType,
  EnvironmentType,
  FIELD_KEYS,
  FreezeWindowLevels,
  ResourcesInterface
} from '@freeze-windows/types'
import {
  convertValuesToYamlObj,
  FieldVisibility,
  getEmptyEntityConfig,
  getFieldsVisibility,
  getInitialValuesForConfigSection
} from './FreezeWindowStudioUtil'
import {
  EnvironmentTypeRenderer,
  Organizationfield,
  OrgFieldViewMode,
  ProjectField,
  ProjectFieldViewMode,
  ServiceFieldRenderer,
  ServicesAndEnvRenderer
} from './FreezeStudioConfigSectionRenderers'
import css from './FreezeWindowStudio.module.scss'

interface ConfigViewModeRendererProps {
  config: EntityConfig
  getString: UseStringsReturn['getString']
  setEditView: () => void
  deleteConfig: () => void
  fieldsVisibility: FieldVisibility
}

const ConfigViewModeRenderer: React.FC<ConfigViewModeRendererProps> = ({
  config,
  getString,
  setEditView,
  deleteConfig,
  fieldsVisibility
}) => {
  const { name, entities } = config || {}
  const entitiesMap =
    entities?.reduce((accum: any, item: EntityType) => {
      if (item?.type) {
        accum[item.type] = item as EntityType
      }
      return accum
    }, {}) || {}
  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
      <Layout.Vertical>
        <Heading
          color={Color.GREY_800}
          level={3}
          style={{ fontWeight: 700, fontSize: '12px', lineHeight: '18px', marginBottom: '12px' }}
        >
          {name}
        </Heading>

        <Layout.Horizontal>
          {fieldsVisibility.freezeWindowLevel === FreezeWindowLevels.PROJECT ? 'env' : ''}
        </Layout.Horizontal>
        <OrgFieldViewMode data={entitiesMap[FIELD_KEYS.Org]} getString={getString} />
        <ProjectFieldViewMode data={entitiesMap[FIELD_KEYS.Proj]} getString={getString} />
        <ServicesAndEnvRenderer
          freezeWindowLevel={fieldsVisibility.freezeWindowLevel}
          getString={getString}
          envType={entitiesMap[FIELD_KEYS.EnvType]?.entityRefs?.[0] || EnvironmentType.All}
        />
      </Layout.Vertical>
      <Layout.Horizontal>
        <Button icon="edit" minimal withoutCurrentColor onClick={setEditView} />
        <Button icon="trash" minimal withoutCurrentColor onClick={deleteConfig} />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

interface ConfigEditModeRendererProps {
  index: number
  getString: UseStringsReturn['getString']
  formikProps: any
  resources: ResourcesInterface
  saveEntity: any
  setVisualView: () => void
  fieldsVisibility: FieldVisibility
}

const ConfigEditModeRenderer: React.FC<ConfigEditModeRendererProps> = ({
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
            <FormInput.Text name={`entity[${index}].name`} label={getString('name')} inputGroup={{ autoFocus: true }} />
            {fieldsVisibility.showOrgField ? (
              <Organizationfield
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index] || {}}
                setFieldValue={formikProps.setFieldValue}
                organizations={resources.orgs || []}
              />
            ) : null}
            {fieldsVisibility.showProjectField ? (
              <ProjectField
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index] || {}}
                setFieldValue={formikProps.setFieldValue}
                resources={resources}
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
              isDisabled={resources.freezeWindowLevel !== FreezeWindowLevels.PROJECT}
              services={resources.services || []}
            />
            <EnvironmentTypeRenderer getString={getString} name={`entity[${index}].${FIELD_KEYS.EnvType}`} />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </FormikForm>
  )
}

interface ConfigRendererProps {
  config: EntityConfig
  isEdit: boolean
  getString: UseStringsReturn['getString']
  index: number
  updateFreeze: (freeze: any) => void
  formikProps: any
  entityConfigs: EntityConfig[]
  resources: ResourcesInterface
  fieldsVisibility: FieldVisibility
  updateInitialValues: (entityonfigs: EntityConfig[]) => void
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
  fieldsVisibility,
  updateInitialValues
}: ConfigRendererProps) => {
  const [isEditView, setEditView] = React.useState(isEdit)
  const saveEntity = async () => {
    const formErrors = await formikProps.validateForm()
    if (!isEmpty(formErrors?.entity?.[index])) {
      return
    }
    const values = formikProps.values.entity

    const updatedEntityConfigs = [...entityConfigs]
    updatedEntityConfigs[index] = convertValuesToYamlObj(updatedEntityConfigs[index], values[index], fieldsVisibility)

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
    const updatedEntityConfigs = entityConfigs.filter((_, i) => index !== i)
    updateFreeze({ entityConfigs: updatedEntityConfigs })
    updateInitialValues(updatedEntityConfigs)
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
  resources: ResourcesInterface
  fieldsVisibility: FieldVisibility
}
const ConfigsSection = ({
  entityConfigs,
  getString,
  updateFreeze,
  resources,
  fieldsVisibility
}: ConfigsSectionProps) => {
  const [initialValues, setInitialValues] = React.useState(
    getInitialValuesForConfigSection(entityConfigs, getString, resources)
  )
  React.useEffect(() => {
    setInitialValues(getInitialValuesForConfigSection(entityConfigs, getString, resources))
  }, [])

  const updateInitialValues = React.useCallback((configs: EntityConfig[]) => {
    setInitialValues(getInitialValuesForConfigSection(configs, getString, resources))
  }, [])

  const onAddRule = () => {
    const updatedEntityConfigs = [...(entityConfigs || []), getEmptyEntityConfig(fieldsVisibility)]
    setInitialValues(getInitialValuesForConfigSection(updatedEntityConfigs, getString, resources))
    updateFreeze({ entityConfigs: updatedEntityConfigs })
  }
  return (
    <>
      <Formik
        // key={entityConfigs?.length}
        initialValues={initialValues}
        enableReinitialize
        onSubmit={noop}
        formName="freezeWindowStudioConfigForm"
        validationSchema={Yup.object().shape({
          entity: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().required('Name is required')
            })
          )
        })}
      >
        {formikProps =>
          entityConfigs.map((config: EntityConfig, index: number) => (
            <ConfigRenderer
              // key={config.uuid}
              key={index}
              config={config}
              isEdit={false}
              getString={getString}
              index={index}
              updateFreeze={updateFreeze}
              formikProps={formikProps}
              entityConfigs={entityConfigs}
              resources={resources}
              fieldsVisibility={fieldsVisibility}
              updateInitialValues={updateInitialValues}
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
        onClick={onAddRule}
        // onClick={() => console.log('Hello World')}
        className={css.addNewRuleButton}
      />
    </>
  )
}

interface FreezeStudioConfigSectionProps {
  onBack: () => void
  onNext: () => void
  resources: ResourcesInterface
}

export const FreezeStudioConfigSection: React.FC<FreezeStudioConfigSectionProps> = ({ onNext, onBack, resources }) => {
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze,
    freezeWindowLevel
  } = React.useContext(FreezeWindowContext)

  const fieldsVisibility: FieldVisibility = React.useMemo(() => {
    return getFieldsVisibility(freezeWindowLevel)
  }, [freezeWindowLevel])

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
