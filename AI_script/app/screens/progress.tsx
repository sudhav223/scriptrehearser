import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressBubble from '../components/ProgressBubble';
import { BarChart } from 'react-native-gifted-charts';

const ProgressScreen = () => {
  const { scriptId } = useLocalSearchParams<{ scriptId: string }>();
  const [latestAttempt, setLatestAttempt] = useState<any | null>(null);
  const [barData, setBarData] = useState<any[]>([]); 
  const [accuracyBarData, setAccuracyBarData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const key = `rehearsalResults_${scriptId}`;
        const stored = await AsyncStorage.getItem(key);
        const parsed = stored ? JSON.parse(stored) : [];

        if (parsed.length > 0) {
          const last = parsed[parsed.length - 1];
          setLatestAttempt(last);
          console.log('Showing last attempt:', last);
          const lastFiveAttempts = parsed.slice(-5);

        // Extract and log the progress % of the last 5 attempts
        const progressarray = lastFiveAttempts.map((attempt: any) => attempt.progress);
        const groupedData = lastFiveAttempts.map((attempt: any, index: number) => [
          {
            value: attempt.progress, // Progress bar
            label: `${index + 1}`,
            frontColor: '#4e73df', // Color for the progress bar
            spacing: 2,
          },
          {
            value: attempt.accuracy, // Accuracy bar
            frontColor: '#28a745', // Color for the accuracy bar
            spacing: 2,
          },
        ]);

        setBarData(groupedData.flat()); // Flattening to create a single array for grouped bars
        //setBarData(progressValues);
        const accuracyarray = lastFiveAttempts.map((attempt: any) => attempt.accuracy);
        const accuracyValues = lastFiveAttempts.map((attempt: any, index: number) => ({
          value: attempt.accuracy,
          label: `Attempt ${index + 1}`
        }));

        setAccuracyBarData(accuracyValues);
        //console.log('Last 5 progress values:', progressarray);
        //console.log('Last 5 accuracy values:', accuracyarray);

        }
      } catch (err) {
        console.error(' Error fetching progress data:', err);
      }
    };

    fetchLatest();
  }, [scriptId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {latestAttempt ? (
        <>
        <View style={styles.container}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
        Progress Bar Chart
      </Text>
      
      <BarChart
          data={barData} // Data for grouped bars (progress and accuracy)
          barWidth={15} // Width of each bar
          spacing={44} // Spacing between bars
          width={400} // Width of the bar chart 
          height={220} // Height of the bar chart 
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: 'gray' }}
          xAxisLabelTextStyle={{ color: 'black' }} // Style for X-axis labels
          labelWidth={30}
          noOfSections={4}
          maxValue={100} // Max value for progress and accuracy
        />
        </View>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
            Last Attempt - Accuracy: {latestAttempt.accuracy}% | Progress: {latestAttempt.progress}%
          </Text>

          {latestAttempt.attempts.map((line: any, index: number) => (
            <View key={index} style={{ marginBottom: 14 }}>
              {/* Original line */}
              <ProgressBubble
                label="Original"
                content={line.original}
              />
              {/* Spoken line with color */}
              <ProgressBubble
                label="You"
                content={line.spoken || "(didn't speak)"}
                color={line.color}
              />
            </View>
          ))}
        </>
      ) : (
        <Text style={{ textAlign: 'center' }}>No progress found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
   
  },
});

export default ProgressScreen;
