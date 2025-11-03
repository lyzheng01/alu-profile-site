# GitHub 推送 403 错误解决方案

## 当前状态

✅ Token已验证有效（API调用成功）  
❌ 推送时返回 403 错误  
❌ 可能是权限不足

## 可能的原因

1. **Fine-grained Token未授权给仓库**
   - Fine-grained token需要明确授权给特定仓库
   
2. **Token缺少写入权限**
   - Token可能只有读取权限，没有推送权限

3. **仓库分支保护**
   - 仓库可能有分支保护规则

## 解决方案

### 方案1：检查Token权限（最重要）

1. **访问Token设置**：
   https://github.com/settings/tokens

2. **检查当前Token类型**：
   - 如果是 **Fine-grained token**：
     - 点击token名称进入详情
     - 在 "Repository access" 部分，确保选择：
       - ✅ "Selected repositories" 并添加 `alu-profile-site`
       - 或者选择 "All repositories"
     - 在 "Permissions" 部分，确保：
       - Repository permissions > Contents: **Read and write**
       - Repository permissions > Metadata: **Read-only** (自动勾选)
   
   - 如果是 **Classic token**：
     - 确保勾选了 `repo` 下的所有权限：
       - ✅ repo (Full control of private repositories)

3. **如果权限不足，重新生成Token**：
   - 删除旧token
   - 创建新的 **Classic token**（更简单）：
     ```
     访问：https://github.com/settings/tokens/new
     
     Note: alu-profile-site
     Expiration: 90 days 或 No expiration
     
     勾选权限：
     ✅ repo (Full control of private repositories)
        - repo:status
        - repo_deployment
        - public_repo
        - repo:invite
        - security_events
     
     点击 "Generate token"
     复制新token
     ```

### 方案2：使用新Token推送

使用新token后：

```bash
cd /www/wwwroot/Aluminum

# 方法1: 使用URL嵌入token（临时）
git remote set-url origin https://新token@github.com/lyzheng01/alu-profile-site.git
git push -u origin main

# 方法2: 使用交互式推送
git remote set-url origin https://github.com/lyzheng01/alu-profile-site.git
git push -u origin main
# 用户名：lyzheng01
# 密码：<粘贴新token>
```

### 方案3：使用SSH（推荐长期使用）

如果token一直有问题，配置SSH更稳定：

1. **添加SSH公钥到GitHub**：
   ```bash
   # 查看公钥
   cat ~/.ssh/id_ed25519.pub
   ```
   
   复制输出，然后：
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - Title: `生产服务器`
   - Key: 粘贴公钥
   - 点击 "Add SSH key"

2. **使用SSH推送**：
   ```bash
   cd /www/wwwroot/Aluminum
   git remote set-url origin git@github.com:lyzheng01/alu-profile-site.git
   git push -u origin main
   ```

### 方案4：检查仓库设置

1. 访问：https://github.com/lyzheng01/alu-profile-site/settings
2. 检查 "Branches" > "Branch protection rules"
3. 确保main分支没有限制推送

## 快速操作步骤

**推荐步骤**（使用Classic Token）：

1. 访问：https://github.com/settings/tokens/new
2. 选择 "Generate new token (classic)"
3. 勾选 `repo` 所有权限
4. 生成并复制token
5. 执行：
   ```bash
   cd /www/wwwroot/Aluminum
   git remote set-url origin https://新token@github.com/lyzheng01/alu-profile-site.git
   git push -u origin main
   ```

## 验证Token权限

```bash
# 测试token是否有仓库访问权限
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/lyzheng01/alu-profile-site

# 如果返回仓库信息，说明有读取权限
# 但推送还需要写入权限
```

## 注意事项

⚠️ **安全提示**：
- Token就像密码，不要分享给他人
- 不要在公开场合暴露token
- 建议设置token过期时间
- 定期轮换token

## 当前Token状态

- ✅ Token格式正确
- ✅ Token有效（能访问用户API）
- ❌ 可能缺少仓库写入权限
- ❓ 需要检查token类型和权限设置

建议：重新生成一个Classic token，确保有完整的repo权限。

