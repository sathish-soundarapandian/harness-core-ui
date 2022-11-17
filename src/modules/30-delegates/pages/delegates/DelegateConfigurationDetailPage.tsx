/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, PageError, SimpleTagInput, TextInput, useToggle } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import {
  SectionContainer,
  SectionContainerTitle,
  SectionLabelValuePair
} from '@delegates/components/SectionContainer/SectionContainer'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import type {
  DelegateConfigProps,
  ProjectPathProps,
  ModulePathParams,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import { useUpdateDelegateConfigNgV2, useGetDelegateConfigNgV2, DelegateProfileDetailsNg } from 'services/cd-ng'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { fullSizeContentStyle } from '@delegates/constants'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useToaster } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { DetailPageTemplate } from '../../components/DetailPageTemplate/DetailPageTemplate'
import css from './DelegateConfigurationDetailPage.module.scss'

export default function DelegateProfileDetails(): JSX.Element {
  const { getString } = useStrings()
  const { delegateConfigIdentifier, accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<ProjectPathProps & ModulePathParams> & AccountPathProps & DelegateConfigProps
  >()
  const { data, loading, refetch, error } = useGetDelegateConfigNgV2({
    accountId,
    delegateConfigIdentifier,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const { showError, showSuccess } = useToaster()

  const profile = data?.resource
  const breadcrumbs = [
    {
      label: getString('delegate.delegates'),
      url: routes.toDelegateList({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module
      })
    },
    {
      label: getString('delegate.delegatesConfigurations'),
      url: routes.toDelegateConfigs({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module
      })
    }
  ]

  const [editMode, toggleEditMode] = useToggle(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [formData, setFormData] = useState<DelegateProfileDetailsNg>({} as DelegateProfileDetailsNg)

  const { mutate: updateConfiguration } = useUpdateDelegateConfigNgV2({
    accountId,
    delegateConfigIdentifier,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const onEdit = async (profileData: DelegateProfileDetailsNg) => {
    setShowSpinner(true)
    const { uuid, name, description, primary, approvalRequired, startupScript, selectors } = profileData
    let response
    try {
      response = await updateConfiguration({
        uuid,
        name,
        accountId,
        description,
        primary,
        approvalRequired,
        startupScript,
        selectors
      })
      if ((response as any)?.responseMessages.length) {
        const err = (response as any)?.responseMessages?.[0]?.message
        showError(err)
      } else {
        showSuccess(getString('delegates.successfullyUpdatedConfig'))
        setShowSpinner(true)
        refetch().then(() => {
          setShowSpinner(false)
        })
      }
    } catch (e) {
      showError(e.message)
    } finally {
      setShowSpinner(false)
    }
  }

  const onValidate = (profileData: DelegateProfileDetailsNg) => {
    for (const key of Object.keys(profileData)) {
      if (key === 'name' && !profileData['name']) {
        showError(getString('delegates.configNameRequired'))
        return false
      }
    }

    return true
  }

  const toggleEditModeOrSave = useCallback(
    delConfig => {
      if (!editMode) {
        toggleEditMode()
      } else {
        if (onValidate(delConfig)) {
          onEdit(delConfig)

          toggleEditMode()
        }
      }
    },
    [editMode, toggleEditMode]
  )

  useEffect(() => {
    const url = window.location.href

    if (url.includes('edit')) {
      toggleEditMode()
    }
  }, [])

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  const permissionRequestEditConfiguration = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE_CONFIGURATION,
    resource: {
      resourceType: ResourceType.DELEGATECONFIGURATION,
      resourceIdentifier: delegateConfigIdentifier
    }
  }

  if (loading && !data) {
    return (
      <Container style={fullSizeContentStyle}>
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return (
      <Container style={fullSizeContentStyle}>
        <PageError message={error.message} onClick={() => refetch()} />
      </Container>
    )
  }

  return (
    <>
      {showSpinner && <PageSpinner />}
      {!showSpinner && (
        <DetailPageTemplate
          breadcrumbs={breadcrumbs}
          title={profile?.name as string}
          subTittle={profile?.description}
          tags={profile?.selectors}
          headerExtras={
            <RbacButton
              icon={editMode ? 'floppy-disk' : 'edit'}
              text={editMode ? getString('save') : getString('edit')}
              permission={permissionRequestEditConfiguration}
              id="editDelegateConfigurationBtn"
              data-test="editDelegateConfigurationButton"
              style={{
                position: 'absolute',
                top: '50px',
                right: '50px',
                color: 'var(--primary-7)',
                borderColor: 'var(--primary-7)'
              }}
              onClick={() => {
                toggleEditModeOrSave(formData)
              }}
            />
          }
        >
          <Container padding="xxlarge">
            <Layout.Horizontal spacing="large">
              <Layout.Vertical spacing="large" width={600}>
                <SectionContainer>
                  <SectionContainerTitle>{getString('overview')}</SectionContainerTitle>

                  {/* Name */}
                  <SectionLabelValuePair
                    dataTooltipId="delegateConfig_name"
                    label={getString('delegate.CONFIGURATION_NAME')}
                    value={
                      editMode ? (
                        <TextInput
                          autoFocus
                          defaultValue={profile?.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData({ ...formData, name: e.target.value } as DelegateProfileDetailsNg)
                          }}
                        />
                      ) : (
                        profile?.name
                      )
                    }
                  />

                  <SectionLabelValuePair
                    dataTooltipId="delegateConfig_identifier"
                    label={getString('delegates.delegateIdentifier')}
                    value={profile?.identifier}
                  />

                  {/* Description */}
                  {!editMode && profile?.description && (
                    <SectionLabelValuePair
                      dataTooltipId="delegateConfig_description"
                      label={getString('description')}
                      value={formData.description}
                    />
                  )}
                  {editMode && (
                    <SectionLabelValuePair
                      dataTooltipId="delegateConfig_description"
                      label={getString('description')}
                      value={
                        <TextInput
                          defaultValue={formData.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData({ ...formData, description: e.target.value } as DelegateProfileDetailsNg)
                          }}
                        />
                      }
                    />
                  )}

                  {/* Tags */}
                  {!editMode && profile?.selectors && (
                    <SectionLabelValuePair
                      dataTooltipId="delegateConfig_tags"
                      label={getString('tagsLabel')}
                      value={<TagsViewer tags={formData.selectors || []} />}
                    />
                  )}
                  {editMode && (
                    <SectionLabelValuePair
                      dataTooltipId="delegateConfig_tags"
                      label={getString('tagsLabel')}
                      value={
                        <SimpleTagInput
                          fill
                          openOnKeyDown={false}
                          showClearAllButton
                          allowNewTag
                          placeholder={getString('delegate.enterTags')}
                          selectedItems={formData.selectors || []}
                          items={formData.selectors || []}
                          onChange={(selectedItems, _createdItems, _items) => {
                            setFormData({ ...formData, selectors: selectedItems as string[] })
                          }}
                        />
                      }
                    />
                  )}
                </SectionContainer>
              </Layout.Vertical>
              <SectionContainer width={550}>
                <SectionContainerTitle>{getString('delegate.Init_Script')}</SectionContainerTitle>

                <textarea
                  placeholder={editMode ? getString('delegate.initScriptPlaceholder') : undefined}
                  className={css.codeEditor}
                  {...(editMode ? undefined : { disabled: true })}
                  value={formData?.startupScript || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setFormData({ ...formData, startupScript: e.target.value } as DelegateProfileDetailsNg)
                  }}
                />
              </SectionContainer>
            </Layout.Horizontal>
          </Container>
        </DetailPageTemplate>
      )}
    </>
  )
}
