export async function loadManifest(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Manifest request failed (${response.status})`);
  }
  const manifest = await response.json();
  if (!manifest || manifest.schemaVersion !== 1 || !manifest.assets) {
    throw new Error("Manifest schema is invalid");
  }
  return manifest;
}

export function requireAsset(manifest, id) {
  const asset = manifest.assets[id];
  if (!asset) {
    throw new Error(`Unknown logical asset id: ${id}`);
  }
  if (!asset.path) {
    throw new Error(`Asset ${id} has no path in the manifest`);
  }
  return asset;
}

export function assetUrl(manifestUrl, asset) {
  return new URL(asset.path, manifestUrl);
}

export async function loadImageAssets(manifest, manifestUrl, ids) {
  const images = {};
  await Promise.all(ids.map(async (id) => {
    const asset = requireAsset(manifest, id);
    const url = assetUrl(manifestUrl, asset);
    const image = new Image();
    image.src = url.href;
    await image.decode();
    images[id] = image;
  }));
  return images;
}
