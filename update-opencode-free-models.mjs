#!/usr/bin/env node
// update-opencode-free-models.mjs
// Fetch OpenRouter free models via API and update opencode.json provider models.

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(process.env.HOME, ".config/opencode/opencode.json");

async function fetchModels() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()).data;
}

function filterFree(models) {
    return models
      .filter(
        (m) =>
          m.pricing?.prompt === "0" &&
          m.pricing?.completion === "0" &&
          !!m.id &&
          hasSufficientParams(m.name) && // 过滤掉参数大小小于 40B 的模型
          isModelActive(m) && // 未过期
          hasRequiredFeatures(m) && // 支持 tools
          hasMinContext(m) && // 上下文 >= 128K
          hasMinOutputTokens(m) // 输出上限 >= 32K
      )
      .map((m) => ({ id: m.id, name: m.name, context_length: m.context_length }));
  }

  // 从模型名称中提取参数大小（例如 "7B", "13B", "30B" 等）
  // 返回 true 如果参数大小大于等于 30B，否则 false
  function hasSufficientParams(modelName) {
    const paramRegex = /\b(\d+)B\b/i;
    const match = modelName.match(paramRegex);
    if (!match) {
      // 如果没有找到参数大小，默认保留（因为可能是没有指定参数大小的模型）
      return true;
    }
    const paramValue = parseInt(match[1], 10);
    return paramValue >= 40;
  }

  // 检查模型是否过期
  function isModelActive(model) {
    return model.expiration_date === null;
  }

  // 检查模型是否健康（通过 top_provider 的 is_moderated 字段）
  function isModelHealthy(model) {
    return model.top_provider?.is_moderated === true;
  }

// 检查模型性能指标
function hasGoodPerformance(model) {
  const provider = model.top_provider || {};
  return (
    provider.latency !== undefined &&
    provider.latency < 5 && // 延迟小于 5 秒
    provider.throughput !== undefined &&
    provider.throughput > 500 // 吞吐量大于 500 tokens/秒
  );
}

// 检查模型是否支持所需功能
function hasRequiredFeatures(model, requiredFeatures = ['tools']) {
  const supported = new Set(model.supported_parameters || []);
  return requiredFeatures.every(feature => supported.has(feature));
}

// 检查上下文长度 >= 128K
function hasMinContext(model) {
  return model.context_length >= 131072;
}

// 检查最大输出 tokens >= 32K（null 表示不限，通过）
function hasMinOutputTokens(model) {
  const maxCt = model.top_provider?.max_completion_tokens;
  if (maxCt === null || maxCt === undefined) return true;
  return maxCt >= 32000;
}

;(async () => {
  console.log("Fetching models from OpenRouter...");
  const all = await fetchModels();
  console.log(`Total models: ${all.length}`);

  const free = filterFree(all);
  console.log(`Free models: ${free.length}\n`);

  for (const m of free) {
    const hasTag = m.id.endsWith(":free");
    console.log(
      `${hasTag ? "✓" : "–"} ${m.id}${m.name !== m.id ? ` (${m.name})` : ""}`,
    );
  }

  // Build models object for the custom provider
  const models = {};
  for (const m of free) {
    models[m.id] = { name: m.name };
  }

  let config;
  try {
    config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    config = {};
  }

  // Ensure provider.my-openrouter exists
  config.provider = config.provider || {};
  config.provider["my-openrouter"] = config.provider["my-openrouter"] || {
    npm: "@ai-sdk/openai-compatible",
    name: "My OpenRouter",
    options: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: "{env:OPENROUTER_API_KEY}",
    },
    models: {},
  };

  const oldModels = Object.keys(config.provider["my-openrouter"].models || {});
  const newModelIds = Object.keys(models);
  const diffNew = newModelIds.filter((id) => !oldModels.includes(id));
  const diffRemoved = oldModels.filter((id) => !newModelIds.includes(id));

  if (diffNew.length) console.log(`\nNew models to add: ${diffNew.length}`);
  if (diffRemoved.length) {
    console.log(`\nModels removed (deprecated): ${diffRemoved.length}`);
    for (const r of diffRemoved) console.log(`  - ${r}`);
  }

  config.provider["my-openrouter"].models = models;
  // Also ensure the built-in OpenRouter stays disabled
  config.disabled_providers = ["openrouter"];

  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf-8");
  console.log(`\n✓ Updated ${CONFIG_PATH} with ${newModelIds.length} free models.`);
})();
