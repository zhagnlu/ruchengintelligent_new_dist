# 翻译系统使用说明 (Translation System Guide)

## 概述

本项目采用**JSON预翻译字典**作为主要翻译方案,大幅减少对外部API的依赖,实现:
- ✅ **零API调用** - 对于已有翻译的内容
- ✅ **即时翻译** - 无需等待网络请求
- ✅ **离线可用** - 字典文件本地加载
- ✅ **API Fallback** - 未翻译内容自动调用API

## 文件结构

```
locales/
├── zh.json     # 中文翻译字典
├── es.json     # 西班牙语翻译字典
├── fr.json     # 法语翻译字典
├── de.json     # 德语翻译字典
├── ja.json     # 日语翻译字典
└── README.md   # 本文件
```

## 使用方法

### 1. 基本配置

在HTML页面中初始化translator时,默认已启用JSON字典:

```javascript
const translator = new Translator({
  defaultLang: 'en',
  batchSize: 3,
  delay: 100,
  elements: '[data-translate]',
  useJsonDictionary: true,      // 启用JSON字典(默认true)
  dictionaryPath: '/locales'     // 字典文件路径(默认'/locales')
});
```

### 2. 添加可翻译内容

在HTML元素上添加 `data-translate` 属性:

```html
<h1 data-translate>Featured Products</h1>
<p data-translate>Welcome to Rucheng Technology</p>
```

### 3. 添加新的翻译

当需要添加新内容的翻译时,编辑对应语言的JSON文件:

**中文 (locales/zh.json)**
```json
{
  "Featured Products": "精选产品",
  "Welcome to Rucheng Technology": "欢迎来到如程科技"
}
```

**西班牙语 (locales/es.json)**
```json
{
  "Featured Products": "Productos Destacados",
  "Welcome to Rucheng Technology": "Bienvenido a Rucheng Technology"
}
```

## 工作原理

### 翻译优先级

1. **JSON字典** (最高优先级)
   - 从本地JSON文件加载预设翻译
   - 即时返回,无网络延迟

2. **API Fallback** (备用方案)
   - 如果字典中没有对应翻译
   - 自动调用外部翻译API
   - 支持LibreTranslate, MyMemory, Yandex

3. **缓存机制**
   - API翻译结果自动缓存到localStorage
   - 下次访问时直接使用缓存

### 性能优势

对于首页的 **~80个**可翻译元素:

| 方案 | API调用次数 | 加载时间 |
|------|------------|---------|
| 纯API方案 | 80次 | ~10-15秒 |
| **JSON字典方案** | **0次** | **<1秒** |

## 调试工具

### 查看翻译统计

在浏览器控制台中:

```javascript
// 查看详细统计
translator.printTranslationStats();

// 输出示例:
// [Translator] Translation Statistics:
//   JSON Dictionary: Enabled
//   Dictionary entries:
//     zh: 68 entries
//     es: 68 entries
//     fr: 68 entries
//     de: 68 entries
//     ja: 68 entries
//   Cache size: 0
//   Pending: 0
//   Progress: 0/0
```

### 监控翻译过程

打开浏览器控制台,切换语言时会看到:

```
[Translator] Loading JSON dictionaries...
[Translator] Loaded zh dictionary: 68 entries
[Translator] Loaded es dictionary: 68 entries
...
[Translator] Found in dictionary: "Featured Products" -> "精选产品"
[Translator] Found in dictionary: "Press Brake" -> "折弯机"
```

如果某个文本未在字典中:
```
[Translator] Not in dictionary, using API fallback for: "New Product"
```

## 维护指南

### 添加新语言

1. 创建新的JSON文件 `locales/新语言代码.json`
2. 在 `translator.js` 的 `loadDictionaries()` 方法中添加语言代码
3. 在 `createLanguageSelector()` 中添加语言选项

### 批量更新翻译

可以使用脚本批量提取页面中的所有 `data-translate` 内容:

```bash
# 提取所有需要翻译的文本
grep -r 'data-translate' *.html | grep -o '>[^<]*<' | sort -u
```

### 验证JSON格式

确保JSON文件格式正确:

```bash
# 验证JSON格式
node -e "console.log(JSON.parse(require('fs').readFileSync('locales/zh.json')))"
```

## 最佳实践

1. **保持键值一致** - 所有语言的JSON文件应该有相同的英文键
2. **使用完整句子** - 避免翻译片段,使用完整的文本作为键
3. **定期更新** - 添加新内容时,同时更新所有语言的字典
4. **保留原格式** - 保持HTML标签、标点符号的一致性

## 常见问题

**Q: 为什么有些内容没有翻译?**
A: 检查JSON字典中是否有对应的键值,确保文本完全匹配(包括空格、标点)。

**Q: 如何禁用JSON字典,只使用API?**
A: 在初始化时设置 `useJsonDictionary: false`

**Q: 翻译文件太大怎么办?**
A: 可以按页面拆分字典文件,在不同页面加载不同的字典。

**Q: 如何处理动态生成的内容?**
A: 动态内容会自动fallback到API翻译,然后缓存到localStorage。

## 技术支持

如有问题,请查看浏览器控制台的日志信息,或联系开发团队。
