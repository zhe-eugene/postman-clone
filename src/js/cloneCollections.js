import axios from 'axios';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { showMessageSuccess } from './massage';
import { showMessageWarning } from './massage';
import { showMessageInfo } from './massage';

const allCollections = document.getElementById('all-collections');

allCollections.addEventListener('submit', async event => {
  event.preventDefault();
  // Считываем данные с формы
  const apiKeyFrom = document.getElementById('apiKeyFromAll').value.trim();
  const apiKeyTo = document.getElementById('apiKeyToAll').value.trim();
  const sourceWorkspaceId = document.getElementById('wpIdFromAll').value.trim();
  const targetWorkspaceId = document.getElementById('wpIdToAll').value.trim();

  await cloneCollections(
    apiKeyFrom,
    apiKeyTo,
    sourceWorkspaceId,
    targetWorkspaceId
  );
  allCollections.reset();
});

async function getCollections(workspaceId, headers) {
  const url = `https://api.getpostman.com/collections?workspace=${workspaceId}`;
  const response = await axios.get(url, { headers });
  return response.data.collections;
}

// API ключи  аккаунтов
//  apiKeyAccount1  источник
//  apiKeyAccount2  цель

// From
// sourceWorkspaceId

//  to
// targetWorkspaceId

async function cloneCollections(
  apiKeyAccount1,
  apiKeyAccount2,
  sourceWorkspaceId,
  targetWorkspaceId
) {
  const headersAccount1 = { 'X-Api-Key': apiKeyAccount1 };
  const headersAccount2 = { 'X-Api-Key': apiKeyAccount2 };
  try {
    const sourceCollections = await getCollections(
      sourceWorkspaceId,
      headersAccount1
    );
    const targetCollections = await getCollections(
      targetWorkspaceId,
      headersAccount2
    );

    for (let collection of sourceCollections) {
      const collectionName = collection.name;
      const collectionExists = targetCollections.some(
        target => target.name === collectionName
      );

      if (!collectionExists) {
        const cloneUrl = `https://api.getpostman.com/collections/${collection.uid}`;
        const cloneResponse = await axios.get(cloneUrl, {
          headers: headersAccount1,
        });
        const cloneData = cloneResponse.data.collection;

        // Убираем ID, чтобы создать как новую коллекцию
        if (cloneData.info && cloneData.info._postman_id) {
          delete cloneData.info._postman_id;
        }
        if (cloneData.info && cloneData.info.uid) {
          delete cloneData.info.uid;
        }

        const createUrl = `https://api.getpostman.com/collections?workspace=${targetWorkspaceId}`;
        const createData = { collection: cloneData };

        const createResponse = await axios.post(createUrl, createData, {
          headers: headersAccount2,
        });

        if (createResponse.status === 200 || createResponse.status === 201) {
          showMessageSuccess(
            `The collection  "${collectionName}" has been successfully cloned to the target workspace.`
          );
        } else {
          showMessageWarning(
            `Error creating collection: status  "${collectionName}": status ${createResponse.status}`
          );
        }
      } else {
        showMessageInfoWithIncrementalDelay(
          `The collection "${collectionName}" already exists in the target workspace.`
        );
      }
    }
  } catch (error) {
    const errData = error.response?.data?.error;

    if (errData && errData.name && errData.message) {
      showMessageWarning(
        `Error cloning collection: ${errData.name} - ${errData.message}`
      );
    } else if (error.response) {
      showMessageWarning(
        `Error cloning collection: ${JSON.stringify(error.response.data)}`
      );
    } else {
      showMessageWarning(`Error cloning collection: ${error.message}`);
    }
  }
}

let messageCount = 0;

function showMessageInfoWithIncrementalDelay(message) {
  messageCount++;
  setTimeout(() => {
    showMessageInfo(message);
    messageCount--;
  }, messageCount * 2000);
}
