# Git 提交到远程仓库指南

## 一、首次设置（只需要做一次）

### 1. 配置 Git 用户信息（如果还没配置）
```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 2. 添加文件到暂存区
```bash
cd /www/wwwroot/Aluminum
git add .
```

### 3. 创建首次提交
```bash
git commit -m "Initial commit: 铝型材外贸网站项目"
```

## 二、添加远程仓库

### 方式1: 使用 GitHub（推荐）

1. **在GitHub上创建新仓库**
   - 访问 https://github.com/new
   - 填写仓库名称（如：aluminum-website）
   - 不要初始化 README、.gitignore 或 license（因为我们本地已有代码）

2. **添加远程仓库**
   ```bash
   git remote add origin https://github.com/你的用户名/aluminum-website.git
   ```

3. **查看远程仓库**
   ```bash
   git remote -v
   ```

### 方式2: 使用 Gitee（码云）

```bash
# 在Gitee创建仓库后
git remote add origin https://gitee.com/你的用户名/aluminum-website.git
```

### 方式3: 使用自定义Git服务器

```bash
git remote add origin git@your-git-server.com:username/aluminum-website.git
```

## 三、推送到远程仓库

### 首次推送
```bash
# 推送到主分支（如果是master）
git push -u origin master

# 或者如果是main分支
git branch -M main
git push -u origin main
```

### 后续推送
```bash
# 添加文件
git add .

# 提交
git commit -m "描述你的更改"

# 推送
git push
```

## 四、常用 Git 命令

### 查看状态
```bash
git status                    # 查看工作区状态
git log                       # 查看提交历史
git remote -v                 # 查看远程仓库
```

### 分支管理
```bash
git branch                    # 查看所有分支
git branch -M main            # 重命名当前分支为main
git checkout -b dev           # 创建并切换到dev分支
```

### 撤销操作
```bash
git restore <file>            # 撤销工作区的修改
git restore --staged <file>   # 撤销暂存区的修改
```

## 五、完整示例流程

```bash
# 1. 进入项目目录
cd /www/wwwroot/Aluminum

# 2. 查看当前状态
git status

# 3. 添加所有更改的文件
git add .

# 4. 提交更改
git commit -m "feat: 添加产品模板系统设计方案"

# 5. 推送到远程
git push

# 如果需要推送到特定分支
git push origin master
```

## 六、提交信息规范（推荐）

使用有意义的提交信息：

```bash
# 功能添加
git commit -m "feat: 添加工厂图片API集成"

# 问题修复
git commit -m "fix: 修复产品详情页图片显示问题"

# 文档更新
git commit -m "docs: 更新产品模板系统分析报告"

# 代码重构
git commit -m "refactor: 优化产品详情页组件结构"

# 性能优化
git commit -m "perf: 优化产品列表加载速度"
```

## 七、SSH密钥配置（推荐）

### 生成SSH密钥
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 查看公钥
```bash
cat ~/.ssh/id_ed25519.pub
```

### 添加到GitHub/Gitee
1. 复制公钥内容
2. 在GitHub: Settings > SSH and GPG keys > New SSH key
3. 在Gitee: 设置 > SSH公钥 > 添加公钥

### 使用SSH地址添加远程仓库
```bash
git remote set-url origin git@github.com:用户名/仓库名.git
```

## 八、遇到问题？

### 问题1: 远程仓库已有内容
```bash
# 先拉取远程内容
git pull origin main --allow-unrelated-histories

# 解决冲突后推送
git push
```

### 问题2: 忘记添加远程仓库
```bash
# 添加远程仓库
git remote add origin <远程仓库URL>

# 推送
git push -u origin main
```

### 问题3: 更改远程仓库地址
```bash
# 查看当前远程地址
git remote -v

# 修改远程地址
git remote set-url origin <新的远程仓库URL>
```

