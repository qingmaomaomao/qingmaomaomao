// API 基础路径
const API_BASE = '';

// 切换标签页
function switchTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 移除所有按钮的激活状态
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // 显示选中的标签
    document.getElementById(tabName + '-tab').classList.add('active');

    // 激活对应按钮
    event.target.classList.add('active');

    // 如果切换到账号或状态页面，刷新数据
    if (tabName === 'accounts') {
        loadAccounts();
    } else if (tabName === 'status') {
        loadStatus();
    }
}

// 显示通知
function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// 文件选择处理
document.getElementById('video-file')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || '未选择文件';
    document.getElementById('video-file-name').textContent = fileName;
});

document.getElementById('image-files')?.addEventListener('change', function(e) {
    const count = e.target.files.length;
    const fileName = count > 0 ? `已选择 ${count} 个文件` : '未选择文件';
    document.getElementById('image-files-name').textContent = fileName;
});

// 发布内容表单
document.getElementById('publish-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const text = document.getElementById('post-text').value;
    const videoFile = document.getElementById('video-file').files[0];
    const imageFiles = document.getElementById('image-files').files;

    const platformYoutube = document.getElementById('platform-youtube').checked;
    const platformTwitter = document.getElementById('platform-twitter').checked;

    if (!platformYoutube && !platformTwitter) {
        showNotification('请至少选择一个平台', 'error');
        return;
    }

    const platforms = [];
    if (platformYoutube) platforms.push('youtube');
    if (platformTwitter) platforms.push('twitter');

    const formData = new FormData();
    formData.append('text', text);
    formData.append('platforms', platforms.join(','));

    if (videoFile) {
        formData.append('video', videoFile);
    }

    if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }
    }

    // YouTube 选项
    formData.append('ytTitle', document.getElementById('yt-title').value || text);
    formData.append('ytDesc', document.getElementById('yt-desc').value || text);
    formData.append('ytTags', document.getElementById('yt-tags').value);
    formData.append('ytPrivacy', document.getElementById('yt-privacy').value);

    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span>发布中...';

    try {
        const response = await fetch(`${API_BASE}/api/post`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showNotification('发布成功！', 'success');
            document.getElementById('publish-result').style.display = 'block';
            document.getElementById('publish-result-text').textContent = JSON.stringify(result.data, null, 2);

            // 清空表单
            document.getElementById('publish-form').reset();
            document.getElementById('video-file-name').textContent = '未选择文件';
            document.getElementById('image-files-name').textContent = '未选择文件';
        } else {
            showNotification('发布失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('发布失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🚀 开始发布';
    }
});

// 添加 YouTube 账号
document.getElementById('add-youtube-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('yt-account-name').value,
        clientId: document.getElementById('yt-client-id').value,
        clientSecret: document.getElementById('yt-client-secret').value,
        refreshToken: document.getElementById('yt-refresh-token').value
    };

    try {
        const response = await fetch(`${API_BASE}/api/accounts/youtube`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('YouTube 账号添加成功！', 'success');
            this.reset();
            loadAccounts();
        } else {
            showNotification('添加失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('添加失败: ' + error.message, 'error');
    }
});

// 添加 Twitter 账号
document.getElementById('add-twitter-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('tw-account-name').value,
        appKey: document.getElementById('tw-app-key').value,
        appSecret: document.getElementById('tw-app-secret').value,
        accessToken: document.getElementById('tw-access-token').value,
        accessSecret: document.getElementById('tw-access-secret').value
    };

    try {
        const response = await fetch(`${API_BASE}/api/accounts/twitter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Twitter 账号添加成功！', 'success');
            this.reset();
            loadAccounts();
        } else {
            showNotification('添加失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('添加失败: ' + error.message, 'error');
    }
});

// 加载账号列表
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE}/api/accounts`);
        const result = await response.json();

        if (result.success) {
            displayAccounts(result.data);
        }
    } catch (error) {
        console.error('加载账号失败:', error);
    }
}

