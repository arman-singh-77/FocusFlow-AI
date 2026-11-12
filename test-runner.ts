import assertNode from 'node:assert/strict';
import { parseTaskCommand } from './src/services/taskEngine.ts';
import { parseNaturalDateAndTimeString } from './src/utils/dateUtils.ts';
import { getSampleTasks } from './src/utils/sampleData.ts';
import {
  isValidTask,
  loadTasksFromStorage,
  saveTasksToStorage,
  importDataFromJson,
  TASKS_STORAGE_KEY,
  LEGACY_TASKS_STORAGE_KEY,
} from './src/services/storage.ts';
import type { Task } from './src/types/task.ts';

const tasks = getSampleTasks();

console.log('--- Running FocusFlow AI Logic & Storage Verification Tests ---\n');

let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

function runTest(testName: string, fn: () => void) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err);
    failed++;
  }
}

// --- 1. Natural Language & Command Engine Tests ---

// Test 1: Date & Time parsing
const dateTest1 = parseNaturalDateAndTimeString('tomorrow at 6 PM');
assert(dateTest1.date !== undefined && dateTest1.time === '18:00', 'Parses "tomorrow at 6 PM" correctly');

const dateTest2 = parseNaturalDateAndTimeString('on Friday at 10:30 am');
assert(dateTest2.date !== undefined && dateTest2.time === '10:30', 'Parses "Friday at 10:30 am"');

// Test 2: ADD_TASK "add DSA practice tomorrow at 6 PM"
const addCmd = parseTaskCommand('add DSA practice tomorrow at 6 PM', tasks);
assert(addCmd.intent === 'ADD_TASK', 'Command intent is ADD_TASK');
assert(Boolean(addCmd.params.title?.toLowerCase().includes('dsa practice')), 'Title extracted: "DSA practice"');
assert(addCmd.params.dueTime === '18:00', 'Due time is 18:00');
assert(addCmd.params.category === 'Coding', 'Category inferred as Coding');
assert(addCmd.params.title?.toLowerCase() === 'dsa practice', 'Task title excludes parsed date and time');

const groceriesCmd = parseTaskCommand('add pick up groceries tomorrow at 6 PM', tasks);
assert(groceriesCmd.params.title === 'Pick up groceries', 'Keeps the natural task title without date/time text');
assert(groceriesCmd.params.dueTime === '18:00', 'Parses grocery task time');

// Test 3: MOVE_TASK "move my Python assignment to Friday"
const moveCmd = parseTaskCommand('move my Python assignment to Friday', tasks);
assert(moveCmd.intent === 'MOVE_TASK', 'Command intent is MOVE_TASK');
assert(moveCmd.params.targetTaskId !== undefined, 'Matched Python assignment task ID');
assert(moveCmd.params.dueDate !== undefined, 'Target due date parsed for Friday');

// Test 4: QUERY_TODAY "what should I do today?"
const todayCmd = parseTaskCommand('what should I do today?', tasks);
assert(todayCmd.intent === 'QUERY_TODAY', 'Command intent is QUERY_TODAY');

// Test 5: QUERY_OVERDUE "which tasks are overdue?"
const overdueCmd = parseTaskCommand('which tasks are overdue?', tasks);
assert(overdueCmd.intent === 'QUERY_OVERDUE', 'Command intent is QUERY_OVERDUE');

// Test 6: Safe Delete with Mandatory Confirmation
const deleteCmd = parseTaskCommand('delete Review my algorithms notes', tasks);
assert(deleteCmd.intent === 'DELETE_TASK', 'Command intent is DELETE_TASK');
assert(deleteCmd.requiresConfirmation === true, 'Destructive delete requires confirmation');
assert(deleteCmd.confirmationMessage !== undefined, 'Has safety confirmation prompt');

// Test 7: Ambiguous add (no title)
const ambigCmd = parseTaskCommand('add task tomorrow', tasks);
assert(ambigCmd.clarificationNeeded !== undefined, 'Asks for clarification when title is missing');

// --- 2. Storage Recovery & Legacy Migration Tests (Unified from Replit suite) ---

const sampleValidTask: Task = {
  id: 'task-one',
  title: 'Review notes',
  dueDate: '2026-10-20',
  priority: 'high',
  category: 'Study',
  completed: false,
  createdAt: '2026-10-20T09:00:00.000Z',
};

function makeMemoryStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    dump: () => store,
  };
}

