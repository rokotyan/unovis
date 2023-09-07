import { writeFileSync } from 'fs'
import { exec } from 'child_process'

// Components
import { getComponentList } from '@unovis/shared/integrations/components'

// Types
import { SvelteComponentInput } from '@unovis/shared/integrations/types'

// Utils
import { getImportStatements, kebabCase, getConfigSummary } from '@unovis/shared/integrations/utils'

// Component Code
import { getComponentCode } from './component'


const coreComponentConfigPath = '/core/component'
const htmlElements = ['BulletLegend', 'LeafletMap', 'LeafletFlowMap']
const skipProperties = ['width', 'height']
const components = [
  ...getComponentList(),
  { name: 'LeafletMap', sources: [coreComponentConfigPath, '/components/leaflet-map'], dataType: 'Datum[]', svelteStyles: ['display:block', 'position:relative'] },
  { name: 'LeafletFlowMap', sources: [coreComponentConfigPath, '/components/leaflet-map', '/components/leaflet-flow-map'], dataType: '{ points: PointDatum[]; flows?: FlowDatum[] }', svelteStyles: ['display:block', 'position:relative'] },
  { name: 'BulletLegend', sources: ['/components/bullet-legend'], dataType: null, svelteStyles: ['display:block'] },
] as SvelteComponentInput[]

const exports: string[] = []

for (const component of components) {
  const { configProperties, configInterfaceMembers, generics, statements } = getConfigSummary(component, skipProperties)
  const importStatements = getImportStatements(component.name, statements, configInterfaceMembers, generics)
  const isStandAlone = htmlElements.includes(component.name)
  const componentCode = getComponentCode(
    component.name,
    generics,
    configProperties,
    importStatements,
    component.dataType,
    isStandAlone ? kebabCase(component.name) : component.elementSuffix,
    isStandAlone,
    component.svelteStyles
  )

  const nameKebabCase = component.kebabCaseName ?? kebabCase(component.name)
  const file = `${nameKebabCase}.svelte`
  const path = `${isStandAlone ? 'html-' : ''}components/${nameKebabCase}`
  const pathComponentBase = `src/${path}`
  const pathComponent = `${pathComponentBase}/${file}`

  exec(`mkdir ${pathComponentBase}`, () => {
    writeFileSync(pathComponent, componentCode)
    exec(`npx eslint ${pathComponent} --fix`)
  })

  exports.push(`export { default as Vis${component.name} } from './${path}/${file}'`)

  // eslint-disable-next-line no-console
  console.log(`${component.name} generated`)
  // eslint-disable-next-line no-console
  console.log(`  ${pathComponent}`)
}

writeFileSync('src/components.ts', exports.join('\n'))
