import { defineArtifactSource } from './defineArtifactSource'
import { fillArtifactWizardData } from './fillArtifactWizardData'
import { fillConditionTabData } from './fillConditionTabData'
import { enterNameDescriptionAndTags } from '../../triggers-helpers/enterNameDescriptionAndTags'
import { fillPipelineInputTabDataAndSubmitForm } from '../../triggers-helpers/fillPipelineInputTabData'

export const fillArtifactTriggerData = ({
  artifactTypeCy,
  triggerName,
  description = 'test description',
  tags = ['tag1', 'tag2'],
  connectorId = '',
  fillArtifactData,
  inputSetRefs = [],
  triggerYAML
}): void => {
  cy.contains('span', '+ New Trigger').click()

  // Trigger Selection Drawer
  cy.get(`section[data-cy="${artifactTypeCy}"]`).click()

  // Configuration Tab
  enterNameDescriptionAndTags({ triggerName, description, tags })
  defineArtifactSource()
  fillArtifactWizardData({ connectorId, fillArtifactData })

  // Conditions Tab
  fillConditionTabData()

  // Pipeline Input Tab
  fillPipelineInputTabDataAndSubmitForm({ inputSetRefs, triggerYAML })
}
