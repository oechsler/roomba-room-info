import { getRoombaCredentials } from './get-roomba-creds.js';
import dorita980 from 'dorita980';

const email = process.env.ROOMBA_EMAIL;
const pw = process.env.ROOMBA_PASSWORD;
const ip = process.env.ROOMBA_IP;

if (!email || !pw || !ip) {
  console.error('Please set ROOMBA_EMAIL, ROOMBA_PASSWORD, and ROOMBA_IP.');
  process.exit(1);
}

function formatYaml(cmd) {
  const pmapId = cmd.pmap_id;
  const userPmapvId = cmd.user_pmapv_id;
  const regions = cmd.regions || [];

  if (!pmapId || !userPmapvId || regions.length === 0) {
    console.error('Missing data: pmap_id, user_pmapv_id, or regions are not available.');
    process.exit(1);
  }

  console.log('---');
  console.log(`pmap_id: ${pmapId}`);
  console.log('regions:');
  for (const region of regions) {
    const id = region.region_id;
    const type = region.type;
    console.log(`  - region_id: "${id}"`);
    console.log(`    type: ${type}`);
  }
  console.log(`user_pmapv_id: ${userPmapvId}`);
}

try {
  console.log('---');
  console.log('Fetching Roomba credentials...');

  const { blid, password } = await getRoombaCredentials(email, pw);

  console.log('---');
  console.log('BLID:', blid);
  console.log('Password:', password);

  const robot = new dorita980.Local(blid, password, ip);

  console.log('---');
  console.log("Waiting for 'start' command from Roomba...");
  
  const state = await robot.getRobotState(['lastCommand']);
  const cmd = state.lastCommand || {};
 
  if (cmd.command === 'start' && cmd.pmap_id && cmd.user_pmapv_id && Array.isArray(cmd.regions)) {
    formatYaml(cmd);
    robot.end();
    process.exit(0);
  }

  robot.on('state', (state) => {
    const cmd = state.lastCommand || {};
    if (cmd.command === 'start' && cmd.pmap_id && cmd.user_pmapv_id && Array.isArray(cmd.regions)) {
      formatYaml(cmd);
      robot.end();
      process.exit(0);
    }
  });

  robot.on('connect', () => {
    console.log('Connected to Roomba event stream.');
  });

  robot.on('error', (err) => {
    console.error('Error from Roomba:', err.message);
  });

  process.stdin.resume();
} catch (err) {
  console.error('Fatal error:', err.message);
  process.exit(2);
}
