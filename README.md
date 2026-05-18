# OpenCode Free Models Fetcher

从 OpenRouter API 获取免费模型并过滤，更新 OpenCode 配置。

## 目的

此脚本从 OpenRouter API 获取免费模型列表，根据质量标准过滤，然后更新 OpenCode 配置文件中的模型。

## 功能

- 过滤 **prompt** 和 **completion** 价格为 "0"（免费）的模型
- 过滤参数大小 **≥ 40B**（高质量模型）
- 过滤支持 **tools** 参数的模型（支持工具调用）
- 过滤上下文长度 **≥ 128K**（长上下文）
- 过滤最大输出 tokens **≥ 32K**（较长输出）
- 过滤 **active** 模型（未过期）

## 用法

直接运行脚本：

```bash
node update-opencode-free-models.mjs
```

脚本会：
1. 从 OpenRouter API 获取所有模型
2. 应用过滤条件
3. 更新 `/Users/linnahan/.config/opencode/opencode.json` 中的模型

## 要求

- Node.js (v18+)
- OpenCode 已安装

## 说明

此脚本旨在保持 OpenCode 配置与 OpenRouter 上最佳免费模型同步。

---

# OpenCode Free Models Fetcher

Fetch and filter OpenRouter free models for OpenCode.

## Purpose

This script fetches the list of free models from OpenRouter API and filters them based on quality criteria, then updates the OpenCode configuration file with the filtered models.

## Features

- Filters models with **prompt** and **completion** pricing set to "0" (free)
- Filters models with **parameter size >= 40B** (for high-quality models)
- Filters models that support **tools** parameter (for tool calling)
- Filters models with **context length >= 128K** (for long context)
- Filters models with **max completion tokens >= 32K** (for longer outputs)
- Filters models that are **active** (not expired)

## Usage

Run the script directly:

```bash
node update-opencode-free-models.mjs
```

The script will:
1. Fetch all models from OpenRouter API
2. Apply filters
3. Update `/Users/linnahan/.config/opencode/opencode.json` with the filtered models

## Requirements

- Node.js (v18+)
- OpenCode installed

## Notes

This script is designed to keep your OpenCode configuration up-to-date with the best free models available on OpenRouter.

