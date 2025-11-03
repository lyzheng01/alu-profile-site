# GitHub 推送身份验证指南

## 当前状态

✅ Git仓库已初始化
✅ 已创建首次提交（154个文件，32783行代码）
✅ 已添加远程仓库：https://github.com/lyzheng01/alu-profile-site.git
✅ 已切换到SSH地址：git@github.com:lyzheng01/alu-profile-site.git

## 需要完成身份验证

GitHub不再支持密码认证，需要使用以下方式之一：

---

## 方式1: 使用 Personal Access Token（推荐，最简单）

### 步骤1: 生成Token

1. 登录GitHub，访问：https://github.com/settings/tokens
2. 点击 "Generate new token" > "Generate new token (classic)"
3. 填写信息：
   - **Note**: 铝型材网站项目
   - **Expiration**: 选择有效期（建议90天或No expiration）
   - **Scopes**: 勾选 `repo`（完整仓库访问权限）
4. 点击 "Generate token"
5. **重要**: 复制生成的token（只显示一次！）

### 步骤2: 使用Token推送

```bash
cd /www/wwwroot/Aluminum

# 改回HTTPS地址
git remote set-url origin https://github.com/lyzheng01/alu-profile-site.git

# 推送时，用户名填：lyzheng01，密码填：刚才生成的token
git push -u origin main
```

或者使用token作为密码直接推送：
```bash
# 在推送时输入用户名和token
git push -u origin main
# Username: lyzheng01
# Password: <粘贴你的token>
```

### 方式3: 使用Git凭证存储（免输密码）

```bash
# 配置Git存储凭证
git config --global credential.helper store

# 推送（首次需要输入token）
git push -u origin main
# Username: lyzheng01
# Password: <粘贴你的token>

# 之后就不需要再输入了
```

---

## 方式2: 使用SSH密钥（更安全）

### 步骤1: 生成SSH密钥

```bash
# 生成SSH密钥（如果还没有）
ssh-keygen -t ed25519 -C "409828677@qq.com"

# 按提示操作：
# - 保存位置：直接回车（使用默认位置）
# - 密码：可以设置也可以留空
```

### 步骤2: 查看公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

### 步骤3: 添加到GitHub

1. 复制公钥内容（整个输出）
2. 访问：https://github.com/settings/keys
3. 点击 "New SSH key"
4. 填写：
   - **Title**: 服务器名称（如：生产服务器）
   - **Key**: 粘贴刚才复制的公钥
5. 点击 "Add SSH key"

### 步骤4: 测试SSH连接

```bash
ssh -T git@github.com
```

如果看到 "Hi lyzheng01! You've successfully authenticated..." 说明配置成功。

### 步骤5: 推送代码

```bash
cd /www/wwwroot/Aluminum
git push -u origin main
```

---

## 方式3: 使用GitHub CLI（gh命令）

如果服务器有GitHub CLI：

```bash
# 安装GitHub CLI（如果还没有）
# CentOS/RHEL:
sudo yum install gh

# Ubuntu/Debian:
sudo apt install gh

# 登录
gh auth login

# 选择 GitHub.com
# 选择 HTTPS 或 SSH
# 完成认证后推送
git push -u origin main
```

---

## 快速解决（推荐方式1）

**最简单的方法**：

1. 访问 https://github.com/settings/tokens
2. 生成新token，权限选择 `repo`
3. 复制token
4. 执行：
```bash
cd /www/wwwroot/Aluminum
git remote set-url origin https://github.com/lyzheng01/alu-profile-site.git
git push -u origin main
# 用户名：lyzheng01
# 密码：<粘贴token>
```

---

## 验证推送成功

推送成功后，访问：
https://github.com/lyzheng01/alu-profile-site

应该能看到所有代码文件。

---

## 后续提交工作流

配置好认证后，以后提交代码只需：

```bash
cd /www/wwwroot/Aluminum

# 1. 查看更改
git status

# 2. 添加文件
git add .

# 3. 提交
git commit -m "描述你的更改"

# 4. 推送
git push
```

---

## 常见问题

### Q: 提示 "Permission denied"？
A: 检查SSH密钥是否正确添加到GitHub，或使用Token方式。

### Q: 提示 "remote: Support for password authentication was removed"？
A: 必须使用Token或SSH，不能再用密码。

### Q: 如何更新已保存的凭证？
A: 删除旧的，重新配置：
```bash
# 清除保存的凭证
git config --global --unset credential.helper
# 或
rm ~/.git-credentials
```

