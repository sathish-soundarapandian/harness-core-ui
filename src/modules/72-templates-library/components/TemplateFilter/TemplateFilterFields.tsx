import React from 'react'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'

export const TemplateFilterFields = (): React.ReactElement => {
  const { getString } = useStrings()

  return (
    <>
      <FormInput.Text
        name={'templateNames'}
        label={getString('name')}
        key={'templateNames'}
        placeholder={getString('name')}
      />
      <FormInput.Text
        name={'description'}
        label={getString('description')}
        placeholder={getString('common.descriptionPlaceholder')}
        key={'description'}
      />
      <FormInput.KVTagInput name="tags" label={getString('tagsLabel')} key="tags" />
    </>
  )
}
