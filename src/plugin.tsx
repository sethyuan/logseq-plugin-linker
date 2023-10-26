import "@logseq/libs"
import { setup, t } from "logseq-l10n"
import zhCN from "./translations/zh-CN.json"

async function main() {
  await setup({ builtinTranslations: { "zh-CN": zhCN } })

  logseq.Editor.registerSlashCommand("Insert external resource", async () =>
    insertExternalResource(),
  )

  logseq.useSettingsSchema([
    {
      key: "timestampShortcut",
      title: "",
      type: "string",
      default: "",
      description: t(
        'Assign a shortcut for inserting a timestamp, e.g. "mod+shift+m".',
      ),
    },
  ])

  logseq.beforeunload(async () => {})

  console.log("#linker loaded")
}

function insertExternalResource() {
  // TODO
}

logseq.ready(main).catch(console.error)
