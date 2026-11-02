import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isTask, loadTasks, saveTasks, STORAGE_KEY, type Task } from './task-storage.ts';

const firstTask: Task = {
  id: 'task-one',
  title: 'Review notes',
  subject: 'Biology',
  priority: 'High',
  dueDate: '2026-10-20',
  completed: false,
};

function storageWith(saved: string | null): Pick<Storage, 'getItem'> {
  return { getItem: () => saved };
}

test('loads valid saved tasks without changing their content or order', () => {
  const savedTasks = [
    firstTask,
    {
      ...firstTask,
      id: 'task-two',
      title: 'Finish worksheet',
      priority: 'Medium' as const,
      completed: true,
      customData: { source: 'saved task' },
    },
  ];

  assert.deepEqual(
    loadTasks(storageWith(JSON.stringify(savedTasks))),
    savedTasks,
  );
});

test('keeps valid tasks and ignores malformed entries in a mixed array', () => {
  const laterTask: Task = { ...firstTask, id: 'task-later', title: 'Read chapter' };
  const savedTasks = [
    firstTask,
    null,
    { ...firstTask, id: 'bad-priority', priority: 'Urgent' },
    { ...firstTask, id: 'bad-date', dueDate: '2026-02-30' },
    laterTask,
  ];

  assert.deepEqual(
    loadTasks(storageWith(JSON.stringify(savedTasks))),
    [firstTask, laterTask],
  );
});

test('falls back to seeded tasks for invalid JSON and non-array saved values', () => {
  const missingStorage = loadTasks(storageWith(null));

  for (const saved of ['{not valid JSON', JSON.stringify({ id: 'not-an-array' })]) {
    const recovered = loadTasks(storageWith(saved));
    assert.deepEqual(recovered, missingStorage);
    assert.ok(recovered.length > 0);
    assert.ok(recovered.every(isTask));
  }
});

test('keeps an intentionally empty saved task list empty', () => {
  assert.deepEqual(loadTasks(storageWith('[]')), []);
});

test('falls back to seeded tasks when reading storage throws', () => {
  const expectedTasks = loadTasks(storageWith(null));
  const blockedStorage: Pick<Storage, 'getItem'> = {
    getItem: () => {
      throw new Error('Storage access denied');
    },
  };

  const recovered = loadTasks(blockedStorage);
  assert.deepEqual(recovered, expectedTasks);
  assert.ok(recovered.length > 0);
  assert.ok(recovered.every(isTask));
});

test('saving tasks does not throw when storage writes are blocked', () => {
  const blockedStorage: Pick<Storage, 'setItem'> = {
    setItem: () => {
      throw new Error('Storage quota exceeded');
    },
  };

  assert.doesNotThrow(() => saveTasks([firstTask], blockedStorage));
});

test('saves task data under the task storage key', () => {
  let savedKey: string | undefined;
  let savedValue: string | undefined;
  const writableStorage: Pick<Storage, 'setItem'> = {
    setItem: (key, value) => {
      savedKey = key;
      savedValue = value;
    },
  };

  saveTasks([firstTask], writableStorage);

  assert.equal(savedKey, STORAGE_KEY);
  assert.deepEqual(JSON.parse(savedValue ?? ''), [firstTask]);
});
