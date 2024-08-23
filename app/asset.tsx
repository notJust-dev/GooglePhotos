import AntDesign from '@expo/vector-icons/AntDesign';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { useMedia } from '~/providers/MediaProvider';
import { getImagekitUrlFromPath } from '~/utils/imagekit';

export default function AssetPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAssetById, syncToCloud } = useMedia();

  const asset = getAssetById(id);

  console.log(JSON.stringify(asset, null, 2));

  if (!asset) {
    return <Text>Asset not found!</Text>;
  }

  let uri;
  if (asset.isLocalAsset) {
    uri = asset.uri;
  } else {
    uri = getImagekitUrlFromPath(asset.path, [
      { width: 500 },
      // {
      //   raw: 'l-text,i-notJust.dev,co-ffffff,fs-30,l-end',
      // },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Photo',
          headerRight: () => (
            <AntDesign
              onPress={() => syncToCloud(asset)}
              name="cloudupload"
              size={24}
              color="black"
            />
          ),
        }}
      />
      {asset.mediaType === 'photo' ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
      ) : (
        <Video
          style={{ width: '100%', height: '100%' }}
          source={{
            uri,
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      )}
    </>
  );
}
