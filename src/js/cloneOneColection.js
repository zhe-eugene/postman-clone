import axios from 'axios';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { showMessageSuccess } from './massage';
import { showMessageWarning } from './massage';

// const axios = require('axios');

const oneCollectionsForm = document.getElementById('collection-clone');

oneCollectionsForm.addEventListener('submit', async event => {
  event.preventDefault();
  // Считываем данные с формы
  const apiKeyFrom = document.getElementById('apiKeyFromCol').value.trim();
  const apiKeyTo = document.getElementById('apiKeyToCol').value.trim();
  const collectionUid = document.getElementById('colIdFromCol').value.trim();
  const targetWorkspaceId = document.getElementById('wpIdToCol').value.trim();

  await cloneSingleCollection(
    apiKeyFrom,
    apiKeyTo,
    collectionUid,
    targetWorkspaceId
  );

  oneCollectionsForm.reset();
});

// API ключи  аккаунтов
//  apiKeyAccount1  источник
//  apiKeyAccount2  цель

//  workspace ID  рабочего пространства
// targetWorkspaceId

// UID коллекции
// collectionUid

async function cloneSingleCollection(
  apiKeyAccount1,
  apiKeyAccount2,
  collectionUid,
  targetWorkspaceId
) {
  const headersAccount1 = { 'X-Api-Key': apiKeyAccount1 };
  const headersAccount2 = { 'X-Api-Key': apiKeyAccount2 };

  try {
    // Получаем коллекцию по UID
    const cloneUrl = `https://api.getpostman.com/collections/${collectionUid}`;
    const cloneResponse = await axios.get(cloneUrl, {
      headers: headersAccount1,
    });
    const cloneData = cloneResponse.data.collection;

    // Удаляем поля ID, чтобы создать как новую коллекцию
    if (cloneData.info && cloneData.info._postman_id) {
      delete cloneData.info._postman_id;
    }
    if (cloneData.info && cloneData.info.uid) {
      delete cloneData.info.uid;
    }

    // Отправляем коллекцию в целевое рабочее пространство
    const createUrl = `https://api.getpostman.com/collections?workspace=${targetWorkspaceId}`;
    const createData = { collection: cloneData };

    const createResponse = await axios.post(createUrl, createData, {
      headers: headersAccount2,
    });

    if (createResponse.status === 200 || createResponse.status === 201) {
      showMessageSuccess(
        `The collection "${cloneData.info.name}" has been successfully cloned to the target workspace.`
      );
    } else {
      showMessageWarning(
        `Error creating collection: status ${createResponse.status}`
      );
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
