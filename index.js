import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  PermissionsAndroid,
  BackHandler,
  Alert,
  ImageBackground,
  Modal,
  RefreshControl,
} from 'react-native';
import styles from './styles';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cityList } from '../../Components/Constants/city';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Home = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [list, setList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [cityInputVisible, setCityInputVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const LoadLocation = async () => {
      const loc = await AsyncStorage.getItem("LOCATION");
      setSelectedCity(loc);
      getData(); // Call getData after updating the state
    };
    LoadLocation();
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    getData();
    setRefreshing(false);
  };

  const handleLocationPress = () => {
    setCityInputVisible(true);
  };

  const handleCitySubmit = (city) => {
    setSelectedCity(city);
    AsyncStorage.setItem("LOCATION", city);
    setCityInputVisible(false);
  };

  const renderCityInput = () => {
    return (
      <Modal
        animationType="slide"
        visible={cityInputVisible}
        transparent >
        <View style={styles.ModalView}>
          <Picker
            mode='dropdown'
            style={{
              height: 50,
              width: '100%',
              backgroundColor: '#cccccc60',
              marginBottom: 20
            }}
            selectedValue={selectedCity}
            onValueChange={(itemValue) => setSelectedCity(itemValue)}
          >
            {cityList.map((cityList) => (
              <Picker.Item key={cityList.value} label={cityList.label} value={cityList.value} />
            ))}

          </Picker>
          <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
            <TouchableOpacity onPress={() => handleCitySubmit(selectedCity)}
              style={styles.SubmitButton}>
              <Text style={{ color: '#fff' }}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCityInputVisible(false)}
              style={styles.CancelButton}>
              <Text style={{ color: '#228b22' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const getData = () => {
    firebase
      .database()
      .ref(`posts/`)
      .on('value', (snapshot) => {
        const data = snapshot.val();

        if (data !== null && data !== undefined) {
          let responselist = Object.values(data) || [];
          setList(responselist);

          // Filter properties based on the selected city (case-insensitive)
          const recommended = responselist.filter(item =>
            item.city && item.city.toLowerCase() === selectedCity?.toLowerCase()
          );
          setRecommendedProperties(recommended);
        } else {
          // Handle the case when data is null or undefined
          setList([]);
          setRecommendedProperties([]);
        }
      });
  };



  const handleDetailContainer = (item) => {
    navigation.navigate('PropertyDetail', { selectedItem: item });
  };

  const handleSearch = (text) => {
    setSearchText(text);
    // Filter the data based on the search text
    const filtered = list.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const HandleBackPress = () => {
    Alert.alert(
      'Exit RentSpot',
      'Are you sure you want to exit !',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      {
        cancelable: false,
      }
    );
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      HandleBackPress
    );

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', HandleBackPress);
  }, []);

  const userName = auth().currentUser.displayName;
  const profilePic = auth().currentUser.photoURL;
  const mail = auth().currentUser.email;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
        {profilePic !== null ? (
          <Image
            resizeMode='contain'
            source={{ uri: profilePic }}
            style={styles.UserImage}
          />
        ) : (
          <Image
            source={require('../../Assets/man.png')}
            style={styles.Image1}
          />
        )}

        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: wp(3),
            justifyContent: 'space-between',
            width: '80%',
          }}
        >
          <View >
            <Text style={{ margin: 10, fontSize: wp(5), color: '#000', left: wp(3), marginTop: 20,maxWidth:160 }}>
              {userName}
            </Text>
            <Text style={{ fontSize: wp(3.5), left: 20, top: -15,maxWidth:180 }}>{mail}</Text>

          </View>
          <View style={styles.LocationBox}>
            <Image
              source={require('../../Assets/location.png')}
              style={{ height: 20, width: 20, tintColor: '#228b22',marginHorizontal:6 }} />
            <TouchableOpacity onPress={() => handleLocationPress()}>
              <Text style={{ marginHorizontal: 0, fontSize: wp(4),maxWidth:70 }}>
                {selectedCity === null ? 'Location' : selectedCity}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {cityInputVisible && renderCityInput()}
      </View>
      <View
        style={styles.searchView}
      >
        <View
          style={styles.searchInsideView}
        >
          <Icon name='search' size={20} top={12} left={20} />
          <TextInput
            style={styles.SearchInput}
            placeholder='Search'
            keyboardType='web-search'
            value={searchText}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.SearchButton}
          >
            <Icon name='filter' color={'#228b22'} size={25} top={12} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.HeadingText}>Featured</Text>

        {searchText ? (
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={filteredData}
            renderItem={({ item }) => (
              <RenderListItem
                item={item}
                handleDetailContainer={handleDetailContainer}
              />
            )}
          />
        ) : list && list.length > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={list}
            renderItem={({ item }) => (
              <RenderListItem
                item={item}
                handleDetailContainer={handleDetailContainer}
              />
            )}
          />

        ) : (
          <View style={{ width: '100%', }}>
            <Text style={{ textAlign: 'center', top: 50, fontSize: wp(4), fontWeight: '600', marginBottom: 30 }}>
              Try Reloading or check internet Connection!
            </Text>
            <ActivityIndicator size={50} marginTop={50} marginBottom={30  } />
          </View>
        )}
        <View>
          <Text style={styles.HeadingText}>Recommended</Text>
          {searchText ? (
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal
              data={filteredData}
              renderItem={({ item }) => (
                <RenderListItem
                  item={item}
                  handleDetailContainer={handleDetailContainer}
                />
              )}
            />
          ) : recommendedProperties && recommendedProperties.length > 0 ? (

            <FlatList
              contentContainerStyle={{ marginBottom: 20 }}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recommendedProperties}
              renderItem={({ item }) => (
                <RenderListItem
                  item={item}
                  handleDetailContainer={handleDetailContainer}
                />
              )}
            />
            
          ) : (
            <View style={{ width: '100%',  }}>
              <Text style={{ textAlign: 'center', fontSize: wp(4), fontWeight: '600', marginBottom: 20 }}>
                Loading recommended properties in {selectedCity}.
              </Text>
              <TouchableOpacity
                onPress={() => handleLocationPress()}
                style={{ alignSelf: 'center', width: '50%', padding: 10, backgroundColor: '#fff', elevation: 2, borderRadius: 10 }}>
                <Text style={{ textAlign: 'center', color: '#228b22', fontSize: wp(3), fontWeight: '500' }}>Change Location</Text>
              </TouchableOpacity>
              <Text style={{ textAlign: 'center', fontSize: wp(4), fontWeight: '600', marginVertical: 20 }}>
                or Reload Screen
              </Text>
            </View>

          )}
        </View>
      </ScrollView>
    </View>
  );
};


