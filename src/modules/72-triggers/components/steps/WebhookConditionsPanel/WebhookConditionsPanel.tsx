/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, FormInput, Text, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import { GitSourceProviders } from '@triggers/components/Triggers/utils'
import { eventTypes } from '@triggers/components/Triggers/WebhookTrigger/utils'
import AddConditionsSection, {
  ConditionRow,
  ConditionsRowHeaders
} from '@triggers/components/AddConditionsSection/AddConditionsSection'
import css from './WebhookConditionsPanel.module.scss'

interface WebhookConditionsPanelPropsInterface {
  formikProps?: any
}

const WebhookConditionsPanel: React.FC<WebhookConditionsPanelPropsInterface> = ({ formikProps }): JSX.Element => {
  const {
    values: { event, sourceRepo },
    values: formikValues,
    setFieldValue,
    errors
  } = formikProps
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={cx(css.webhookConditionsContainer)} spacing="large" padding="xxlarge">
      <Text style={{ fontSize: '16px' }} font={{ weight: 'bold' }} inline={true} color={Color.GREY_800}>
        {getString('conditions')}
        <Text style={{ display: 'inline-block', fontSize: '16px' }} color={Color.GREY_500}>
          {getString('titleOptional')}
        </Text>
        <HarnessDocTooltip tooltipId="conditionsOptional" useStandAlone={true} />
      </Text>
      <Text
        color={Color.BLACK}
        style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-large)' }}
        data-tooltip-id="conditionsSubtitle"
      >
        {getString('triggers.conditionsPanel.subtitle')}
        <HarnessDocTooltip tooltipId="conditionsSubtitle" useStandAlone={true} />
      </Text>
      {sourceRepo !== GitSourceProviders.CUSTOM.value && (
        <Layout.Vertical className={css.formContent} style={{ marginBottom: 'var(--spacing-4)!important' }}>
          <section>
            <ConditionsRowHeaders getString={getString} />
            {event !== eventTypes.PUSH && event !== eventTypes.TAG && (
              <ConditionRow
                formikProps={formikProps}
                name="sourceBranch"
                label={getString('triggers.conditionsPanel.sourceBranch')}
              />
            )}
            {event !== eventTypes.TAG && (
              <ConditionRow
                formikProps={formikProps}
                name="targetBranch"
                label={
                  event === eventTypes.PUSH
                    ? getString('triggers.conditionsPanel.branchName')
                    : getString('triggers.conditionsPanel.targetBranch')
                }
              />
            )}
            {event !== eventTypes.TAG && sourceRepo !== GitSourceProviders.AWS_CODECOMMIT.value && (
              <ConditionRow
                formikProps={formikProps}
                name="changedFiles"
                label={getString('triggers.conditionsPanel.changedFiles')}
              />
            )}
            {event === eventTypes.TAG && (
              <ConditionRow
                formikProps={formikProps}
                name="tagCondition"
                label={getString('triggers.conditionsPanel.tagName')}
              />
            )}
          </section>
        </Layout.Vertical>
      )}
      <Layout.Vertical className={css.formContent}>
        <AddConditionsSection
          title={getString('triggers.conditionsPanel.headerConditions')}
          key="headerConditions"
          fieldId="headerConditions"
          attributePlaceholder="<+trigger.header['key-name']>"
          formikValues={formikValues}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      </Layout.Vertical>
      <Layout.Vertical className={css.formContent}>
        <AddConditionsSection
          title={getString('triggers.conditionsPanel.payloadConditions')}
          key="payloadConditions"
          fieldId="payloadConditions"
          attributePlaceholder="<+trigger.payload.pathInJson>"
          formikValues={formikValues}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      </Layout.Vertical>
      <Layout.Vertical className={css.formContent}>
        <Text className={css.sectionHeader}>
          {getString('triggers.conditionsPanel.jexlCondition')}
          <HarnessDocTooltip tooltipId="jexlCondition" useStandAlone={true} />
        </Text>
        <FormInput.Text
          style={{ width: '100%', marginBottom: '0' }}
          name="jexlCondition"
          label=""
          placeholder={getString('triggers.conditionsPanel.jexlConditionPlaceholder')}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default WebhookConditionsPanel
