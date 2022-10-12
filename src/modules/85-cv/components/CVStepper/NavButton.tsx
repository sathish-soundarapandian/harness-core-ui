import React from 'react'
import { Layout, Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'

interface NavButtonsProps {
  selectedTabId: string
  stepList: string[]
  setSelectedTabId: (index: string) => void
  loading?: boolean
}

export const NavButtons: React.FC<NavButtonsProps> = ({
  selectedTabId,
  stepList,
  setSelectedTabId,
  loading: saving
}) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small" padding={{ top: 'xxlarge' }}>
      <Button
        icon="chevron-left"
        text={getString('back')}
        variation={ButtonVariation.SECONDARY}
        disabled={saving}
        onClick={() => {
          const tabIndex = stepList.indexOf(selectedTabId)
          if (tabIndex) {
            setSelectedTabId(stepList[tabIndex - 1])
            return
          }
          //   handleRedirect()
        }}
      />
      <Button
        icon="chevron-left"
        text={selectedTabId === stepList[stepList.length - 1] ? getString('save') : getString('continue')}
        variation={ButtonVariation.SECONDARY}
        disabled={saving}
        onClick={() => {
          if (selectedTabId === stepList[stepList.length - 1]) {
            // formikProps.submitForm()
            console.log('Submit Form')
          } else if (true) {
            // isFormDataValid(formikProps, selectedTabId)
            setSelectedTabId(stepList[Math.min(stepList.length, stepList.indexOf(selectedTabId) + 1)])
          }
        }}
      />
    </Layout.Horizontal>
  )
}
