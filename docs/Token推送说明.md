# Token推送说明

## 遇到的问题

Token推送时遇到 403 错误，可能的原因：

1. **Token权限不足**：需要确保Token有 `repo` 权限
2. **Fine-grained Token限制**：如果是fine-grained token，需要授权给特定仓库
3. **Token格式问题**：classic token和fine-grained token使用方式不同

## 解决方案

### 方案1：检查并重新生成Token（推荐）

1. 访问：https://github.com/settings/tokens
2. 检查当前token是否有 `repo` 权限
3. 如果没有，创建一个新的 **classic token**：
   - 访问：https://github.com/settings/tokens/new
   - Note: `alu-profile-site`
   - Expiration: 选择有效期
   - **重要**：勾选 `repo` 下的所有权限
   - 点击 "Generate token"
   - 复制新token

### 方案2：使用交互式推送

```bash
cd /www/wwwroot/Aluminum
git push -u origin main
```

然后在提示时：
- Username: `lyzheng01`
- Password: `<粘贴新token>`

### 方案3：使用Git Credential Manager

```bash
# 清除旧的凭证
git credential reject <<EOF
protocol=https
host=github.com
EOF

# 推送（会提示输入用户名和token）
git push -u origin main
```

### 方案4：检查仓库权限

确保：
1. 仓库存在：https://github.com/lyzheng01/alu-profile-site
2. 账户有推送权限
3. Token对该仓库有访问权限

## 临时方案：使用SSH（如果token有问题）

如果Token方式一直有问题，可以配置SSH：

1. **添加SSH公钥到GitHub**：
   ```bash
   # 查看公钥
   cat ~/.ssh/id_ed25519.pub
   ```
   
   然后访问 https://github.com/settings/keys 添加

2. **使用SSH推送**：
   ```bash
   git remote set-url origin git@github.com:lyzheng01/alu-profile-site.git
   git push -u origin main
   ```

## 验证Token是否有效

```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

如果返回用户信息，说明token有效。
如果返回401/403，说明token无效或权限不足。

