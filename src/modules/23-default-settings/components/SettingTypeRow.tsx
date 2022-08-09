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
import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import cx from 'classnames'
import type { SettingHandler } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingType } from '@default-settings/interfaces/SettingType.types'
import { useStrings } from 'framework/strings'
import type { SettingDTO, SettingRequestDTO } from 'services/cd-ng'
import css from './SettingsCategorySection.module.scss'
interface SettingTypeRowProps {
  settingTypeHandler: SettingHandler
  onSelectionChange: (val: string) => void
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
const SettingTypeRow: React.FC<SettingTypeRowProps> = ({
  settingTypeHandler,
  onSelectionChange,
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
          onSettingSelectionChange: onSelectionChange,
          onRestore,
          settingValue: settingValue || undefined,
          categoryAllSettings: allSettings,
          setFieldValue
        })}
      </Container>

      <Container flex={{ alignItems: 'center' }} className={css.settingOverrideRestore}>
        <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="large">
          {!settingValue?.isSettingEditable ? (
            <span />
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

          {settingValue?.value === settingValue?.defaultValue || !settingValue?.isSettingEditable ? (
            <span />
          ) : (
            <Button
              className={css.settingRestore}
              size={ButtonSize.SMALL}
              tooltipProps={{ dataTooltipId: 'defaultSettingsFormRestoreToDefault' }}
              icon="reset"
              iconProps={{ color: Color.BLUE_700 }}
              onClick={onRestore}
              text={getString('defaultSettings.restoreToDefault')}
              variation={ButtonVariation.LINK}
            />
          )}
        </Layout.Horizontal>
      </Container>
    </Layout.Horizontal>
  )
}
export default SettingTypeRow
