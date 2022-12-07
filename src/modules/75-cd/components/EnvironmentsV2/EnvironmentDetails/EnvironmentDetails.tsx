/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Expander } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { parse } from 'yaml'
import cx from 'classnames'
import { defaultTo, isEqual } from 'lodash-es'
import * as Yup from 'yup'

import {
  Button,
  ButtonVariation,
  Container,
  Layout,
  Page,
  Tabs,
  Text,
  VisualYamlSelectedView as SelectedView,
  Formik,
  useToaster,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import {
  EnvironmentResponse,
  EnvironmentResponseDTO,
  NGEnvironmentConfig,
  NGEnvironmentInfoConfig,
  updateEnvironmentV2Promise,
  useGetEnvironmentV2
} from 'services/cd-ng'

import type { EnvironmentPathProps, EnvironmentQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'

import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isOnPrem } from '@common/utils/utils'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import EntityUsage from '@common/pages/entityUsage/EntityUsage'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import { PageHeaderTitle, PageHeaderToolbar } from './EnvironmentDetailsPageHeader'
import EnvironmentConfiguration from './EnvironmentConfiguration/EnvironmentConfiguration'
import { ServiceOverrides } from './ServiceOverrides/ServiceOverrides'
import InfrastructureDefinition from './InfrastructureDefinition/InfrastructureDefinition'
import { EnvironmentDetailsTab } from '../utils'
import GitOpsCluster from './GitOpsCluster/GitOpsCluster'
import EnvironmentDetailSummary from './EnvironmentDetailSummary/EnvironmentDetailSummary'

import css from './EnvironmentDetails.module.scss'

export default function EnvironmentDetails(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    ProjectPathProps & EnvironmentPathProps
  >()
  const { sectionId } = useQueryParams<EnvironmentQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<EnvironmentQueryParams>()

  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const { GITOPS_ONPREM_ENABLED, CDC_ENVIRONMENT_DASHBOARD_NG } = useFeatureFlags()
  const gitopsOnPremEnabled = GITOPS_ONPREM_ENABLED ? true : false
  const environmentSummaryEnabled = CDC_ENVIRONMENT_DASHBOARD_NG

  const formikRef = useRef<FormikProps<NGEnvironmentInfoConfig>>()

  const [selectedTabId, setSelectedTabId] = useState<EnvironmentDetailsTab>(
    EnvironmentDetailsTab[EnvironmentDetailsTab[defaultTo(sectionId, 'CONFIGURATION')]]
  )
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [updateLoading, setUpdateLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [isModified, setIsModified] = useState(false)
  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)

  const { data, loading, error, refetch } = useGetEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    environmentIdentifier: defaultTo(environmentIdentifier, '')
  })

  useEffect(() => {
    // istanbul ignore else
    if (!loading && firstLoad) {
      setFirstLoad(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const onUpdate = async (values: EnvironmentResponseDTO): Promise<void> => {
    setUpdateLoading(true)
    clear()
    try {
      const bodyWithoutYaml = {
        name: values.name,
        description: values.description,
        identifier: values.identifier,
        orgIdentifier: values.orgIdentifier,
        projectIdentifier: values.projectIdentifier,
        tags: values.tags,
        type: defaultTo(values.type, 'Production')
      }
      const response = await updateEnvironmentV2Promise({
        body: { ...bodyWithoutYaml, yaml: yamlStringify({ environment: values }) },
        queryParams: {
          accountIdentifier: accountId
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })

      // istanbul ignore else
      if (response.status === 'SUCCESS') {
        showSuccess(getString('common.environmentUpdated'))
        setIsModified(false)
        refetch()
      } else {
        throw response
      }
    } catch (e) {
      showError(getErrorInfoFromErrorObject(e, true))
    }
    setUpdateLoading(false)
  }

  const {
    createdAt,
    environment: { name, identifier, description, tags, type, yaml } = {},
    lastModifiedAt
  } = defaultTo(data?.data, {}) as EnvironmentResponse

  const handleTabChange = (tabId: EnvironmentDetailsTab): void => {
    updateQueryParams({
      sectionId: EnvironmentDetailsTab[EnvironmentDetailsTab[tabId]]
    })
    setSelectedTabId(tabId)
  }
  const parsedYamlEnvironment = useMemo(
    () => (yamlParse(defaultTo(yaml, '{}')) as NGEnvironmentConfig)?.environment,
    [yaml]
  )
  const variables = defaultTo(parsedYamlEnvironment?.variables, [])
  const overrides = parsedYamlEnvironment?.overrides

  const validate = (values: NGEnvironmentInfoConfig): void => {
    const {
      name: newName,
      description: newDescription,
      tags: newTags,
      type: newType,
      variables: newVariables,
      overrides: newOverrides
    } = values

    if (
      name == newName &&
      description === newDescription &&
      isEqual(tags, newTags) &&
      type === newType &&
      isEqual(variables, newVariables) &&
      isEqual(overrides, newOverrides)
    ) {
      setIsModified(false)
    } else {
      setIsModified(true)
    }
  }

  return (
    <>
      <HelpPanel referenceId="environmentDetails" type={HelpPanelType.FLOATING_CONTAINER} />
      {firstLoad || error ? null : (
        <Page.Header
          className={cx({ [css.environmentDetailsHeader]: Boolean(description) })}
          size={'large'}
          title={<PageHeaderTitle {...data?.data?.environment} />}
          toolbar={<PageHeaderToolbar createdAt={createdAt} lastModifiedAt={lastModifiedAt} />}
        />
      )}
      <Page.Body error={/*istanbul ignore next */ error?.message} loading={loading || updateLoading}>
        {identifier && (
          <Formik<NGEnvironmentInfoConfig>
            initialValues={
              {
                name: defaultTo(name, ''),
                identifier: defaultTo(identifier, ''),
                description,
                tags: defaultTo(tags, {}),
                type: defaultTo(type, ''),
                orgIdentifier: defaultTo(orgIdentifier, ''),
                projectIdentifier: defaultTo(projectIdentifier, ''),
                variables,
                overrides
              } as NGEnvironmentInfoConfig
            }
            formName="editEnvironment"
            onSubmit={
              /* istanbul ignore next */ values => {
                onUpdate?.({
                  ...values
                })
              }
            }
            validationSchema={Yup.object().shape({
              name: NameSchema({ requiredErrorMsg: getString('fieldRequired', { field: 'Name' }) }),
              identifier: IdentifierSchema()
            })}
            validateOnChange
            validate={validate}
          >
            {formikProps => {
              formikRef.current = formikProps
              return (
                <Container className={css.environmentDetailsBody}>
                  <Tabs
                    id="environmentDetails"
                    onChange={handleTabChange}
                    selectedTabId={selectedTabId}
                    data-tabId={selectedTabId}
                    tabList={[
                      {
                        id: EnvironmentDetailsTab.SUMMARY,
                        title: getString('summary'),
                        panel: <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />,
                        hidden: !environmentSummaryEnabled
                      },
                      {
                        id: EnvironmentDetailsTab.CONFIGURATION,
                        title: getString('configuration'),
                        panel: (
                          <EnvironmentConfiguration
                            formikProps={formikProps}
                            selectedView={selectedView}
                            setSelectedView={setSelectedView}
                            yamlHandler={yamlHandler}
                            setYamlHandler={setYamlHandler}
                            isModified={isModified}
                            data={data}
                            isEdit
                            context={PipelineContextType.Standalone}
                          />
                        )
                      },
                      {
                        id: EnvironmentDetailsTab.SERVICE_OVERRIDES,
                        title: getString('common.serviceOverrides'),
                        panel: <ServiceOverrides />
                      },
                      {
                        id: EnvironmentDetailsTab.INFRASTRUCTURE,
                        title: getString('cd.infrastructure.infrastructureDefinitions'),
                        panel: <InfrastructureDefinition />
                      },
                      {
                        id: EnvironmentDetailsTab.GITOPS,
                        title: getString('cd.gitOpsCluster'),
                        panel: <GitOpsCluster envRef={identifier} />,
                        hidden: !gitopsOnPremEnabled && isOnPrem()
                      },
                      {
                        id: EnvironmentDetailsTab.REFERENCED_BY,
                        title: getString('referencedBy'),
                        panel: (
                          <EntityUsage entityType={EntityType.Environment} entityIdentifier={environmentIdentifier} />
                        )
                      }
                    ]}
                  >
                    <Expander />
                    {(selectedTabId === EnvironmentDetailsTab.CONFIGURATION || selectedView === SelectedView.YAML) && (
                      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
                        {isModified && (
                          <Text
                            color={Color.ORANGE_600}
                            font={{ size: 'small', weight: 'bold' }}
                            icon={'dot'}
                            iconProps={{ color: Color.ORANGE_600 }}
                          >
                            {getString('unsavedChanges')}
                          </Text>
                        )}
                        <Button
                          variation={ButtonVariation.PRIMARY}
                          type={'submit'}
                          text={getString('save')}
                          data-id="environment-edit"
                          onClick={
                            /* istanbul ignore next */ () => {
                              if (selectedView === SelectedView.YAML) {
                                const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), '')
                                yamlHandler?.getYAMLValidationErrorMap()?.size
                                  ? showError(getString('common.validation.invalidYamlText'))
                                  : onUpdate(parse(latestYaml)?.environment)
                              } else {
                                formikProps.submitForm()
                              }
                            }
                          }
                          disabled={!isModified}
                        />
                        <Button
                          variation={ButtonVariation.TERTIARY}
                          text={getString('pipeline.discard')}
                          onClick={
                            /* istanbul ignore next */ () => {
                              formikRef?.current?.setValues({
                                name: defaultTo(name, ''),
                                identifier: defaultTo(identifier, ''),
                                description: description,
                                tags: defaultTo(tags, {}),
                                orgIdentifier: defaultTo(orgIdentifier, ''),
                                projectIdentifier: defaultTo(projectIdentifier, ''),
                                type: defaultTo(type, 'Production'),
                                variables,
                                overrides
                              })
                              setIsModified(false)
                            }
                          }
                          disabled={!isModified}
                        />
                      </Layout.Horizontal>
                    )}
                  </Tabs>
                </Container>
              )
            }}
          </Formik>
        )}
      </Page.Body>
    </>
  )
}
