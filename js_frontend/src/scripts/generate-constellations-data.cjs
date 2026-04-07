const fs = require("fs")
const path = require("path")

const frontendRoot = path.resolve(__dirname, "..")
const repoRoot = path.resolve(frontendRoot, "..", "..")

const graphPath = path.join(repoRoot, "python_ml", "resources", "graph.py")
const namesPath = path.join(repoRoot, "services", "cpp_core", "data", "names.json")
const outputPath = path.join(frontendRoot, "app", "game", "constellations-data.js")

function parseAdjacency(source) {
  const adjacency = {}

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z]{3}|[A-Z][a-z][A-Z])\s*=\s*\[(.*)\]\s*$/)
    if (!match) continue

    const [, shortName, rawNeighbors] = match
    const neighbors = []
    const neighborPattern = /'([^']+)'/g
    let neighborMatch

    while ((neighborMatch = neighborPattern.exec(rawNeighbors)) !== null) {
      neighbors.push(neighborMatch[1].trim())
    }

    adjacency[shortName] = neighbors
  }

  return adjacency
}

function translateAdjacency(adjacency, names) {
  const translated = {}

  for (const [shortName, neighbors] of Object.entries(adjacency)) {
    const fullName = names[shortName]
    if (!fullName) {
      throw new Error(`Missing full name for ${shortName}`)
    }

    translated[fullName] = neighbors.map((neighbor) => {
      const fullNeighbor = names[neighbor]
      if (!fullNeighbor) {
        throw new Error(`Missing full name for neighbor ${neighbor}`)
      }

      return fullNeighbor
    })
  }

  return translated
}

const graphSource = fs.readFileSync(graphPath, "utf8")
const names = JSON.parse(fs.readFileSync(namesPath, "utf8"))
const adjacency = parseAdjacency(graphSource)
const translated = translateAdjacency(adjacency, names)

const output = `export const constellations = ${JSON.stringify(translated, null, 2)}

export const allConstellations = Object.keys(constellations)
`

fs.writeFileSync(outputPath, output, "utf8")
