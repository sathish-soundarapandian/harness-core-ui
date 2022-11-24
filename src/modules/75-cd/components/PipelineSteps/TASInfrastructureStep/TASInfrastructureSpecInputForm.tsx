/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Text, Layout, SelectOption, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get, defaultTo, isEqual, set, isUndefined } from 'lodash-es'

import { Connectors } from '@connectors/constants'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { Scope } from '@common/interfaces/SecretsInterface'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { useGetTasOrganizations, useGetTasSpaces } from 'services/cd-ng'
import {
  TASInfrastructureSpecEditableProps,
  getValue,
  organizationLabel,
  spaceGroupLabel
} from './TASInfrastructureInterface'
import css from './TASInfrastructureSpec.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const errorMessage = 'data.message'

export const TASInfrastructureSpecInputForm: React.FC<TASInfrastructureSpecEditableProps & { path: string }> = ({
  template,
  initialValues,
  readonly = false,
  path,
  onUpdate,
  allowableTypes,
  allValues
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [organizations, setOrganizations] = useState<SelectOption[]>([])
  const [spaces, setSpaces] = useState<SelectOption[]>([])
  const [connector, setConnector] = useState<string | undefined>(
    defaultTo(initialValues.connectorRef, allValues?.connectorRef)
  )
  const [organization, setOrganization] = useState<string | undefined>(
    defaultTo(initialValues.organization, allValues?.organization)
  )
  const [spaceValue, setSpaceValue] = useState<string | undefined>(defaultTo(initialValues.space, allValues?.space))
  const environmentRef = useMemo(
    () => defaultTo(initialValues.environmentRef, allValues?.environmentRef),
    [initialValues.environmentRef, allValues?.environmentRef]
  )

  const infrastructureRef = useMemo(
    () => defaultTo(initialValues.infrastructureRef, allValues?.infrastructureRef),
    [initialValues.infrastructureRef, allValues?.infrastructureRef]
  )

  const { expressions } = useVariablesExpression()

  const { getString } = useStrings()

  const shouldResetDependingFields = (field: string | undefined): boolean => {
    return !isUndefined(field) && getMultiTypeFromValue(field) !== MultiTypeInputType.RUNTIME
  }

  const resetForm = React.useCallback(
    (parent: string): void => {
      switch (parent) {
        case 'connectorRef':
          shouldResetDependingFields(initialValues.connectorRef) && set(initialValues, 'organization', '')
          shouldResetDependingFields(initialValues.organization) && set(initialValues, 'space', '')
          onUpdate?.(initialValues)
          break
        case 'organization':
          shouldResetDependingFields(initialValues.organization) && set(initialValues, 'space', '')
          onUpdate?.(initialValues)
          break
      }
    },
    [initialValues, onUpdate]
  )

  const queryParams = {
    connectorRef: connector as string,
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    envId: environmentRef,
    infraDefinitionId: infrastructureRef
  }

  const {
    data: organizationsData,
    loading: loadingOrganizations,
    refetch: refetchOrganizations,
    error: organizationsError
  } = useGetTasOrganizations({
    queryParams,
    lazy: true
  })

  useEffect(() => {
    setOrganizations(
      defaultTo(
        organizationsData?.data?.map(org => {
          return {
            label: org,
            value: org
          }
        }),
        []
      )
    )
  }, [organizationsData])

  const {
    data: spaceData,
    refetch: refetchSpaces,
    loading: loadingSpaces,
    error: spacesError
  } = useGetTasSpaces({
    queryParams: {
      ...queryParams,
      organization: organization as string
    },
    lazy: true
  })
  // const {
  //   data: spaceDataV2,
  //   refetch: refetchSpacesV2,
  //   loading: loadingSpacesV2,
  //   error: spacesErrorV2
  // } = useGetTasSpacesV2({
  //   queryParams,
  //   lazy: true
  // })

  const fetchSpaceUsingEnvId = (): boolean => {
    return (
      getMultiTypeFromValue(connector) !== MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(organization) !== MultiTypeInputType.RUNTIME &&
      environmentRef &&
      getMultiTypeFromValue(environmentRef) === MultiTypeInputType.FIXED &&
      infrastructureRef &&
      getMultiTypeFromValue(infrastructureRef) === MultiTypeInputType.FIXED
    )
  }

  useEffect(() => {
    const options = spaceData?.data?.map(space => ({ label: space, value: space })) || /* istanbul ignore next */ []
    setSpaces(options)
  }, [spaceData])
  // useEffect(() => {
  //   const options =
  //     spaceDataV2?.data?.spaces?.map(rg => ({ label: rg.space, value: rg.space })) || /* istanbul ignore next */ []
  //   setSpaces(options)
  // }, [spaceDataV2])

  useEffect(() => {
    resetForm('connectorRef')
  }, [connector, resetForm])

  useEffect(() => {
    resetForm('organization')
  }, [organization, resetForm])

  useEffect(() => {
    if (connector && !initialValues.connectorRef) {
      set(initialValues, 'connectorRef', connector)
    }
    if (organization && !initialValues.organization) {
      set(initialValues, 'organization', organization)
    }
    if (spaceValue && !initialValues.space) {
      set(initialValues, 'space', spaceValue)
    }
    onUpdate?.(initialValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${path}.connectorRef`}
            tooltipProps={{
              dataTooltipId: 'tasInfraConnector'
            }}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={Connectors.TAS}
            setRefValue
            onChange={
              /* istanbul ignore next */ (selected, _typeValue, type) => {
                const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                if (type === MultiTypeInputType.FIXED) {
                  const connectorRef =
                    item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                      ? `${item.scope}.${item?.record?.identifier}`
                      : item.record?.identifier
                  if (!isEqual(connectorRef, connector)) {
                    setConnector(connectorRef)
                  }
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setConnector(selected?.toString())
                }
                setOrganizations([])
                setSpaces([])
              }
            }
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: template?.connectorRef
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.organization) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <SelectInputSetView
            name={`${path}.organization`}
            tooltipProps={{
              dataTooltipId: 'tasInfraOrganization'
            }}
            disabled={readonly}
            placeholder={
              loadingOrganizations
                ? /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.tasInfra.organizationPlaceholder')
            }
            useValue
            selectItems={organizations}
            label={getString(organizationLabel)}
            multiTypeInputProps={{
              onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                if (value && type === MultiTypeInputType.FIXED) {
                  if (!isEqual(getValue(value), organization)) {
                    setOrganization(getValue(value))
                  }
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setOrganization(value?.toString())
                }
                setSpaces([])
              },
              onFocus: () => {
                if (getMultiTypeFromValue(connector) !== MultiTypeInputType.RUNTIME) {
                  refetchOrganizations({
                    queryParams
                  })
                }
              },
              selectProps: {
                items: organizations,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingOrganizations || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {loadingOrganizations
                      ? getString('loading')
                      : defaultTo(
                          get(organizationsError, errorMessage, organizationsError?.message),
                          getString('cd.steps.tasInfra.organizationError')
                        )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
            fieldPath="organization"
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.space) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <SelectInputSetView
            name={`${path}.space`}
            tooltipProps={{
              dataTooltipId: 'tasInfraSpace'
            }}
            disabled={readonly}
            placeholder={
              loadingSpaces
                ? // || loadingSpacesV2
                  /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.tasInfra.spacePlaceholder')
            }
            useValue
            selectItems={spaces}
            label={getString(spaceGroupLabel)}
            multiTypeInputProps={{
              onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                if (value && type === MultiTypeInputType.FIXED) {
                  setSpaceValue(getValue(value))
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setSpaceValue(value?.toString())
                }
              },
              onFocus: () => {
                if (connector && organization) {
                  refetchSpaces({
                    queryParams: {
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      connectorRef: connector as string,
                      organization: organization
                    }
                  })
                } else if (fetchSpaceUsingEnvId()) {
                  // refetchSpacesV2({
                  //   queryParams: {
                  //     connectorRef: connector as string,
                  //     accountIdentifier: accountId,
                  //     orgIdentifier,
                  //     projectIdentifier,
                  //     envId: environmentRef,
                  //     infraDefinitionId: infrastructureRef,
                  //     organization: organization
                  //   }
                  // })
                }
              },

              selectProps: {
                items: spaces,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingSpaces || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {loadingSpaces
                      ? //  || loadingSpacesV2
                        getString('loading')
                      : defaultTo(
                          defaultTo(
                            get(spacesError, errorMessage, spacesError?.message),
                            // get(spacesErrorV2, errorMessage, spacesErrorV2?.message)
                            undefined
                          ),
                          getString('cd.steps.tasInfra.spacesError')
                        )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
            fieldPath="space"
            template={template}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}
