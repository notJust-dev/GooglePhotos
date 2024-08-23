import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import { FlatList, Pressable } from 'react-native';

import { useMedia } from '~/providers/MediaProvider';

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
              <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1 }} />
            </Pressable>
          </Link>
        )}
      />
    </>
  );
}
