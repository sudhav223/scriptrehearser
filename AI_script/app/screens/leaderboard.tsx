import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getCurrentUserID } from '../services/dbservice';
import { getprogress } from '../services/appwriteservices';

type ProgressDoc = {
  $id: string;
  scriptid: string;
  userid: string;
  progress: number;
  accuracy: number;
  username: string;
  title: string;
};

const Leaderboard = () => {
  const { docID } = useLocalSearchParams<{ docID: string }>();
  const [data, setData] = useState<ProgressDoc[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      init();
    }, [])
  );

  const init = async () => {
    const uid = await getCurrentUserID();
    setCurrentUserId(uid);
    const docs = await getprogress(docID);

    console.log("progress data :", data)

    // sort it by progress  in case if they are same sort by accuracy even if accuracy and progress are same sort by username
    docs.sort((a, b) => {
  if (b.progress !== a.progress) return b.progress - a.progress;
  if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
  return a.username.localeCompare(b.username);
});
    setData(docs);
  };

  const renderItem = ({ item, index }: { item: ProgressDoc; index: number }) => {
    const isCurrentUser = item.userid === currentUserId;
    return (
      <View style={[styles.card, isCurrentUser && styles.currentUserCard]}>
        <View style={styles.rankCircle}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leader Board</Text>
      {data[0] && (
      <View style={styles.scriptTitleBox}>
        <Text style={styles.scriptTitle}>{data[0].title}</Text>
      </View>
    )}
      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
  },
  scriptTitleBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  scriptTitle: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  currentUserCard: {
    backgroundColor: '#e3f2fd',
  },
  rankCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: '#3f51b5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  progressText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
