import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { chromium, type Browser, type Page } from 'playwright';
import { STORAGE_KEY, type Task } from './lib/task-storage.ts';

const appDirectory = resolve(import.meta.dirname, '..');

async function getAvailablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Could not find an available port for the dashboard test.');
  }

  await new Promise<void>((resolveClose, reject) => {
    server.close((error) => error ? reject(error) : resolveClose());
  });
  return address.port;
}

function findChromium(): string | undefined {
  const configuredPath = process.env.CHROMIUM_PATH;
  if (configuredPath) return existsSync(configuredPath) ? configuredPath : undefined;

  const result = spawnSync('which', ['chromium'], { encoding: 'utf8' });
  const executable = result.status === 0 ? result.stdout.trim() : '';
  return executable && existsSync(executable) ? executable : undefined;
}

async function waitForServer(
  server: ChildProcess,
  url: string,
  getOutput: () => string,
): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Dashboard test server exited early.\n${getOutput()}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite has not opened its port yet.
    }
    await delay(100);
  }

  throw new Error(`Dashboard test server did not become ready.\n${getOutput()}`);
}

async function readSavedTasks(page: Page): Promise<Task[]> {
  return page.evaluate((storageKey) => {
    const saved = localStorage.getItem(storageKey);
    return saved === null ? [] : JSON.parse(saved) as Task[];
  }, STORAGE_KEY);
}

test('task additions, completion, and deletion survive a browser reload', async (context) => {
  const chromiumPath = findChromium();
  if (!chromiumPath) {
    context.skip('Chromium is not installed; set CHROMIUM_PATH to run this browser test.');
    return;
  }

  const port = await getAvailablePort();
  const baseUrl = `http://127.0.0.1:${port}/`;
  const vitePath = resolve(appDirectory, 'node_modules/vite/bin/vite.js');
  const server = spawn(
    process.execPath,
    [vitePath, '--config', 'vite.config.ts', '--host', '127.0.0.1'],
    {
      cwd: appDirectory,
      env: { ...process.env, PORT: String(port), BASE_PATH: '/' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let serverOutput = '';
  server.stdout?.on('data', (chunk: Buffer) => { serverOutput += chunk.toString(); });
  server.stderr?.on('data', (chunk: Buffer) => { serverOutput += chunk.toString(); });

  let browser: Browser | undefined;
  try {
    await waitForServer(server, baseUrl, () => serverOutput);
    browser = await chromium.launch({
      executablePath: chromiumPath,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.getByTestId('button-add-task').waitFor();

    const taskTitle = `Browser persistence check ${Date.now()}`;
    await page.getByTestId('button-add-task').click();
    await page.getByTestId('input-task-title').fill(taskTitle);
    await page.getByTestId('input-task-subject').fill('Physics');
    await page.getByTestId('button-submit-task').click();

    await page.getByText(taskTitle, { exact: true }).waitFor();
    await page.waitForFunction(
      ({ storageKey, title }) => {
        const tasks = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Task[];
        return tasks.some((task) => task.title === title && !task.completed);
      },
      { storageKey: STORAGE_KEY, title: taskTitle },
    );

    let savedTasks = await readSavedTasks(page);
    const addedTask = savedTasks.find((task) => task.title === taskTitle);
    assert.ok(addedTask, 'the new task should be written to browser storage');
    assert.equal(addedTask.completed, false);

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText(taskTitle, { exact: true }).waitFor();
    assert.equal(
      await page.getByTestId(`button-complete-task-${addedTask.id}`).getAttribute('aria-pressed'),
      'false',
      'the new task should be restored as incomplete after reload',
    );
    savedTasks = await readSavedTasks(page);
    assert.equal(savedTasks.find((task) => task.id === addedTask.id)?.completed, false);

    const completionButton = page.getByTestId(`button-complete-task-${addedTask.id}`);
    await completionButton.click();
    await page.waitForFunction(
      ({ storageKey, taskId }) => {
        const tasks = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Task[];
        return tasks.some((task) => task.id === taskId && task.completed);
      },
      { storageKey: STORAGE_KEY, taskId: addedTask.id },
    );

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText(taskTitle, { exact: true }).waitFor();
    await page.getByTestId(`button-complete-task-${addedTask.id}`).waitFor();
    assert.equal(
      await page.getByTestId(`button-complete-task-${addedTask.id}`).getAttribute('aria-pressed'),
      'true',
      'the completed state should be restored after reload',
    );
    savedTasks = await readSavedTasks(page);
    assert.equal(savedTasks.find((task) => task.id === addedTask.id)?.completed, true);

    await page.getByTestId(`button-delete-task-${addedTask.id}`).click();
    await page.getByText(taskTitle, { exact: true }).waitFor({ state: 'detached' });
    await page.waitForFunction(
      ({ storageKey, taskId }) => {
        const tasks = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Task[];
        return !tasks.some((task) => task.id === taskId);
      },
      { storageKey: STORAGE_KEY, taskId: addedTask.id },
    );

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('button-add-task').waitFor();
    assert.equal(
      await page.getByText(taskTitle, { exact: true }).count(),
      0,
      'the deleted task should stay absent after reload',
    );
    savedTasks = await readSavedTasks(page);
    assert.ok(
      savedTasks.every((task) => task.id !== addedTask.id),
      'the deleted task should remain absent from browser storage',
    );
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
    await new Promise<void>((resolveExit) => {
      if (server.exitCode !== null) return resolveExit();
      server.once('exit', () => resolveExit());
      setTimeout(resolveExit, 2_000).unref();
    });
  }
});
