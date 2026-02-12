# 📥 题库数据录入操作指南

> **核心原则**：AI 是**书记员**，不是**编辑**。内容必须逐字转录，结构必须严格映射。

---

## 一、你需要提供的输入（缺一不可）

1. **题目图片**  
   - 包含：题号、题干、选项（A/B/C/D）、答案标识（如 "答案：C"）
2. **解析图片**  
   - 与题目一一对应，包含完整解析文本
3. **表结构 ** 
   
   ```sql
   CREATE TABLE IF NOT EXISTS `question` (
     `id` varchar(50) NOT NULL DEFAULT '0',
     `type` enum('choice','fill','answer') NOT NULL,
     `title` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
     `option_type` enum('shared','individual') NOT NULL,
     `shared_options` json DEFAULT NULL,
     `individual_options` json DEFAULT NULL,
     `right_option` json NOT NULL,
     `explanation` varchar(1200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
     `subject_id` int NOT NULL,
     `chapter_id` int NOT NULL,
     `section_id` int NOT NULL,
     `serial` int NOT NULL DEFAULT (-(1)) COMMENT '题序，从1开始',
     PRIMARY KEY (`id`),
     KEY `FK_question_chapter` (`chapter_id`),
     KEY `FK_question_section` (`section_id`),
     KEY `idx_question_subject_chapter_section` (`subject_id`,`chapter_id`,`section_id`),
     CONSTRAINT `FK_question_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`id`),
     CONSTRAINT `FK_question_section` FOREIGN KEY (`section_id`) REFERENCES `section` (`id`),
     CONSTRAINT `FK_question_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
   
   ```
   
4. **元数据指令**（必须提供）  
   - `subject_id = X, chapter_id = Y, section_id = Z`
5. **ID值**（必须提供）  
   - 小写十六进制字符串

> ⚠️ **重要提示**：
> - **若未提供 `subject_id`, `chapter_id`, `section_id`，则不生成任何 INSERT 语句**。
> - **若未提供 ID 值，则不生成任何 INSERT 语句**。
> - **题目中的示意图、流程图、代码块、复杂表格等视觉元素，请勿尝试识别或转录**。我会自行处理这些部分并替换为图片引用。
> - **`useranswer` 表不需要生成**，因为它是动态生产的；**除非你明确要求**（如"附带模拟答题记录"）。
> - **题干中出现的 I / II / III 等是判断陈述（属于 `title` 的一部分），不是选项。真正的选项是 A/B/C/D 的组合选择。每个子项（I、II、III）后必须保留换行符 `\n`**。
> - **如果一道题的解析中有另解内容也要原封不动的抄写**

---

## 二、AI 处理规则

### ▶ LaTeX 转义规则（关键！）

| 字段类型                                                     | LaTeX 转义要求                     | 示例                                  |
| ------------------------------------------------------------ | ---------------------------------- | ------------------------------------- |
| **`JSON` 类型字段**<br>（如 `shared_options`, `individual_options`, `right_option`） | **必须双重转义**：<br>`\` → `\\\\` | `"\\lfloor"` → `"\\\\lfloor"`         |
| **非 `JSON` 类型字段**<br>（如 `VARCHAR`, `TEXT` 的 `title`, `explanation`） | **无需转义**：<br>保留原始 `\`     | `"高度为 $\lfloor \log_2 n \rfloor$"` |

> ✅ **特别说明**：
> - 你的 `explanation` 字段是 `VARCHAR`，**LaTeX 公式中的 `\` 不需要任何转义**。
> - 只有在 `JSON` 类型字段中才需要 `\\\\`。
> - LaTeX 公式必须用 `$...$` 包围
> - 即使内容是 LaTeX 公式（如 $\text{mid}$），只要它出现在 JSON 字段中，就必须对其中的每个 \ 进行双重转义。

### ▶ 内容转录

- **题干（title）**：
  - **I / II / III 等是题干的一部分**，不是选项
  - **每个子项（I、II、III）后必须添加换行符 `\n`**
- **选项（A/B/C/D）**：
  - 是对 I/II/III 的**组合选择**
  - 存入 `shared_options` 或 `individual_options`（**JSON 类型，需双重转义**）
  - 如果选项是图片，那么shared_options = '["", "", "", ""]'，即每个选项是空字符串
- **忽略所有非文字元素**：示意图、流程图、代码块、复杂表格等**一律跳过**

### ▶ 答案与选项类型

- **答案转换**：
  - `"答案：B"` → `right_option = [[1]]`（**JSON 类型，需双重转义**）
- **选项类型**：
  - 题干含多个独立填空 → `option_type = 'individual'`
  - 否则 → `option_type = 'shared'`

### ▶ 其他字段

- **`serial`**：按题目顺序显式赋值 `1, 2, 3, ...`
- **`type`**：固定为 `'choice'`

---

## 三、真实案例（混合字段类型）

### 案例：完全二叉树性质题

#### 题目图片内容

> **题干**:  
> 关于完全二叉树的性质，下列说法正确的是（ ）。  
> I. 度为 2 的有序树就是二叉树  
> II. 含有 $n$ 个结点的二叉树的高度为 $\lfloor \log_2 n \rfloor + 1$  
> III. 在完全二叉树中，若一个结点没有左孩子，则它必是叶结点  
>
> **选项**:  
> A. 仅I  
> B. 仅II  
> C. 仅III  
> D. I和III  
>
> **答案**: C

#### 解析图片内容

> 在完全二叉树中，若有度为 1 的结点，则只可能有一个，且该结点只有左孩子而无右孩子，选项 C 正确。完全二叉树的高度为 $\lfloor \log_2 (n+1) \rfloor$ 或 $\lfloor \log_2 n \rfloor + 1$。

#### 生成的 SQL（单块，正确转义）

```sql
INSERT INTO question (
  id, type, title, option_type,
  shared_options, individual_options, right_option, explanation,
  subject_id, chapter_id, section_id, serial
) VALUES
('6976d8c0a1b2c3d4e5f6a7b8', 'choice',
 '关于完全二叉树的性质，下列说法正确的是（ ）。\nI. 度为 2 的有序树就是二叉树\nII. 含有 $n$ 个结点的二叉树的高度为 $\lfloor \log_2 n \rfloor + 1$\nIII. 在完全二叉树中，若一个结点没有左孩子，则它必是叶结点\n',
 'shared',
 '["仅I", "仅II", "仅III", "I和III"]',
 '[]',
 '[[2]]',
 '在完全二叉树中，若有度为 1 的结点，则只可能有一个，且该结点只有左孩子而无右孩子，选项 C 正确。完全二叉树的高度为 $\lfloor \log_2 (n+1) \rfloor$ 或 $\lfloor \log_2 n \rfloor + 1$。',
 2, 9, 30, 1);
```

> ✅ 关键点：
> - `title` 和 `explanation`（`VARCHAR`）：**LaTeX 无转义**（`\lfloor`），并且其中开头不能有题序，因为在serial字段存储了。
> - `shared_options` 和 `right_option`（`JSON`）：**无 LaTeX，无需转义**
> - 若 `shared_options` 含 LaTeX（如 `["$\\lfloor ...$"]`），则需写为 `["$\\\\lfloor ...$"]`
> - **ID 由您提供**，此处为示例值

---