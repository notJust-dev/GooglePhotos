import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import mime from 'mime';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthProvider';

import { supabase } from '~/utils/supabase';

type MediaContextType = {
  assets: MediaLibrary.Asset[];
  loadLocalAssets: () => void;
  getAssetById: (id: string) => MediaLibrary.Asset | undefined;
  syncToCloud: (asset: MediaLibrary.Asset) => void;
};

const MediaContext = createContext<MediaContextType>({
  assets: [],
  loadLocalAssets: () => {},
  getAssetById: () => undefined,
  syncToCloud: () => {},
});

export default function MediaContextProvider({ children }: PropsWithChildren) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string>();
  const [loading, setLoading] = useState(false);

  const [remoteAssets, setRemoteAssets] = useState([]);

  const assets = [...remoteAssets, ...localAssets.filter((assets) => !assets.isBackedUp)];

  const { user } = useAuth();

  useEffect(() => {
    loadRemoteAssets();
  }, []);

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permissionResponse?.status === 'granted') {
      loadLocalAssets();
    }
  }, [permissionResponse]);

  const loadRemoteAssets = async () => {
    const { data, error } = await supabase.from('assets').select('*');
    setRemoteAssets(data);
    console.log('remote');
    console.log(data);
  };

  const loadLocalAssets = async () => {
    if (loading || !hasNextPage) {
      return;
    }
    setLoading(true);
    const assetsPage = await MediaLibrary.getAssetsAsync({
      after: endCursor,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    });
    // console.log(JSON.stringify(assetsPage, null, 2));

    const newAssets = await Promise.all(
      assetsPage.assets.map(async (asset) => {
        // check if asset is already backed up
        const { count } = await supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .eq('id', asset.id);

        let uri = asset.uri;
        if (asset.mediaType === 'video') {
          uri = (await MediaLibrary.getAssetInfoAsync(asset)).localUri;
        }
        return {
          ...asset,
          uri,
          isBackedUp: !!count && count > 0,
          isLocalAsset: true,
        };
      })
    );

    setLocalAssets((existingItems) => [...existingItems, ...newAssets]);

    setHasNextPage(assetsPage.hasNextPage);
    setEndCursor(assetsPage.endCursor);
    setLoading(false);
  };

  const getAssetById = (id: string) => {
    return assets.find((asset) => asset.id === id);
  };

  const syncToCloud = async (asset: MediaLibrary.Asset) => {
    // upload to Supabase storage
    const info = await MediaLibrary.getAssetInfoAsync(asset);

    if (!info.localUri || !user) {
      return;
    }

    const base64string = await FileSystem.readAsStringAsync(info.localUri, { encoding: 'base64' });
    const arrayBuffer = decode(base64string);

    const { data: storedFile, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(`${user.id}/${asset.filename}`, arrayBuffer, {
        contentType: mime.getType(asset.filename) ?? 'image/jpeg',
        upsert: true,
      });
    if (storedFile) {
      const { data, error } = await supabase
        .from('assets')
        .upsert({
          id: asset.id,
          path: storedFile.path,
          user_id: user.id,
          mediaType: asset.mediaType,
          object_id: storedFile.id,
        })
        .select()
        .single();
      console.log(data, error);
    }
  };

  return (
    <MediaContext.Provider value={{ assets, loadLocalAssets, getAssetById, syncToCloud }}>
      {children}
    </MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);
