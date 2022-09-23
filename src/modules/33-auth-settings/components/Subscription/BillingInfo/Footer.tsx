import React from 'react'
import { Layout, ButtonVariation, Button } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
interface FooterProps {
  handleBack: () => void
}
function Footer(props: FooterProps): JSX.Element {
  const formik = useFormikContext()
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small">
      <Button
        variation={ButtonVariation.SECONDARY}
        text={getString('back')}
        onClick={props.handleBack}
        icon="chevron-left"
      />

      <Button
        text={getString('authSettings.billing.next')}
        variation={ButtonVariation.PRIMARY}
        onClick={() => formik.handleSubmit()}
        rightIcon="chevron-right"
      />
    </Layout.Horizontal>
  )
}

export default Footer
