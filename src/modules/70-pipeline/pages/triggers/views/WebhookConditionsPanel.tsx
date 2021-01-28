import React from 'react'
import { Layout, FormInput, Heading, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
import { eventTypes } from '../utils/TriggersWizardPageUtils'
import { GitSourceProviders } from '../utils/TriggersListUtils'
import AddConditionsSection from './AddConditionsSection'
import css from './WebhookConditionsPanel.module.scss'

export const mockOperators = [
  { label: '', value: '' },
  { label: 'equals', value: 'equals' },
  { label: 'not equals', value: 'not equals' },
  { label: 'in', value: 'in' },
  { label: 'not in', value: 'not in' },
  { label: 'starts with', value: 'starts with' },
  { label: 'ends with', value: 'ends with' },
  { label: 'regex', value: 'regex' }
]

interface WebhookConditionsPanelPropsInterface {
  formikProps?: any
}

const WebhookConditionsPanel: React.FC<WebhookConditionsPanelPropsInterface> = ({ formikProps }): JSX.Element => {
  const {
    values: { event, sourceRepo },
    values: formikValues,
    setFieldValue,
    errors,
    errors: {
      sourceBranchOperator: sourceBranchOperatorError,
      sourceBranchValue: sourceBranchValueError,
      targetBranchOperator: targetBranchOperatorError,
      targetBranchValue: targetBranchValueError
    }
  } = formikProps
  const { getString } = useStrings()
  const eventIsPush = event === eventTypes.PUSH
  return (
    <Layout.Vertical className={cx(css.webhookConditionsContainer)} spacing="large" padding="xxlarge">
      <h2 className={css.heading}>
        {getString('conditions')}{' '}
        <Text style={{ display: 'inline-block' }} color="grey400">
          {getString('pipeline-triggers.conditionsPanel.titleOptional')}
        </Text>
      </h2>
      <Text>{getString('pipeline-triggers.conditionsPanel.subtitle')}</Text>
      {sourceRepo !== GitSourceProviders.CUSTOM.value && (
        <section>
          <Heading level={2} font={{ weight: 'bold' }}>
            {getString('pipeline-triggers.conditionsPanel.branchConditions')}
          </Heading>
          {!eventIsPush && (
            <div className={css.conditionsRow}>
              <div>
                <Text style={{ fontSize: 16 }}>{getString('pipeline-triggers.conditionsPanel.sourceBranch')}</Text>
              </div>
              <FormInput.Select
                style={{ alignSelf: sourceBranchValueError ? 'baseline' : 'center' }}
                items={mockOperators}
                name="sourceBranchOperator"
                label={getString('pipeline-triggers.conditionsPanel.operator')}
                onChange={() => {
                  formikProps.setFieldTouched('sourceBranchValue', true)
                }}
              />
              <FormInput.Text
                name="sourceBranchValue"
                style={{ alignSelf: sourceBranchOperatorError ? 'baseline' : 'center' }}
                label={getString('pipeline-triggers.conditionsPanel.matchesValue')}
                onChange={() => {
                  formikProps.setFieldTouched('sourceBranchOperator', true)
                }}
              />
            </div>
          )}
          <div className={css.conditionsRow}>
            <div>
              <Text style={{ fontSize: 16 }}>
                {eventIsPush
                  ? getString('pipeline-triggers.conditionsPanel.branchName')
                  : getString('pipeline-triggers.conditionsPanel.targetBranch')}
              </Text>
            </div>
            <FormInput.Select
              items={mockOperators}
              style={{ alignSelf: targetBranchValueError ? 'baseline' : 'center' }}
              name="targetBranchOperator"
              label={getString('pipeline-triggers.conditionsPanel.operator')}
              onChange={() => {
                formikProps.setFieldTouched('targetBranchValue', true)
              }}
            />
            <FormInput.Text
              name="targetBranchValue"
              style={{ alignSelf: targetBranchOperatorError ? 'baseline' : 'center' }}
              label={getString('pipeline-triggers.conditionsPanel.matchesValue')}
              onChange={() => {
                formikProps.setFieldTouched('targetBranchOperator', true)
              }}
            />
          </div>
        </section>
      )}
      {sourceRepo === GitSourceProviders.CUSTOM.value && (
        <AddConditionsSection
          title={getString('pipeline-triggers.conditionsPanel.headerConditions')}
          key="headerConditions"
          fieldId="headerConditions"
          formikValues={formikValues}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      )}
      <AddConditionsSection
        title={getString('pipeline-triggers.conditionsPanel.payloadConditions')}
        key="payloadConditions"
        fieldId="payloadConditions"
        formikValues={formikValues}
        setFieldValue={setFieldValue}
        errors={errors}
      />
      {/* <FormInput.TextArea style={{ width: '100%' }} disabled={true} name="jexlConditions" label="JEXL Conditions" /> */}
    </Layout.Vertical>
  )
}
export default WebhookConditionsPanel
