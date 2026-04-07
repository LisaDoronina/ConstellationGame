import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { spawn } from "child_process"

const repoRoot = process.cwd().replace(/js_frontend[\\/]src$/, "")
const builderScript = path.join(repoRoot, "services", "src", "path_builder.py")

function runPython(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore" })

    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Python exited with code ${code}`))
    })
  })
}

async function generateImage(pathItems, outputPath) {
  const payload = JSON.stringify(pathItems)
  const args = [builderScript, "--path-json", payload, "--output", outputPath]

  try {
    await runPython("python", args)
  } catch {
    await runPython("py", args)
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rawPath = searchParams.get("path")

  if (!rawPath) {
    return new Response("Missing path", { status: 400 })
  }

  let pathItems
  try {
    pathItems = JSON.parse(rawPath)
  } catch {
    return new Response("Invalid path payload", { status: 400 })
  }

  const outputPath = path.join(os.tmpdir(), `constellation-path-${Date.now()}.png`)

  try {
    await generateImage(pathItems, outputPath)
    const image = await fs.readFile(outputPath)
    await fs.unlink(outputPath).catch(() => {})

    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    await fs.unlink(outputPath).catch(() => {})
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 })
  }
}
