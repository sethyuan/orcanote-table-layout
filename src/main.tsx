import { setupL10N, t } from "./libs/l10n";
import zhCN from "./translations/zhCN";

const { MenuText, Menu } = orca.components;

let pluginName: string;

export async function load(_name: string) {
  pluginName = _name;

  setupL10N(orca.state.locale, { "zh-CN": zhCN });

  if (orca.state.commands[`${pluginName}.multi-col`] == null) {
    orca.commands.registerEditorCommand(
      `${pluginName}.multi-col`,
      setMultiCol,
      () => {},
      { label: t("Set Multi-column") },
    );
  }
  if (orca.state.commands[`${pluginName}.series`] == null) {
    orca.commands.registerEditorCommand(
      `${pluginName}.series`,
      setSeries,
      () => {},
      { label: t("Set Series") },
    );
  }
  if (orca.state.commands[`${pluginName}.none`] == null) {
    orca.commands.registerEditorCommand(
      `${pluginName}.none`,
      clearLayout,
      () => {},
      { label: t("Clear Layout") },
    );
  }
  if (orca.state.blockMenuCommands[`${pluginName}.menu`] == null) {
    orca.blockMenuCommands.registerBlockMenuCommand(`${pluginName}.menu`, {
      worksOnMultipleBlocks: false,
      render: (blockId, _rootBlockId, close) => {
        const block = orca.state.blocks[blockId];
        if (!block) return null;

        const repr = block.properties.find((p) => p.name === "_repr")?.value;
        if (repr?.type !== "table2") return null;

        return (
          <MenuText preIcon="ti ti-layout-dashboard" title={t("Table Layout")}>
            <Menu>
              <MenuText
                title={t("Multi-column")}
                onClick={async () => {
                  await orca.commands.invokeEditorCommand(
                    `${pluginName}.multi-col`,
                    null,
                    blockId,
                  );
                  close();
                }}
              />
              <MenuText
                title={t("Series")}
                onClick={async () => {
                  await orca.commands.invokeEditorCommand(
                    `${pluginName}.series`,
                    null,
                    blockId,
                  );
                  close();
                }}
              />
              <MenuText
                title={t("None")}
                onClick={async () => {
                  await orca.commands.invokeEditorCommand(
                    `${pluginName}.none`,
                    null,
                    blockId,
                  );
                  close();
                }}
              />
            </Menu>
          </MenuText>
        );
      },
    });
  }

  orca.themes.injectCSSResource(`${pluginName}/dist/layouts.css`, pluginName);

  console.log(`${pluginName} loaded.`);
}

export async function unload() {
  orca.commands.unregisterEditorCommand(`${pluginName}.multi-col`);
  orca.commands.unregisterEditorCommand(`${pluginName}.series`);
  orca.commands.unregisterEditorCommand(`${pluginName}.none`);
  orca.blockMenuCommands.unregisterBlockMenuCommand(`${pluginName}.menu`);
  orca.themes.removeCSSResources(pluginName);
  console.log(`${pluginName} unloaded.`);
}

function getBlockAttr(blockId: number) {
  const block = orca.state.blocks[blockId];
  const attrProp = block?.properties.find((p) => p.name === "_attr");
  return attrProp?.value || {};
}

async function setMultiCol(_editor: any, blockId: number) {
  const attr = { ...getBlockAttr(blockId), "multi-col": 1 };
  await orca.commands.invokeEditorCommand(
    "core.editor.setProperties",
    null,
    [blockId],
    [{ name: "_attr", value: attr, type: 0 }],
  );
  return null;
}

async function setSeries(_editor: any, blockId: number) {
  const attr = { ...getBlockAttr(blockId), serie: 1 };
  await orca.commands.invokeEditorCommand(
    "core.editor.setProperties",
    null,
    [blockId],
    [{ name: "_attr", value: attr, type: 0 }],
  );
  return null;
}

async function clearLayout(_editor: any, blockId: number) {
  const attr = { ...getBlockAttr(blockId) };
  delete attr["multi-col"];
  delete attr["serie"];

  if (Object.keys(attr).length === 0) {
    await orca.commands.invokeEditorCommand(
      "core.editor.deleteProperties",
      null,
      [blockId],
      ["_attr"],
    );
  } else {
    await orca.commands.invokeEditorCommand(
      "core.editor.setProperties",
      null,
      [blockId],
      [{ name: "_attr", value: attr, type: 0 }],
    );
  }
  return null;
}
