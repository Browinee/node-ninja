import axios from 'axios';



const NPM_REGISTRY = 'https://registry.npmjs.com';

function getNpmRegistry() {
  return NPM_REGISTRY;
}
async function getNpmInfo(packageName: string) {
  const url = new URL(packageName, NPM_REGISTRY);

  try {
    const response = await axios.get(url.toString());

    if (response.status === 200) {
      return response.data;
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

async function getLatestVersion(packageName: string) {
  const data = await getNpmInfo(packageName);
  return data['dist-tags'].latest;
}

async function getVersions(packageName: string) {
  const data = await getNpmInfo(packageName);
  return Object.keys(data.versions);
}

export {
  getNpmRegistry,
  getNpmInfo,
  getLatestVersion,
  getVersions
}
