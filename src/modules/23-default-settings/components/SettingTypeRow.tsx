import {
  Button,
  ButtonSize,
  ButtonVariation,
  Checkbox,
  Color,
  Container,
  FontVariation,
  Layout,
  Text
} from '@harness/uicore'
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
type SettingChangedViaType = 'RESTORE' | 'UPDATE' | undefined
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
    <Layout.Horizontal>
      <Container flex={{ alignItems: 'center' }} className={css.settingLabelContainer}>
        <Container flex={{ alignItems: 'center' }} className={cx(isSubCategory && css.subCategoryLabel)}>
          <Text font={{ variation: FontVariation.BODY2 }}>{getString(label)}</Text>
        </Container>
      </Container>
      <Container flex={{ alignItems: 'center' }} className={css.typeRenderer}>
        {settingRenderer({
          identifier: settingType,
          onSettingSelectionChange: onSettingChangeLocal,
          onRestore: onRestoreLocal,
          settingValue: settingValue || undefined,
          categoryAllSettings: allSettings,
          setFieldValue
        })}
      </Container>

      <Container flex={{ alignItems: 'center' }} className={css.settingOverrideRestore}>
        <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="large">
          {!settingValue?.isSettingEditable ? (
            <span className={css.emptyCheckBoxSpace} />
          ) : (
            <Checkbox
              data-tooltip-id={'defaultSettingsFormOverrideAllow'}
              label={getString('defaultSettings.allowOverrides')}
              checked={allowOverride}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                onAllowOverride(event.currentTarget.checked)
              }}
            />
          )}
          {(settingChangedVia !== 'UPDATE' && settingValue?.settingSource !== currentScope) ||
          !settingValue?.isSettingEditable ? (
            <Text icon="info" color={Color.BLUE_600} iconProps={{ color: Color.BLUE_600 }} padding={{ left: 'small' }}>
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
    </Layout.Horizontal>
  )
}
export default SettingTypeRow
