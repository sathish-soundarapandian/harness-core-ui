/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonSize, ButtonVariation, Checkbox, Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useEffect, useMemo, useState } from 'react'
import { useFormikContext } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { SettingHandler } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingType } from '@default-settings/interfaces/SettingType.types'
import { useStrings } from 'framework/strings'
import type { SettingDTO, SettingRequestDTO } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './SettingsCategorySection.module.scss'
interface SettingTypeRowProps {
  settingTypeHandler: SettingHandler
  onSettingChange: (val: string) => void
  settingValue?: SettingDTO | undefined
  onRestore: () => void
  settingType: SettingType
  onAllowOverride: (checked: boolean) => void
  allowOverride: boolean
  errorMessage: string
  otherSettings?: Map<SettingType, SettingRequestDTO>

  allSettings: Map<SettingType, SettingDTO>
  isSubCategory: boolean
}
const getSettingSourceLabel = (settingSource: SettingDTO['settingSource']) => {
  switch (settingSource) {
    case 'ACCOUNT':
      return 'account'
    case 'ORG':
      return 'orgLabel'
    case 'PROJECT':
      return 'projectLabel'
  }
}
const getCurrentScope = ({ orgIdentifier, projectIdentifier }: ProjectPathProps): SettingDTO['settingSource'] => {
  if (projectIdentifier) {
    return 'PROJECT'
  }
  if (orgIdentifier) {
    return 'ORG'
  }
  return 'ACCOUNT'
}

const getLowestAvailableScope = (allowedScopes: SettingDTO['allowedScopes'] | undefined) => {
  const allowedScopesSet = new Set(allowedScopes)
  if (allowedScopesSet.has('PROJECT')) {
    return 'PROJECT'
  } else if (allowedScopesSet.has('ORGANIZATION')) {
    return 'ORG'
  } else {
    return 'ACCOUNT'
  }
}

type SettingChangedViaType = 'RESTORE' | 'UPDATE' | undefined

export const SettingTypeRowHeader: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal padding={{ top: 'small', bottom: 'small' }} className={css.settingRowHeader}>
      <Container flex={{ alignItems: 'center' }} className={css.rowHeaderLabel}>
        <Text font={{ variation: FontVariation.BODY2 }}>{getString('name')}</Text>
      </Container>
      <Container flex={{ alignItems: 'center' }} className={css.typeRenderer}>
        <Text font={{ variation: FontVariation.BODY2 }}>{getString('valueLabel')}</Text>
      </Container>

      <Container flex={{ alignItems: 'center' }} className={css.settingRestoreRow}>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} width="100%" spacing="large">
          <Text font={{ variation: FontVariation.BODY2 }}>
            <span className={css.emptyCheckBoxSpace} />
          </Text>
        </Layout.Horizontal>
      </Container>
      <Container flex={{ alignItems: 'center' }} className={css.settingOverride}>
        <Text font={{ variation: FontVariation.BODY2 }}>{getString('defaultSettings.allowOverrides')}</Text>
      </Container>
    </Layout.Horizontal>
  )
}

const SettingTypeRow: React.FC<SettingTypeRowProps> = ({
  settingTypeHandler,
  onSettingChange,
  settingValue,
  settingType,
  onRestore,
  onAllowOverride,
  allowOverride,
  allSettings,
  errorMessage,
  isSubCategory
}) => {
  const { label, settingRenderer } = settingTypeHandler

  const { setFieldValue, setFieldError } = useFormikContext()
  const { getString } = useStrings()
  useEffect(() => {
    if (errorMessage) {
      setFieldError(settingType, errorMessage)
    }
  }, [errorMessage])
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const currentScope = useMemo(() => {
    return getCurrentScope({ projectIdentifier, orgIdentifier, accountId })
  }, [projectIdentifier, orgIdentifier])
  const [settingChangedVia, updateSettingChangedVia] = useState<SettingChangedViaType>()
  const onRestoreLocal = () => {
    onRestore()
    updateSettingChangedVia('RESTORE')
  }
  const onSettingChangeLocal = (val: string) => {
    onSettingChange(val)
    updateSettingChangedVia('UPDATE')
  }
  return (
    <Layout.Vertical>
      <Layout.Horizontal padding={isSubCategory ? { top: 'none', bottom: 'none' } : { top: 'small', bottom: 'small' }}>
        <Container flex={{ alignItems: 'center' }} className={css.settingLabelContainer}>
          <Container
            flex={{ alignItems: 'center' }}
            className={cx(isSubCategory && css.subCategoryLabel)}
            padding={!isSubCategory ? { top: 'none', bottom: 'none' } : { top: 'medium', bottom: 'medium' }}
          >
            <Text
              font={{ variation: FontVariation.BODY2 }}
              tooltipProps={{ dataTooltipId: `defaultSettingsForm_${settingType}` }}
            >
              {getString(label)}
            </Text>
          </Container>
        </Container>
        <Container flex={{ alignItems: 'center' }} className={css.typeRenderer}>
          {settingRenderer({
            identifier: settingType,
            onSettingSelectionChange: onSettingChangeLocal,
            onRestore: onRestoreLocal,
            settingValue: settingValue || undefined,
            categoryAllSettings: allSettings,
            setFieldValue,
            errorMessage
          })}
        </Container>

        <Container flex={{ alignItems: 'center' }} className={css.settingRestoreRow}>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} width="100%" spacing="large">
            {(settingChangedVia !== 'UPDATE' && settingValue?.settingSource !== currentScope) ||
            !settingValue?.isSettingEditable ? (
              <Text
                icon="info"
                color={Color.BLUE_600}
                iconProps={{ color: Color.BLUE_600 }}
                padding={{ left: 'small' }}
              >
                {settingValue?.settingSource !== 'DEFAULT'
                  ? getString('defaultSettings.inheritedFrom', {
                      source: getString(getSettingSourceLabel(settingValue?.settingSource) as keyof StringsMap)
                    })
                  : getString('common.configureOptions.defaultValue')}
              </Text>
            ) : (
              settingChangedVia !== 'RESTORE' && (
                <Button
                  className={css.settingRestore}
                  size={ButtonSize.SMALL}
                  tooltipProps={{ dataTooltipId: 'defaultSettingsFormRestoreToDefault' }}
                  icon="reset"
                  iconProps={{ color: Color.BLUE_700 }}
                  onClick={onRestoreLocal}
                  text={getString('defaultSettings.restoreToDefault')}
                  variation={ButtonVariation.LINK}
                />
              )
            )}
          </Layout.Horizontal>
        </Container>
        <Container flex={{ alignItems: 'center' }} className={css.settingOverride}>
          {getLowestAvailableScope(settingValue?.allowedScopes) ==
            getCurrentScope({ projectIdentifier, orgIdentifier, accountId }) || !settingValue?.isSettingEditable ? (
            <span className={css.emptyCheckBoxSpace} />
          ) : (
            <Checkbox
              data-tooltip-id={'defaultSettingsFormOverrideAllow'}
              checked={allowOverride}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                onAllowOverride(event.currentTarget.checked)
              }}
            />
          )}
        </Container>
      </Layout.Horizontal>
      <hr className={cx(isSubCategory ? css.rowBorderLineForSubCategory : css.rowBorderLine)} />
    </Layout.Vertical>
  )
}
export default SettingTypeRow
