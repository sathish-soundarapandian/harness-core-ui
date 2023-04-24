import React from 'react'
import { FieldArray, useFormikContext } from 'formik'
import { Accordion, Button, ButtonSize, ButtonVariation, FormInput, Layout } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { JIRA_FORM_FIELDS } from '../JiraCreationFormConstants'
import type { JiraFormType } from '../../JiraCreationDrawer.types'
import style from '../../JiraCreationDrawer.module.scss'

export function JiraCreationFormOptionalConfig(): JSX.Element {
  const { values, setFieldValue } = useFormikContext<JiraFormType>()

  const { identifiers } = values

  const { getString } = useStrings()

  const handleTagsUpdate = ({ index, tagValues }: { tagValues: string[]; index: number }): void => {
    const newTagObj: { [key: string]: any } = {}
    ;(tagValues as string[])?.forEach(val => {
      newTagObj[val as string] = ''
    })

    setFieldValue(`identifiers.${index}.value`, newTagObj)
  }

  return (
    <Accordion className={style.configAccordion} panelClassName={style.accordionPanel} activeId="1">
      <Accordion.Panel
        id="1"
        summary={getString('common.optionalConfig')}
        details={
          <FieldArray
            name={JIRA_FORM_FIELDS.IDENTIFIERS}
            render={arrayHelpers => (
              <Layout.Vertical spacing="medium">
                {identifiers?.map((_, index: number) => (
                  <div key={index}>
                    <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
                      <FormInput.Text
                        label={getString('keyLabel')}
                        name={`identifiers.${index}.key`}
                        placeholder={getString('pipeline.keyPlaceholder')}
                        className={style.fieldArrayInput}
                      />
                      <FormInput.KVTagInput
                        label={getString('valueLabel')}
                        name={`identifiers.${index}.value`}
                        tagsProps={{
                          addOnBlur: true,
                          addOnPaste: true,
                          onChange: tagValues => {
                            handleTagsUpdate({ index, tagValues: tagValues as string[] })
                          }
                        }}
                        className={style.fieldArrayInput}
                      />
                      <Button
                        icon="main-trash"
                        color={Color.GREY_600}
                        variation={ButtonVariation.ICON}
                        iconProps={{ size: 22, color: Color.GREY_600 }}
                        onClick={() => arrayHelpers.remove(index)}
                      />
                    </Layout.Horizontal>
                  </div>
                ))}
                <Button
                  text={getString('pipeline.jiraCreateStep.addFields')}
                  intent={Intent.PRIMARY}
                  data-testid="addJiraField"
                  variation={ButtonVariation.LINK}
                  icon="plus"
                  size={ButtonSize.SMALL}
                  onClick={() => arrayHelpers.push('')}
                  className={style.addFieldButton}
                />
              </Layout.Vertical>
            )}
          />
        }
      ></Accordion.Panel>
    </Accordion>
  )
}
