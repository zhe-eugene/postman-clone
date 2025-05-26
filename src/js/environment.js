import axios from 'axios';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { showMessageSuccess } from './massage';
import { showMessageWarning } from './massage';
import { showMessageInfo } from './massage';

const environmentСlone = document.getElementById('environment-clone');

environmentСlone.addEventListener('submit', async event => {
  event.preventDefault();
  // Считываем данные с формы
  const apiKeyFrom = document.getElementById('apiKeyFromEnv').value.trim();
  const apiKeyTo = document.getElementById('apiKeyToEnv').value.trim();
  const sourceWorkspaceId = document.getElementById('wpIdFromEnv').value.trim();
  const targetWorkspaceId = document.getElementById('wpIdToEnv').value.trim();

  await cloneEnvironments(
    apiKeyFrom,
    apiKeyTo,
    sourceWorkspaceId,
    targetWorkspaceId
  );

  environmentСlone.reset();
});

// Получить список окружений в воркспейсе
async function getEnvironments(workspaceId, headers) {
  const url = `https://api.getpostman.com/environments?workspace=${workspaceId}`;
  const response = await axios.get(url, { headers });
  return response.data.environments;
}

async function cloneEnvironments(
  apiKeyAccount1,
  apiKeyAccount2,
  sourceWorkspaceId,
  targetWorkspaceId
) {
  const headersAccount1 = { 'X-Api-Key': apiKeyAccount1 };
  const headersAccount2 = { 'X-Api-Key': apiKeyAccount2 };
  try {
    const sourceEnvs = await getEnvironments(
      sourceWorkspaceId,
      headersAccount1
    );
    const targetEnvs = await getEnvironments(
      targetWorkspaceId,
      headersAccount2
    );

    for (let env of sourceEnvs) {
      const envName = env.name;

      // Проверяем, существует ли такое окружение в целевом workspace
      const exists = targetEnvs.some(targetEnv => targetEnv.name === envName);
      if (exists) {
        showMessageInfo(
          `The environment "${envName}" already exists in the target workspace.`
        );
        continue;
      }

      // Получаем полные данные окружения
      const envUrl = `https://api.getpostman.com/environments/${env.uid}`;
      const envResponse = await axios.get(envUrl, { headers: headersAccount1 });
      const envData = envResponse.data.environment;

      // Удаляем ID/UID перед созданием
      delete envData.id;
      delete envData.uid;

      // Создаём окружение в целевом воркспейсе
      const createUrl = `https://api.getpostman.com/environments?workspace=${targetWorkspaceId}`;
      const createData = { environment: envData };

      const createResponse = await axios.post(createUrl, createData, {
        headers: headersAccount2,
      });

      if (createResponse.status === 200 || createResponse.status === 201) {
        showMessageSuccess(
          `The environment "${envName}" has been successfully cloned.`
        );
      } else {
        showMessageWarning(`Error cloning environment "${envName}`);
      }
    }
  } catch (error) {
    const errData = error.response?.data?.error;

    if (errData && errData.name && errData.message) {
      showMessageWarning(
        `Error cloning environment: ${errData.name} - ${errData.message}`
      );
    } else if (error.response) {
      showMessageWarning(
        `Error cloning environment: ${JSON.stringify(error.response.data)}`
      );
    } else {
      showMessageWarning(`Error cloning environment: ${error.message}`);
    }
  }
}
