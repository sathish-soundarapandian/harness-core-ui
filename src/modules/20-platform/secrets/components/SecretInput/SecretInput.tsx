/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { connect, FormikContextType } from 'formik'
import {
  Layout,
  Icon,
  Container,
  Text,
  DataTooltipInterface,
  FormikTooltipContext,
  HarnessDocTooltip,
  FormError
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get, isPlainObject, pick } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import useCreateOrSelectSecretModal from '@secrets/modals/CreateOrSelectSecretModal/useCreateOrSelectSecretModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { SecretMultiSelectProps } from '@secrets/utils/SecretField'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper, ConnectorInfoDTO } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import { getReference } from '@common/utils/utils'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue,
  ScopedObjectDTO
} from '@common/components/EntityReference/EntityReference'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import { MultiReferenceSelectPlaceholder } from '@common/components/ReferenceSelect/ReferenceSelect'
import css from './SecretInput.module.scss'

export interface SecretInputProps {
  name: string
  label?: string
  placeholder?: string
  type?: Exclude<SecretResponseWrapper['secret']['type'], 'SSHKey'>
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  /**
   * Used when opening Create/Select/Update Secret modal from the Create Connector modal context
   * to be added as a source_category query param to get a filtered list of secrets/connectors from the BE
   */
  connectorTypeContext?: ConnectorInfoDTO['type']
  allowSelection?: boolean
  privateSecret?: boolean
  tooltipProps?: DataTooltipInterface
  // To enable File and Text Secret Selection both.
  isMultiTypeSelect?: boolean
  scope?: ScopedObjectDTO
  /** when true, multiple secrets can be selected */
  isMultiSelect?: boolean
  disabled?: boolean
}

interface FormikSecretInput extends SecretInputProps {
  formik: FormikContextType<any>
}

const SecretInput: React.FC<FormikSecretInput> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const {
    formik,
    label,
    name,
    onSuccess,
    type = 'SecretText',
    secretsListMockData,
    placeholder,
    connectorTypeContext,
    allowSelection = true,
    privateSecret,
    isMultiTypeSelect = false,
    scope,
    isMultiSelect = false,
    disabled = false
  } = props
  const value = get(formik.values, name)
  const secretReference = isMultiSelect ? undefined : value

  // Multiselect support is primarily added for selecting allowed values in the configure options dialog (SecretConfigureOptions.tsx).
  // Unlike secretReference, selectedSecrets is ScopeAndIdentifier[] as the rest of the secret metadata is not used.
  const selectedSecrets: ScopeAndIdentifier[] = useMemo(() => {
    if (!Array.isArray(value)) return []

    return value.map(sRef => ({
      scope: getScopeFromValue(sRef),
      identifier: getIdentifierFromValue(sRef)
    }))
  }, [value])

  const formikSetFieldValue = formik.setFieldValue

  const onMultiSelect = useCallback<NonNullable<SecretMultiSelectProps['onMultiSelect']>>(
    selected => {
      formikSetFieldValue(
        name,
        selected.map(s => getReference(s.scope, s.identifier))
      )
    },
    [formikSetFieldValue, name]
  )

  const { openCreateOrSelectSecretModal } = useCreateOrSelectSecretModal(
    {
      type: isMultiTypeSelect ? undefined : type,
      onSuccess: secret => {
        if (isMultiSelect) return

        formik.setFieldValue(name, secret)
        /* istanbul ignore next */
        onSuccess?.(secret)
      },
      secretsListMockData,
      connectorTypeContext: connectorTypeContext,
      scope,
      isMultiSelect,
      selectedSecrets,
      onMultiSelect
    },
    [name, onSuccess, isMultiSelect, selectedSecrets, onMultiSelect],
    secretReference?.referenceString
  )
  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: formData => {
      if (isMultiSelect) return

      const secret: SecretReference = {
        ...pick(formData, 'identifier', 'name', 'orgIdentifier', 'projectIdentifier', 'type'),
        referenceString: getReference(getScopeFromDTO(formData), formData.identifier) as string
      }
      formik.setFieldValue(name, secret)
      onSuccess?.(secret)
    },
    connectorTypeContext: connectorTypeContext,
    privateSecret: privateSecret
  })

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  const getPlaceholder = (): string => {
    if (placeholder) {
      return placeholder
    }

    if (!allowSelection) {
      return getString('secrets.createSecret')
    }

    if (isMultiSelect) {
      return getString('secrets.selectSecrets')
    }

    return getString('createOrSelectSecret')
  }

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  return (
    <FormGroup
      helperText={errorCheck() ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
    >
      <Layout.Vertical>
        {label && (
          <label className={'bp3-label'}>
            <HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} />
          </label>
        )}
        {!isMultiSelect && (
          <Container flex={{ alignItems: 'center', justifyContent: 'space-between' }} className={css.container}>
            <Link
              to="#"
              className={css.containerLink}
              data-testid={name}
              onClick={e => {
                e.preventDefault()
                if (allowSelection) {
                  openCreateOrSelectSecretModal()
                } else {
                  openCreateSecretModal(type)
                }
              }}
            >
              <Icon size={24} height={12} name={'key-main'} />
              <Text
                color={Color.PRIMARY_7}
                flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
                padding="small"
                className={css.containerLinkText}
              >
                <div>{secretReference ? getString('secrets.secret.configureSecret') : getPlaceholder()}</div>
                {secretReference ? <div>{`<${secretReference['name']}>`}</div> : null}
              </Text>
            </Link>
            {secretReference ? (
              <Container flex={{ justifyContent: 'flex-end' }}>
                <Icon
                  name="circle-cross"
                  size={14}
                  className={css.cross}
                  color={Color.GREY_400}
                  onClick={() => {
                    formik.setFieldValue(name, undefined)
                  }}
                />
                <RbacButton
                  minimal
                  className={css.containerEditBtn}
                  data-testid={`${name}-edit`}
                  onClick={() =>
                    openCreateSecretModal(secretReference.type || type, {
                      identifier: secretReference?.['identifier'],
                      projectIdentifier: secretReference?.['projectIdentifier'],
                      orgIdentifier: secretReference?.['orgIdentifier']
                    } as SecretIdentifiers)
                  }
                  permission={{
                    permission: PermissionIdentifier.UPDATE_SECRET,
                    resource: {
                      resourceType: ResourceType.SECRET,
                      resourceIdentifier: secretReference?.['identifier']
                    },
                    resourceScope: {
                      accountIdentifier: accountId,
                      projectIdentifier: secretReference?.['projectIdentifier'],
                      orgIdentifier: secretReference?.['orgIdentifier']
                    }
                  }}
                  text={<Icon size={16} name={'edit'} color={Color.PRIMARY_7} />}
                />
              </Container>
            ) : null}
          </Container>
        )}
        {isMultiSelect && (
          <MultiReferenceSelectPlaceholder
            disabled={disabled}
            selected={selectedSecrets}
            placeholder={getPlaceholder()}
            onClear={() => formik.setFieldValue(name, [])}
            onClick={openCreateOrSelectSecretModal}
          />
        )}
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikSecretInput, 'formik'>>(SecretInput)
