# Seer Development Assistant

Seer Development Assistant (SDA) 是网页版 **Seer 封包分析小助手**。集合了软件版 **Seer 封包分析小助手** 和 **发包转字节集参数** 全部功能，同时针对痛点进行了优化改进。

## 功能介绍

### 分析页面

十六进制封包分析与差异对比工具，支持：

- **多封包输入**：支持同时输入多个收包和1个发包
- **自动解析**：自动解析封包头部信息
  - 封包长度 (显示最长值)
  - 版本号 (2位十六进制)
  - 命令号 (8位十六进制)
  - 米米号 (8位十六进制)
  - 序列号 (发包优先，否则显示最后填写的收包)
  - 参数数量 (仅计算收包参数)
- **参数解析**：根据命令号自动识别参数分组（命令号 42023 使用2位分组，其他使用8位分组）
- **差异对比**：收包之间进行差异分析，高亮显示相异参数，发包高亮对应参数
- **二进制显示**：支持 46046、45866 收包的二进制分组显示
- **显示格式**：支持十六进制、十进制、二进制三种显示格式
- **导入导出**：支持导入 JSON 文件和导出分析结果
- **快捷键**：支持 `Ctrl+Enter` 快速分析
- **响应式布局**：适配移动端和桌面端
- **验证提示**：输入格式错误时显示详细错误信息

> 注意：发包不参与差异对比，仅作为参考显示

### 转换页面

发包文本与字节集参数互转工具，支持：

- **文本转参数**：将十六进制发包文本转换为字节集参数格式 `{commandId,param1,param2,...}`
- **参数转文本**：将字节集参数转换为十六进制发包文本
- **参数选择**：支持全选/取消全选单个参数，灵活选择需要转换的参数
- **特殊命令号**：针对特定命令号（如 46046、42399、42023、42033），参数1自动作为参数数量自动计算
- **自定义设置**：用户可自行管理特殊命令号列表，配置自动保存到本地

## 数据格式

### 封包结构

```
[封包长度 8位] [版本号 2位] [命令号 8位] [米米号 8位] [序列号 8位] [参数数据...]
```

封包头固定为 34 位（8+2+8+8+8），参数数量根据封包长度自动计算：`参数数量 = (封包长度 - 34) / 8`

> 42023收包参数数量计算：`参数数量 = (封包长度 - 34 - 8) / 2`

### 字节集参数格式

```
{commandId,param1,param2,param3,...}
```

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript
- Vite
- UnoCSS
- ESLint + Prettier

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 预览构建
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm prettier
```

## 项目结构

```
src/
├── components/           # Vue 组件
│   ├── AnalyzePage.vue   # 分析页面
│   ├── ConvertPage.vue   # 转换页面
│   ├── HexInput.vue      # 十六进制输入
│   ├── BinaryDisplay.vue # 二进制显示
│   ├── OutputArea.vue    # 输出区域
│   ├── DiffArea.vue      # 差异对比
│   ├── HeaderPanel.vue   # 头部信息
│   ├── ActionPanel.vue   # 操作面板
│   ├── StatusBar.vue     # 状态栏
│   ├── ParamSelector.vue # 参数选择器
│   ├── ConvertResult.vue # 转换结果
│   ├── FilePicker.vue    # 文件选择器
│   ├── Button.vue        # 按钮组件
│   ├── Checkbox.vue      # 复选框
│   ├── Input.vue        # 输入框组件
│   ├── RadioGroup.vue    # 单选组
│   ├── BaseModal.vue     # 基础模态框
│   ├── ValidationErrorModal.vue # 验证错误模态框
│   └── AlertModal.vue    # 警告模态框
├── composables/          # 组合式函数
│   ├── useAnalysis.ts    # 分析逻辑
│   ├── useConverter.ts   # 转换逻辑
│   ├── useHexParser.ts   # 十六进制解析
│   ├── usePacketData.ts  # 数据处理
│   ├── useKeyboard.ts    # 快捷键处理
│   └── useImportExport.ts # 导入导出
├── stores/               # Pinia 状态管理
│   ├── analysis.ts       # 分析状态
│   └── settings.ts       # 设置状态
├── utils/
│   └── hex.ts            # 十六进制工具函数
└── types/
    └── index.ts          # TypeScript 类型定义
```
