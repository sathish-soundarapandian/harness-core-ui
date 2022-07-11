import React from 'react'
import type { SettingDTO } from 'services/cd-ng'
interface SettingsDefaultHandlerProps {
  valueType: SettingDTO['valueType']
  allowedValues: SettingDTO['allowedValues']
}
export const SettingsDefaultHandler: React.FC<SettingsDefaultHandlerProps> = ({ allowedValues, valueType }) => {
  return <>Default Test HAndler</>
}
