import { parse } from 'yaml'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { get, set } from 'lodash-es'
export const getRuntimeInputKeys = object => {
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

export const getTemplatesDataAsStepTemplate = templatesData => {
  // inject so step.spec becomes step.template.templateInputs.spec
  const parsedInputSetTemplateYaml = parse(templatesData.data.inputSetTemplateYaml)
  if (get(parsedInputSetTemplateYaml, 'pipeline.stages[0].stage.spec.execution.steps[0].step.template')) {
    return templatesData
  }
  // const stepSpec = get(parsedInputSetTemplateYaml, 'pipeline.stages[0].stage.spec.execution.steps[0].step.spec')
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
  templatesDataAsStepTemplate.data.inputSetTemplateYaml = yamlStringify(newInputSetTemplateYaml)
  return templatesDataAsStepTemplate
  // stringify pipeline object
}
