# Vue重构方案

## 项目结构
```
vue/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── Login.vue
│   │   ├── TQ/
│   │   │   ├── TitleChoice.vue
│   │   │   ├── Explanation.vue
│   │   │   ├── QuestionTable.vue
│   │   │   ├── Panel.vue
│   │   │   └── AIConsultant.vue
│   │   ├── Modals/
│   │   │   ├── SwitchSubject.vue
│   │   │   ├── Setting.vue
│   │   │   ├── UploadPicture.vue
│   │   │   ├── AddFavorite.vue
│   │   │   └── EditTitle.vue
│   │   └── Common/
│   │       ├── Header.vue
│   │       ├── ResponseTip.vue
│   │       └── ModalCard.vue
│   ├── views/
│   │   ├── Home.vue
│   │   └── TQ.vue
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   └── index.js
│   ├── utils/
│   │   ├── api.js
│   │   └── helpers.js
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js
```

## 组件设计

### 1. 登录组件 (Login.vue)
- 功能：用户登录
- 表单验证
- 登录请求处理

### 2. 首页组件 (Home.vue)
- 功能：展示项目介绍和登录入口
- 响应式设计

### 3. 题目练习组件 (TQ.vue)
- 功能：主要答题页面
- 包含题目选择、答题、结果展示等子组件

### 4. 题目选择组件 (TitleChoice.vue)
- 功能：展示题目内容和选项
- 处理用户答题

### 5. 解释组件 (Explanation.vue)
- 功能：展示题目解释
- 支持即时评判

### 6. 题目表格组件 (QuestionTable.vue)
- 功能：展示题目列表和答题状态
- 支持快速导航

### 7. 面板组件 (Panel.vue)
- 功能：展示当前科目、章节信息
- 提供各种操作入口

### 8. AI咨询组件 (AIConsultant.vue)
- 功能：与AI交互咨询
- 支持问题输入和回答展示

### 9. 各种弹窗组件
- 功能：提供各种设置和操作界面
- 模态框设计

## 技术栈
- Vue 3
- Vite
- Vue Router
- Pinia (状态管理)
- Axios (HTTP请求)
- Tailwind CSS (可选，用于快速样式开发)

## 注意事项
1. 保持API接口不变，确保与后端的兼容性
2. 保持外部文件结构不变，只在vue文件夹内进行重构
3. 确保所有功能与原项目一致
4. 优化用户体验和代码可维护性