runTest('Loads valid saved tasks without changing content or order', () => {
  const saved = [
    sampleValidTask,
    {
      ...sampleValidTask,
      id: 'task-two',
      title: 'Finish worksheet',
      priority: 'medium' as const,
      completed: true,
      customData: { source: 'saved task' },
    },
  ];
  const mem = makeMemoryStorage({ [TASKS_STORAGE_KEY]: JSON.stringify(saved) });
  assertNode.deepEqual(loadTasksFromStorage(mem), saved);
});

runTest('Keeps valid tasks and ignores malformed entries in mixed arrays', () => {
  const laterTask: Task = { ...sampleValidTask, id: 'task-later', title: 'Read chapter' };
  const mixed = [
    sampleValidTask,
    null,
    { ...sampleValidTask, id: 'bad-priority', priority: 'Urgent' },
    { ...sampleValidTask, id: 'bad-date', dueDate: '2026-02-30' },
    laterTask,
  ];
  const mem = makeMemoryStorage({ [TASKS_STORAGE_KEY]: JSON.stringify(mixed) });
  assertNode.deepEqual(loadTasksFromStorage(mem), [sampleValidTask, laterTask]);
});

runTest('Falls back to sample tasks for invalid JSON and non-array values', () => {
  for (const raw of ['{not valid JSON', JSON.stringify({ id: 'not-an-array' })]) {
    const mem = makeMemoryStorage({ [TASKS_STORAGE_KEY]: raw });
    const recovered = loadTasksFromStorage(mem);
    assertNode.ok(recovered.length > 0);
    assertNode.ok(recovered.every(isValidTask));
  }
});

runTest('Keeps an intentionally empty saved task list empty', () => {
  const mem = makeMemoryStorage({ [TASKS_STORAGE_KEY]: '[]' });
  assertNode.deepEqual(loadTasksFromStorage(mem), []);
});

runTest('Falls back safely when reading storage throws', () => {
  const blocked = {
    getItem: () => {
      throw new Error('Storage access denied');
    },
  };
  const recovered = loadTasksFromStorage(blocked);
  assertNode.ok(recovered.length > 0);
  assertNode.ok(recovered.every(isValidTask));
});

runTest('Saving tasks does not throw when storage writes are blocked', () => {
  const blocked = {
    setItem: () => {
      throw new Error('Storage quota exceeded');
    },
  };
  assertNode.doesNotThrow(() => saveTasksToStorage([sampleValidTask], blocked));
});

runTest('Saves task data under unified TASKS_STORAGE_KEY', () => {
  const mem = makeMemoryStorage();
  saveTasksToStorage([sampleValidTask], mem);
  assertNode.deepEqual(JSON.parse(mem.dump()[TASKS_STORAGE_KEY]), [sampleValidTask]);
});

runTest('Migrates legacy Replit tasks (focusflow.tasks.v1) into unified format', () => {
  const legacyTasks = [
    {
      id: 'seed-biology',
      title: 'Review cell structure notes',
      subject: 'Biology',
      priority: 'High',
      dueDate: '2026-10-20',
      completed: false,
    },
    {
      id: 'seed-python',
      title: 'Build FastAPI health check',
      subject: 'Coding',
      priority: 'Medium',
      dueDate: '2026-10-21',
      completed: true,
    },
  ];
  const mem = makeMemoryStorage({ [LEGACY_TASKS_STORAGE_KEY]: JSON.stringify(legacyTasks) });
  const migrated = loadTasksFromStorage(mem);

  assertNode.equal(migrated.length, 2);
  assertNode.equal(migrated[0].priority, 'high');
  assertNode.equal(migrated[0].category, 'Study');
  assertNode.equal(migrated[0].description, 'Subject: Biology');
  assertNode.equal(migrated[1].category, 'Coding');
  assertNode.equal(migrated[1].priority, 'medium');
  // Also persisted under unified key
  assertNode.ok(mem.dump()[TASKS_STORAGE_KEY] !== undefined);
});

runTest('importDataFromJson validates valid arrays and rejects malformed payloads', () => {
  const good = importDataFromJson(JSON.stringify({ tasks: [sampleValidTask] }));
  assertNode.equal(good.success, true);
  assertNode.equal(good.tasks?.length, 1);

  const bad = importDataFromJson('{"tasks": [{"id": ""}]}');
  assertNode.equal(bad.success, false);
});

console.log(`\nTest results: ${failed === 0 ? 'ALL PASSED!' : `${failed} failed`}`);
process.exit(failed);
