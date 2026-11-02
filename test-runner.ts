import { parseTaskCommand, inferCategory, inferPriority } from './src/services/taskEngine.ts';
import { parseNaturalDateAndTimeString } from './src/utils/dateUtils.ts';
import { getSampleTasks } from './src/utils/sampleData.ts';

const tasks = getSampleTasks();

console.log('--- Running FocusFlow AI Logic Verification Tests ---\n');

let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// Test 1: Date & Time parsing
const dateTest1 = parseNaturalDateAndTimeString('tomorrow at 6 PM');
assert(dateTest1.date !== undefined && dateTest1.time === '18:00', 'Parses "tomorrow at 6 PM" correctly');

const dateTest2 = parseNaturalDateAndTimeString('on Friday at 10:30 am');
assert(dateTest2.date !== undefined && dateTest2.time === '10:30', 'Parses "Friday at 10:30 am"');

// Test 2: ADD_TASK "add DSA practice tomorrow at 6 PM"
const addCmd = parseTaskCommand('add DSA practice tomorrow at 6 PM', tasks);
assert(addCmd.intent === 'ADD_TASK', 'Command intent is ADD_TASK');
assert(addCmd.params.title?.toLowerCase().includes('dsa practice'), 'Title extracted: "DSA practice"');
assert(addCmd.params.dueTime === '18:00', 'Due time is 18:00');
assert(addCmd.params.category === 'Coding', 'Category inferred as Coding');

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
const deleteCmd = parseTaskCommand('delete DSA practice', tasks);
assert(deleteCmd.intent === 'DELETE_TASK', 'Command intent is DELETE_TASK');
assert(deleteCmd.requiresConfirmation === true, 'Destructive delete requires confirmation');
assert(deleteCmd.confirmationMessage !== undefined, 'Has safety confirmation prompt');

// Test 7: Ambiguous add (no title)
const ambigCmd = parseTaskCommand('add task tomorrow', tasks);
assert(ambigCmd.clarificationNeeded !== undefined, 'Asks for clarification when title is missing');

console.log(`\nTest results: ${failed === 0 ? 'ALL PASSED!' : `${failed} failed`}`);
process.exit(failed);
