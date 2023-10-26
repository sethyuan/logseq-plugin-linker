import "@logseq/libs"
import type { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"
import { setup, t } from "logseq-l10n"
import { hasScheme, isElement } from "./libs/utils"
import zhCN from "./translations/zh-CN.json"

const RULE_NUM = 20

let mappings: [string, string][]

async function main() {
  await setup({ builtinTranslations: { "zh-CN": zhCN } })

  logseq.useSettingsSchema(generateSettings())

  const settingsOff = logseq.onSettingsChanged(reloadUserRules)

  const appContainer = parent.document.getElementById("app-container")!
  const observer = new MutationObserver(onDOMChanged)
  observer.observe(appContainer, {
    childList: true,
    subtree: true,
  })

  logseq.beforeunload(async () => {
    observer.disconnect()
    settingsOff()
  })

  console.log("#linker loaded")
}

function generateSettings() {
  const schema: SettingSchemaDesc[] = []
  for (let i = 1; i <= RULE_NUM; i++) {
    schema.push(
      {
        key: `g${i}`,
        type: "heading",
        title: t("Rule ${i}", { i: `${i}` }),
        description: "",
        default: null,
      },
      {
        key: `prefix${i}`,
        title: "",
        type: "string",
        default: "",
        description: t("Prefix of the resource path to replace."),
      },
      {
        key: `replaceWith${i}`,
        title: "",
        type: "string",
        default: "",
        description: t("Replace the prefix with this value."),
      },
    )
  }
  return schema
}

function reloadUserRules() {
  const settings: Record<string, any> = logseq.settings ?? {}
  const rules: [string, string][] = []
  for (let i = 0; i < RULE_NUM; i++) {
    let prefix = settings[`prefix${i + 1}`]?.toLowerCase()
    if (!hasScheme(prefix)) {
      prefix = `file://${prefix}`
    }
    const replaceWith = settings[`replaceWith${i + 1}`]
    if (prefix && replaceWith) {
      rules.push([prefix, replaceWith])
    }
  }
  rules.sort(([prefixA], [prefixB]) => prefixB.length - prefixA.length)
  mappings = rules
}

const onDOMChanged: MutationCallback = (mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (isElement(node)) {
        const mediaEls = node.querySelectorAll(
          "img,audio,video",
        ) as NodeListOf<HTMLMediaElement>
        const images = node.querySelectorAll(
          "img",
        ) as NodeListOf<HTMLImageElement>
        const links = node.querySelectorAll(
          "a[href]",
        ) as NodeListOf<HTMLLinkElement>

        for (const mediaEl of mediaEls) {
          for (const [prefix, replaceWith] of mappings) {
            const src = mediaEl
              .getAttribute("src")
              ?.toLowerCase()
              .replace(/^(journals|pages)\//, "")
            if (src?.startsWith(prefix)) {
              mediaEl.src = `${replaceWith}${src.substring(prefix.length)}`
            }
          }
        }
        for (const link of links) {
          for (const [prefix, replaceWith] of mappings) {
            if (link.href.toLowerCase().startsWith(prefix)) {
              link.href = `${replaceWith}${link.href.substring(prefix.length)}`
            }
          }
        }
      }
    }
  }
}

logseq.ready(main).catch(console.error)
