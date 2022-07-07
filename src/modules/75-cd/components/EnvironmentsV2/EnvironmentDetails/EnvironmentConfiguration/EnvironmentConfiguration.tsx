/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useParams, useHistory, matchPath } from 'react-router-dom'
import { parse } from 'yaml'
import { defaultTo } from 'lodash-es'
import type { FormikProps } from 'formik'
import cx from 'classnames'

import {
  Container,
  Layout,
  Text,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  useToaster,
  ThumbnailSelect,
  Card,
  Accordion,
  MultiTypeInputType,
  ButtonVariation,
  Tag
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import { projectPathProps, modulePathProps, environmentPathProps } from '@common/utils/routeUtils'
import { NavigationCheck } from '@common/exports'
import { useStrings } from 'framework/strings'
import { NGEnvironmentInfoConfig, ResponseEnvironmentResponse, useGetYamlSchema } from 'services/cd-ng'

import type { EnvironmentPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { NameIdDescriptionTags } from '@common/components'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'

import { CustomVariablesEditableStage } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariablesEditableStage'
import type { AllNGVariables } from '@pipeline/utils/types'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'

import css from '../EnvironmentDetails.module.scss'

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `environment.yaml`,
  entityType: 'Environment',
  width: '100%',
  height: 600,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export interface EnvironmentConfigurationProps {
  formikProps: FormikProps<NGEnvironmentInfoConfig>
  selectedView: SelectedView
  setSelectedView: (view: SelectedView) => void
  yamlHandler?: YamlBuilderHandlerBinding
  setYamlHandler: Dispatch<SetStateAction<YamlBuilderHandlerBinding | undefined>>
  isModified: boolean
  data: ResponseEnvironmentResponse | null
  isEdit: boolean
  context?: PipelineContextType
}

const shouldBlockNavigation = ({
  isSubmitting,
  isValid,
  isYamlView,
  yamlHandler,
  dirty
}: {
  isSubmitting: boolean
  isValid: boolean
  isYamlView: boolean
  yamlHandler?: YamlBuilderHandlerBinding
  dirty: boolean
}): boolean => {
  const shouldBlockNav = !(isSubmitting && (isValid || isYamlView))
  if ((isYamlView && yamlHandler) || dirty) {
    return shouldBlockNav
  }
  return false
}

export default function EnvironmentConfiguration({
  selectedView,
  setSelectedView,
  formikProps,
  yamlHandler,
  setYamlHandler,
  isModified,
  data,
  isEdit,
  context
}: EnvironmentConfigurationProps) {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & EnvironmentPathProps>()
  const history = useHistory()

  const typeList: { label: string; value: string }[] = [
    {
      label: getString('production'),
      value: 'Production'
    },
    {
      label: getString('cd.preProduction'),
      value: 'PreProduction'
    }
  ]

  const { data: environmentSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Environment',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT]
  })

  const [isYamlEditable, setIsYamlEditable] = useState(false)

  const handleYamlChange = useCallback((): void => {
    const yaml = defaultTo(yamlHandler?.getLatestYaml(), '{}')
    const yamlVisual = parse(yaml).environment as NGEnvironmentInfoConfig
    if (yamlVisual) {
      formikProps?.setValues({
        ...yamlVisual
      })
    }
  }, [yamlHandler])

  const handleModeSwitch = useCallback(
    /* istanbul ignore next */ (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '{}')
        const yamlVisual = parse(yaml).environment as NGEnvironmentInfoConfig
        if (isModified && yamlHandler?.getYAMLValidationErrorMap()?.size) {
          showError(getString('common.validation.invalidYamlText'))
          return
        }
        if (yamlVisual) {
          formikProps?.setValues({
            ...yamlVisual
          })
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, data]
  )

  const handleEditMode = (): void => {
    setIsYamlEditable(true)
  }

  const isInvalidYaml = useCallback((): boolean => {
    if (yamlHandler) {
      const parsedYaml = parse(yamlHandler.getLatestYaml())
      if (!parsedYaml || yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
        return true
      }
    }
    return false
  }, [yamlHandler])

  const invalidYaml = isInvalidYaml()

  return (
    <Container padding={{ left: 'medium', right: 'medium' }}>
      <NavigationCheck
        when={isModified || invalidYaml}
        shouldBlockNavigation={nextLocation => {
          const matchDefault = matchPath(nextLocation.pathname, {
            path: routes.toEnvironmentDetails({
              ...projectPathProps,
              ...modulePathProps,
              ...environmentPathProps
            }),
            exact: true
          })
          return (
            !matchDefault?.isExact &&
            shouldBlockNavigation({
              isSubmitting: formikProps.isSubmitting,
              isValid: formikProps.isValid,
              isYamlView: selectedView === SelectedView.YAML,
              yamlHandler,
              dirty: formikProps.dirty
            })
          )
        }}
        textProps={{
          contentText: getString(invalidYaml ? 'navigationYamlError' : 'navigationCheckText'),
          titleText: getString(invalidYaml ? 'navigationYamlErrorTitle' : 'navigationCheckTitle')
        }}
        navigate={newPath => {
          history.push(newPath)
        }}
      />
      <Layout.Horizontal
        margin={{ bottom: 'medium' }}
        flex={{
          justifyContent: 'center'
        }}
        width={'100%'}
      >
        <VisualYamlToggle
          selectedView={selectedView}
          onChange={nextMode => {
            handleModeSwitch(nextMode)
          }}
        />
      </Layout.Horizontal>
      {selectedView === SelectedView.VISUAL ? (
        <>
          <Card
            className={cx(css.sectionCard, { [css.fullWidth]: context !== PipelineContextType.Standalone })}
            id="variables"
          >
            <Container width={'40%'} padding={{ top: 'small' }} margin={{ bottom: 'large' }}>
              <NameIdDescriptionTags formikProps={formikProps} identifierProps={{ isIdentifierEditable: !isEdit }} />
            </Container>
            <Text
              color={Color.GREY_450}
              margin={{ top: 'medium', bottom: 'small' }}
              font={{ variation: FontVariation.FORM_LABEL, weight: 'bold' }}
            >
              {getString('envType')}
            </Text>
            <ThumbnailSelect className={css.thumbnailSelect} name={'type'} items={typeList} />
          </Card>
          {/* #region Advanced section */}
          {data?.data && (
            <Accordion activeId={formikProps?.values?.variables?.length ? 'advanced' : ''} className={css.accordion}>
              <Accordion.Panel
                id="advanced"
                addDomId={true}
                summary={
                  <Text color={Color.GREY_700} font={{ weight: 'bold' }} margin={{ left: 'small' }}>
                    {getString('common.advanced')}
                    {getString('titleOptional')}
                  </Text>
                }
                details={
                  <Layout.Vertical spacing="medium" margin={{ bottom: 'small' }}>
                    <Card
                      className={cx(css.sectionCard, { [css.fullWidth]: context !== PipelineContextType.Standalone })}
                      id="variables"
                    >
                      <Text color={Color.GREY_700} margin={{ bottom: 'small' }} font={{ weight: 'bold' }}>
                        {getString('common.variables')}
                      </Text>
                      <CustomVariablesEditableStage
                        formName="editEnvironment"
                        initialValues={{
                          variables: defaultTo(formikProps.values.variables, []) as AllNGVariables[],
                          canAddVariable: true
                        }}
                        allowableTypes={[
                          MultiTypeInputType.FIXED,
                          MultiTypeInputType.RUNTIME,
                          MultiTypeInputType.EXPRESSION
                        ]}
                        readonly={false}
                        onUpdate={values => {
                          formikProps.setFieldValue('variables', values.variables)
                        }}
                      />
                    </Card>
                  </Layout.Vertical>
                }
              />
            </Accordion>
          )}
          {/* #endregion */}
        </>
      ) : (
        <div className={css.yamlBuilder}>
          <YAMLBuilder
            {...yamlBuilderReadOnlyModeProps}
            existingJSON={{
              environment: {
                name: defaultTo(formikProps.values.name, ''),
                identifier: defaultTo(formikProps.values.identifier, ''),
                description: formikProps.values.description,
                tags: defaultTo(formikProps.values.tags, {}),
                type: defaultTo(formikProps.values.type, 'Production'),
                orgIdentifier: defaultTo(formikProps.values.orgIdentifier, ''),
                projectIdentifier: defaultTo(formikProps.values.projectIdentifier, ''),
                variables: defaultTo(formikProps.values.variables, [])
              }
            }}
            key={isYamlEditable.toString()}
            schema={environmentSchema?.data}
            bind={setYamlHandler}
            showSnippetSection={false}
            isReadOnlyMode={!isYamlEditable}
            onChange={handleYamlChange}
            isEditModeSupported={canEdit}
            onEnableEditMode={handleEditMode}
          />
          {!isYamlEditable ? (
            <div className={css.buttonWrapper}>
              <Tag>{getString('common.readOnly')}</Tag>
              <RbacButton
                permission={{
                  resource: {
                    resourceType: ResourceType.ENVIRONMENT
                  },
                  permission: PermissionIdentifier.EDIT_ENVIRONMENT
                }}
                variation={ButtonVariation.SECONDARY}
                text={getString('common.editYaml')}
                onClick={handleEditMode}
              />
            </div>
          ) : null}
        </div>
      )}
    </Container>
  )
}
