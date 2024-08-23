import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import { FlatList, Pressable } from 'react-native';

import { useMedia } from '~/providers/MediaProvider';
import { getImagekitUrlFromPath } from '~/utils/imagekit';

export default function Home() {
  const { assets, loadLocalAssets } = useMedia();

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />

      <FlatList
        data={assets}
        numColumns={4}
        contentContainerClassName="gap-[2px]"
        columnWrapperClassName="gap-[2px]"
        onEndReached={loadLocalAssets}
        onEndReachedThreshold={1}
        renderItem={({ item }) => (
          <Link href={`/asset?id=${item.id}`} asChild>
            <Pressable style={{ width: '25%' }}>
              <Image
                source={{
                  uri: item.isLocalAsset
                    ? item.uri
                    : getImagekitUrlFromPath(item.path, [{ width: 200, height: 200 }]),
                }}
                style={{ width: '100%', aspectRatio: 1 }}
              />
              {!item.isBackedUp && item.isLocalAsset && (
                <AntDesign
                  name="cloudupload"
                  size={18}
                  color="white"
                  className="absolute bottom-1 right-1"
                />
              )}
            </Pressable>
          </Link>
        )}
      />
    </>
  );
}
