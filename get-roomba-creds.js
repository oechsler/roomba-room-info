import fetch from 'node-fetch';

const GIGYA_API_KEY = process.env.GIGYA_API_KEY;
const IROBOT_APP_ID = process.env.IROBOT_APP_ID;

if (!GIGYA_API_KEY) throw new Error('GIGYA_API_KEY is not set in environment variables.');
if (!IROBOT_APP_ID) throw new Error('IROBOT_APP_ID is not set in environment variables.');

export async function getRoombaCredentials(email, password) {
  const query = new URLSearchParams({
    apiKey: GIGYA_API_KEY,
    targetenv: 'mobile',
    loginID: email,
    password,
    format: 'json'
  }).toString();

  const gigyaRes = await fetch(`https://accounts.us1.gigya.com/accounts.login?${query}`, {
    method: 'POST',
    headers: { 'Connection': 'close' }
  });

  const gigyaData = await gigyaRes.json();
  if (!gigyaData.UID || !gigyaData.UIDSignature || !gigyaData.signatureTimestamp) {
    throw new Error('Fehler beim Gigya-Login: ' + JSON.stringify(gigyaData));
  }

  const irobotRes = await fetch('https://unauth2.prod.iot.irobotapi.com/v2/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Connection': 'close' },
    body: JSON.stringify({
      app_id: IROBOT_APP_ID,
      assume_robot_ownership: 0,
      gigya: {
        signature: gigyaData.UIDSignature,
        timestamp: gigyaData.signatureTimestamp,
        uid: gigyaData.UID
      }
    })
  });

  const irobotData = await irobotRes.json();

  if (!irobotData.robots || Object.keys(irobotData.robots).length === 0) {
    throw new Error('Keine Roboter gefunden: ' + JSON.stringify(irobotData));
  }

  const robotKey = Object.keys(irobotData.robots)[0];
  const robot = irobotData.robots[robotKey];
  return {
    blid: robotKey,
    password: robot.password
  };
}
