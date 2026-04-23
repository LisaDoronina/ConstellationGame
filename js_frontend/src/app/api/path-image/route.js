import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { spawn } from "child_process"

const repoRoot = process.cwd().replace(/js_frontend[\\/]src$/, "")
const builderScript = path.join(repoRoot, "services", "src", "path_builder.py")
const namesMappingPath = path.join(repoRoot, "services", "cpp_core", "data", "names.json")
let fullToShortNameMapPromise

async function getFullToShortNameMap() {
  if (!fullToShortNameMapPromise) {
    fullToShortNameMapPromise = fs.readFile(namesMappingPath, "utf-8").then((contents) => {
      const shortToFull = JSON.parse(contents)
      return Object.fromEntries(
        Object.entries(shortToFull).map(([shortName, fullName]) => [
          String(fullName).trim().toUpperCase(),
          String(shortName).trim().toUpperCase(),
        ])
      )
    })
  }

  return fullToShortNameMapPromise
}

async function normalizePathItems(pathItems) {
  const fullToShortNameMap = await getFullToShortNameMap()

  return pathItems.map((item) => {
    const normalizedItem = String(item).trim()
    if (!normalizedItem) {
      return normalizedItem
    }

    const uppercaseItem = normalizedItem.toUpperCase()
    return fullToShortNameMap[uppercaseItem] || uppercaseItem
  })
}

function runPython(command, args, label = command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""

    child.on("error", reject)
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString()
      stdout += text
      process.stdout.write(`[path-image][${label}] ${text}`)
    })
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString()
      stderr += text
      process.stderr.write(`[path-image][${label}] ${text}`)
    })
    child.on("close", (code) => {
      if (code === 0) {
        console.log(`[path-image] ${label} exited successfully`)
        resolve()
        return
      }

      const message = stderr.trim() || stdout.trim() || `Python exited with code ${code}`
      reject(new Error(message))
    })
  })
}

async function normalizeTarget(target) {
  if (!target) return null
  const fullToShortNameMap = await getFullToShortNameMap()
  const upper = String(target).trim().toUpperCase()
  return fullToShortNameMap[upper] || upper
}

async function generateImage(pathItems, outputPath, target) {
  const normalizedPathItems = await normalizePathItems(pathItems)
  const normalizedTarget = await normalizeTarget(target)
  const payload = JSON.stringify(normalizedPathItems)
  const targetArgs = normalizedTarget ? ["--target", normalizedTarget] : []
  const errors = []
  const candidates = [
    { command: "py", args: ["-3.13", builderScript, "--path-json", payload, "--output", outputPath, ...targetArgs], label: "py -3.13" },
    { command: "py", args: ["-3", builderScript, "--path-json", payload, "--output", outputPath, ...targetArgs], label: "py -3" },
    { command: "python", args: [builderScript, "--path-json", payload, "--output", outputPath, ...targetArgs], label: "python" },
    { command: "py", args: [builderScript, "--path-json", payload, "--output", outputPath, ...targetArgs], label: "py" },
  ]

  console.log("[path-image] raw path items:", pathItems)
  console.log("[path-image] normalized path items:", normalizedPathItems)
  console.log("[path-image] output path:", outputPath)

  for (const candidate of candidates) {
    try {
      console.log(`[path-image] trying interpreter: ${candidate.label}`)
      await runPython(candidate.command, candidate.args, candidate.label)
      return
    } catch (error) {
      console.error(`[path-image] ${candidate.label} failed: ${error.message}`)
      errors.push(`${candidate.label}: ${error.message}`)
    }
  }

  throw new Error(errors.join(" | "))
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rawPath = searchParams.get("path")
  const target = searchParams.get("target")
  console.log("[path-image] request url:", request.url)
  console.log("[path-image] raw query path:", rawPath)
  console.log("[path-image] target:", target)

  if (!rawPath) {
    console.error("[path-image] missing path query parameter")
    return new Response("Missing path", { status: 400 })
  }

  let pathItems
  try {
    pathItems = JSON.parse(rawPath)
    console.log("[path-image] parsed path items:", pathItems)
  } catch {
    console.error("[path-image] invalid path payload:", rawPath)
    return new Response("Invalid path payload", { status: 400 })
  }

  const outputPath = path.join(os.tmpdir(), `constellation-path-${Date.now()}.png`)

  try {
    await generateImage(pathItems, outputPath, target)
    const image = await fs.readFile(outputPath)
    console.log("[path-image] image generated successfully")
    await fs.unlink(outputPath).catch(() => {})

    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[path-image] failed to generate image:", error.message)
    await fs.unlink(outputPath).catch(() => {})
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 })
  }
}
