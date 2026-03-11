# NEMTQ - 在线题库系统

NEMTQ 是一个基于 Node.js + Express + Vue 3 的全栈在线题库系统，支持选择题、填空题、解答题等多种题型，具备 LaTeX 公式渲染、图片上传、即时判题、作答历史保存等功能。

## 功能特性

### 题目管理
- 支持多种题型：单选题、多选题、多空单选题、填空题、解答题
- 题目支持 LaTeX 数学公式渲染
- 题目图片上传与管理
- 解析图片独立管理

### 作答功能
- 即时判题模式，提交后立即显示答案和解析
- 作答历史版本保存
- 题目收藏功能
- 答题进度追踪

### 用户系统
- 用户注册与登录
- 基于 Session 的身份认证
- 用户设置管理（即时判题开关等）

### 学习路径
- 按科目、章节、小节组织题目
- 题目编号系统
- 学习进度可视化

## 技术栈

### 后端
- **Node.js** + **Express** - Web 框架
- **MySQL** + **mysql2** - 数据库（包括 Session 存储）
- **MathJax** - LaTeX 公式渲染支持
- **Multer** - 文件上传

### 前端
- **Vue 3** + **Composition API** - 前端框架
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端
- **Vite** - 构建工具

## 项目结构

```
NEMTQ/
├── app.js                  # 应用入口
├── package.json            # 后端依赖
├── config/                 # 配置文件
│   └── mysql2/
│       └── connectionPool.js
├── controller/             # 控制器
│   ├── controller.js
│   ├── titleController.js
│   └── userSettingController.js
├── dto/                    # 数据传输对象
│   ├── FavoriteTitleDto.js
│   ├── ImageDto.js
│   ├── QuestionDto.js
│   ├── TitleDto.js
│   ├── UserDto.js
│   └── UserSettingDto.js
├── middleware/             # 中间件
│   ├── auth.js
│   ├── session.js
│   └── upload.js
├── route/                  # 路由
│   └── route.js
├── service/                # 业务逻辑层
│   └── m2/
│       ├── imageService.js
│       ├── questionService.js
│       ├── studyPathService.js
│       ├── userService.js
│       └── userSettingService.js
├── public/                 # 静态资源
│   └── assets/
│       └── img/           # 上传的图片
└── vue/                    # 前端项目
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        ├── App.vue
        ├── views/         # 页面视图
        ├── components/    # 组件
        ├── utils/         # 工具函数
        └── router/        # 路由配置
```

## 安装与运行

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 5.7

### 后端安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息

# 启动开发服务器
npm run dev
```

### 前端安装

```bash
cd vue

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境部署

```bash
# 构建前端
cd vue
npm run build

# 启动后端服务（会同时服务前端静态文件）
cd ..
node app.js
```

## 环境变量配置

创建 `.env` 文件，配置以下变量：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nemtq

# Session 密钥
SESSION_SECRET=your_session_secret

# 服务器配置
PORT=3000
NODE_ENV=development
```

## 数据库设计

### 核心表结构

- **users** - 用户表
- **titles** - 题目表
- **subjects** - 科目表
- **chapters** - 章节表
- **sections** - 小节表
- **useranswers** - 用户作答记录
- **favorites** - 收藏记录
- **images** - 图片资源表

## API 接口

### 用户相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `POST /api/logout` - 用户登出
- `GET /api/user` - 获取当前用户信息

### 题目相关
- `GET /api/titles` - 获取题目列表
- `GET /api/title/:id` - 获取题目详情
- `POST /api/submit` - 提交答案
- `POST /api/saveHistory` - 保存作答历史

### 图片相关
- `POST /api/uploadImage` - 上传图片
- `GET /api/images/:titleId` - 获取题目图片

## 题目数据结构

### 选择题 (Choice)
```json
{
  "id": "string",
  "type": "choice",
  "title": "题目内容",
  "blankType": "single|singlemultiple|multiplesingle",
  "optionType": "shared|individual",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "individual": [["选项1"], ["选项2"]],
  "rightOption": [[0], [1]],
  "explanation": "解析内容"
}
```

### 填空题 (Fill)
```json
{
  "id": "string",
  "type": "fill",
  "title": "题目内容",
  "fill": ["答案1", "答案2"],
  "explanation": "解析内容"
}
```

### 解答题 (Answer)
```json
{
  "id": "string",
  "type": "answer",
  "title": "题目内容",
  "answer": "参考答案",
  "explanation": "解析内容"
}
```

## 开发规范

### 代码风格
- 遵循 Vue 3 组合式 API 风格指南
- 后端使用 async/await 处理异步

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关


## 许可证

[CC BY-NC-SA 4.0](LICENSE)

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。