// 显示账号列表
function displayAccounts(accounts) {
    const container = document.getElementById('accounts-list');

    if (!accounts.youtube?.length && !accounts.twitter?.length) {
        container.innerHTML = '<p style="color: #666; text-align: center;">暂无账号，请先添加</p>';
        return;
    }

    let html = '';

    if (accounts.youtube?.length) {
        html += '<h4 style="margin-bottom: 10px;">YouTube 账号</h4>';
        accounts.youtube.forEach(account => {
            html += `
                <div class="account-item">
                    <div class="account-info">
                        <div class="account-name">${account.name}</div>
                        <div class="account-platform">YouTube · ID: ${account.id}</div>
                        <span class="badge ${account.enabled !== false ? 'badge-enabled' : 'badge-disabled'}">
                            ${account.enabled !== false ? '启用' : '禁用'}
                        </span>
                    </div>
                    <div class="account-actions">
                        <button class="button-secondary" onclick="toggleAccount('youtube', '${account.id}', ${account.enabled === false})">
                            ${account.enabled !== false ? '禁用' : '启用'}
                        </button>
                        <button class="button-danger" onclick="deleteAccount('youtube', '${account.id}', '${account.name}')">
                            删除
                        </button>
                    </div>
                </div>
            `;
        });
    }

    if (accounts.twitter?.length) {
        html += '<h4 style="margin: 20px 0 10px 0;">Twitter 账号</h4>';
        accounts.twitter.forEach(account => {
            html += `
                <div class="account-item">
                    <div class="account-info">
                        <div class="account-name">${account.name}</div>
                        <div class="account-platform">Twitter · ID: ${account.id}</div>
                        <span class="badge ${account.enabled !== false ? 'badge-enabled' : 'badge-disabled'}">
                            ${account.enabled !== false ? '启用' : '禁用'}
                        </span>
                    </div>
                    <div class="account-actions">
                        <button class="button-secondary" onclick="toggleAccount('twitter', '${account.id}', ${account.enabled === false})">
                            ${account.enabled !== false ? '禁用' : '启用'}
                        </button>
                        <button class="button-danger" onclick="deleteAccount('twitter', '${account.id}', '${account.name}')">
                            删除
                        </button>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

// 切换账号状态
async function toggleAccount(platform, id, enable) {
    try {
        const response = await fetch(`${API_BASE}/api/accounts/${platform}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled: enable })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`账号已${enable ? '启用' : '禁用'}`, 'success');
            loadAccounts();
            loadStatus();
        } else {
            showNotification('操作失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('操作失败: ' + error.message, 'error');
    }
}

// 删除账号
async function deleteAccount(platform, id, name) {
    if (!confirm(`确定要删除账号 "${name}" 吗？`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/accounts/${platform}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('账号删除成功', 'success');
            loadAccounts();
            loadStatus();
        } else {
            showNotification('删除失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('删除失败: ' + error.message, 'error');
    }
}

// 加载状态
async function loadStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/status`);
        const result = await response.json();

        if (result.success) {
            const status = result.data;
            document.getElementById('yt-total').textContent = status.youtube.total;
            document.getElementById('yt-enabled').textContent = `启用: ${status.youtube.enabled}`;
            document.getElementById('tw-total').textContent = status.twitter.total;
            document.getElementById('tw-enabled').textContent = `启用: ${status.twitter.enabled}`;
        }
    } catch (error) {
        console.error('加载状态失败:', error);
    }
}

// 测试账号
async function testAccounts() {
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span>测试中...';

    try {
        const response = await fetch(`${API_BASE}/api/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ platform: 'all' })
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('test-result').style.display = 'block';
            document.getElementById('test-result-text').textContent = JSON.stringify(result.data, null, 2);
        } else {
            showNotification('测试失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('测试失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🔍 测试所有账号';
    }
}

// YouTube 授权表单
document.getElementById('yt-auth-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const clientId = document.getElementById('auth-client-id').value;
    const clientSecret = document.getElementById('auth-client-secret').value;

    try {
        const response = await fetch(`${API_BASE}/api/youtube/auth-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId, clientSecret })
        });

        const result = await response.json();

        if (result.success) {
            const resultDiv = document.getElementById('auth-url-result');
            const linkElement = document.getElementById('auth-url-link');
            linkElement.href = result.url;
            linkElement.textContent = result.url;
            resultDiv.style.display = 'block';
            showNotification('授权链接已生成！', 'success');
        } else {
            showNotification('生成失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('生成失败: ' + error.message, 'error');
    }
});

// YouTube Token 表单
document.getElementById('yt-token-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const clientId = document.getElementById('token-client-id').value;
    const clientSecret = document.getElementById('token-client-secret').value;
    const code = document.getElementById('token-code').value;

    const btn = e.submitter;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span>获取中...';

    try {
        const response = await fetch(`${API_BASE}/api/youtube/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId, clientSecret, code })
        });

        const result = await response.json();

        if (result.success) {
            const resultDiv = document.getElementById('token-result');
            document.getElementById('refresh-token-value').textContent = result.refreshToken;
            resultDiv.style.display = 'block';
            showNotification('Refresh Token 获取成功！', 'success');
        } else {
            showNotification('获取失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('获取失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🔑 获取 Refresh Token';
    }
});

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', function() {
    loadStatus();
    loadAccounts();
});