const RenderListItem = ({ item, handleDetailContainer }) => (
  <TouchableOpacity
    style={{ marginBottom: 20 }}
    onPress={() => handleDetailContainer(item)}>
    <View style={styles.DetailContainer}>
      <ImageBackground
        style={styles.Image}
        source={{ uri: item.image && item.image.length > 0 ? item.image[0] : null }}
      >
        <View style={{ flexDirection: 'row-reverse' }}>
          <Image
            style={{ tintColor: '#fff', margin: 15, height: 24, width: 24 }}
            source={require('../../Assets/heart.png')}
          />
        </View>
        <View
          style={{
            backgroundColor: '#228b2290',
            position: 'absolute',
            bottom: 0,
            width: '100%',
          }}
        >
          <View style={styles.TitleContainer}>
            <View>
              <Text style={{ color: '#ffffff', left: 10, fontSize: wp(5), fontWeight: '400' }}>
                {item.name}
              </Text>
            </View>
          </View>
          <Text style={{ left: 10, fontSize: wp(3.5), color: '#ffffff', maxWidth: 250 }}>{item.address}</Text>
          <View style={{ marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '50%' }}>
              <Text style={{ color: '#ffffff', left: 10, fontSize: wp(3.2) }}>
                Price: {item.price} PKR/month
              </Text>
            </View>
            <View
              style={{
                width: '40%',
                flexDirection: 'row',
                right: 20,
                justifyContent: 'center',
              }}
            >
              <Image
                style={{ height: wp(5), width: wp(5), tintColor: 'orange', left: 10 }}
                source={require('../../Assets/location.png')}
              />
              <Text style={{ color: '#ffffff', left: 10, fontSize: wp(3), lineHeight: 20, marginHorizontal: 6 }}>
                {item.city}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  </TouchableOpacity>
);

export default Home;
