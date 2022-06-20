import { generateSchemaTypes, generateReactQueryComponents } from '@openapi-codegen/typescript'
import { defineConfig } from '@openapi-codegen/cli'
export default defineConfig({
  portal: {
    from: {
      relativePath: 'src/services/portal/swagger.json',
      source: 'file'
    },
    outputDir: 'src/services/portal/queries',
    to: async context => {
      const filenamePrefix = 'Portal'
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      })
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      })
    }
  }
})
