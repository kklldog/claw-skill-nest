const { test, expect } = require('@playwright/test');
const path = require('node:path');

test('首页可登录、上传、搜索、排序、切换语言并使用更多操作', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();

  await page.getByPlaceholder('请输入 Token').fill('test-key');
  await page.getByRole('button', { name: '进入' }).click();

  await expect(page.getByRole('heading', { name: '本地 Skill 管理中心' })).toBeVisible();
  await page.locator('#langSwitch').selectOption('en');
  await expect(page.getByRole('heading', { name: 'Local Skill Management Center' })).toBeVisible();
  await expect(page.getByPlaceholder('Search by name, description, or filename')).toBeVisible();

  await page.getByRole('button', { name: 'Upload Skill' }).click();
  await expect(page.getByRole('heading', { name: 'Upload Skill' })).toBeVisible();
  await page.getByLabel('Name').fill('e2e-skill');
  await page.getByLabel('Description').fill('uploaded by e2e');

  const filePath = path.join(__dirname, 'fixtures', 'demo.skill');
  await page.locator('#skillFile').setInputFiles(filePath);
  await page.getByRole('button', { name: 'Upload' }).click();

  await expect(page.getByText('e2e-skill')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toHaveAttribute('title', 'Logout');
  const githubLink = page.getByRole('link', { name: 'GitHub Repository' });
  await expect(githubLink).toHaveAttribute('href', 'https://github.com/kklldog/claw-skill-nest');
  await expect(githubLink).toHaveAttribute('title', 'GitHub Repository');

  await page.getByPlaceholder('Search by name, description, or filename').fill('uploaded by e2e');
  await expect(page.getByText('e2e-skill')).toBeVisible();
  await page.getByPlaceholder('Search by name, description, or filename').fill('not-found-keyword');
  await expect(page.getByText('No matching skills')).toBeVisible();
  await page.getByPlaceholder('Search by name, description, or filename').fill('');

  await page.locator('#sortSelect').selectOption('name-asc');
  await expect(page.getByText('e2e-skill')).toBeVisible();

  await page.getByRole('button', { name: '⋯' }).first().click();
  await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

  await page.locator('#langSwitch').selectOption('zh-CN');
  await expect(page.getByRole('heading', { name: '本地 Skill 管理中心' })).toBeVisible();
});
