import { parse, stringify } from 'yaml'
import { get, set } from 'lodash-es'

export const getRuntimeInputKeys = (object: object): string[] => {
  const arrayOfPaths = []
  const objectEntries = Object.entries(object)
  objectEntries.forEach(([key, value]) => {
    if (typeof value === 'object') {
      arrayOfPaths.push(...getRuntimeInputKeys(value))
    } else if (typeof value === 'string' && value?.includes('<+input>')) {
      arrayOfPaths.push(key)
    }
  })
  return arrayOfPaths
}

export const getTemplatesDataAsStepTemplate = (templatesData: Record<string, any>): Record<string, any> => {
  // inject so step.spec becomes step.template.templateInputs.spec
  const parsedInputSetTemplateYaml = parse(templatesData.data.inputSetTemplateYaml)
  if (get(parsedInputSetTemplateYaml, 'pipeline.stages[0].stage.spec.execution.steps[0].step.template')) {
    return templatesData
  }
  const identifier = get(parsedInputSetTemplateYaml, 'pipeline.stages[0].stage.spec.execution.steps[0].step.identifier')
  const stepProperties = get(parsedInputSetTemplateYaml, 'pipeline.stages[0].stage.spec.execution.steps[0].step')
  delete stepProperties.identifier
  const newInputSetTemplateYaml = set(
    parsedInputSetTemplateYaml,
    'pipeline.stages[0].stage.spec.execution.steps[0].step',
    { identifier, template: { templateInputs: { ...stepProperties } } }
  )
  // replace inputSetTemplateYaml with step template yaml
  const templatesDataAsStepTemplate = { ...templatesData }
  templatesDataAsStepTemplate.data.inputSetTemplateYaml = stringify(newInputSetTemplateYaml)
  return templatesDataAsStepTemplate
}
