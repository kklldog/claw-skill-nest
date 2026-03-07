const { test, expect } = require('@playwright/test');
const path = require('node:path');

test('首页可加载并可通过 UI 上传 skill', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Claw Skill Nest 管理后台' })).toBeVisible();

  await page.getByPlaceholder('输入 X-API-Key').fill('test-key');
  await page.getByRole('button', { name: '保存并刷新' }).click();

  await page.getByPlaceholder('Skill 名称（可选）').fill('e2e-skill');
  await page.getByPlaceholder('Skill 描述（可选）').fill('uploaded by e2e');

  const filePath = path.join(__dirname, 'fixtures', 'demo.skill');
  await page.locator('#skillFile').setInputFiles(filePath);

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.getByRole('button', { name: '上传 Skill' }).click();

  await expect(page.getByText('e2e-skill')).toBeVisible();
});
