import fetch from 'node-fetch';

export async function getRoombaCredentials(email, password, apiKey = 'no-key') {
  const query = new URLSearchParams({
    apiKey,
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
      app_id: 'no-app-id',
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
