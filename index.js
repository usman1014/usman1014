import React, { useEffect, useState } from 'react'
import {

    Text,
    View,
    TextInput,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Alert,
    BackHandler,
} from 'react-native';
import styles from './styles';
import Icons from 'react-native-vector-icons/FontAwesome5'
import Icons2 from 'react-native-vector-icons/Entypo'
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import string from '../../Components/Constants/LocalizeStrings';


const Login = ({ navigation }) => {

    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [list, setList] = useState([]);



    const gotoHome = async () => {
        // await AsyncStorage.setItem('Uid', list);
        // await AsyncStorage.setItem('EMAIL', email);
        await AsyncStorage.setItem('LoginKey', JSON.stringify(true));
        navigation.navigate('Home');
        setEmail("");
        setPassword("");

    }

    const LoginButton = async () => {
        try {
            // Check if email and password are not empty or null
            if (!email || !password) {
                Alert.alert('Message', 'Please enter both email and password');
                return;
            }

            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (user.emailVerified) {
                gotoHome();
            } else {
                Alert.alert('Message', 'Please verify your email checkout inbox of your email');
                auth().currentUser.sendEmailVerification()

            }
        } catch (error) {
            // Handle login errors
            // console.error('Login Error:', error.message);

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                Alert.alert('Message', 'Invalid email or password!');
            } else {
                Alert.alert('Message', 'Login failed. Please try again later.');
            }
        }
    };

    const HandleBackPress = () => {

        Alert.alert('Exit RentSpot', 'Are you sure you want to exit !',
            [{
                text: 'Cancel',

                style: 'cancel',
            },
            {
                text: 'Yes',
                onPress: () =>
                    BackHandler.exitApp(),

            },
            ],
            {
                cancelable: false,
            },);
        return true;

    }
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', HandleBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', HandleBackPress)
    }, []);

    return (


        <SafeAreaView
            style={styles.MainView}>
            <View style={{ width: '100%', height: 60, padding: 10, backgroundColor: '#228b22', justifyContent: 'space-between', flexDirection: 'row' }}>
                <Text style={{ color: '#fff', fontSize: 20, left: 20, }}>Login</Text>
                <Text
                    onPress={() => navigation.navigate('AdminLogin')}
                    style={{ color: '#ffffff', fontSize: 16, left: -20, lineHeight: 30 }}>{string['Admin Login']}</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.upperView}>
                <Image
                    resizeMode='contain'
                    style={styles.Image}
                    source={require('../../Assets/logo.png')}>
                </Image>



                <Text style={styles.HeadingText1}>{string['Login Here']}</Text>

                <View style={styles.InputView}>
                    <Icons2 name='mail' size={25} color={'#228b22'} />
                    <TextInput
                        style={styles.Input}
                        placeholder={string.Email}
                        placeholderTextColor={'#00000060'}
                        value={email}
                        onChangeText={text => setEmail(text)}
                    />
                </View>



                <View style={styles.InputView}>
                    <Icons name='lock' size={20} color={'#228b22'} />
                    <TextInput
                    secureTextEntry
                        style={styles.Input}
                        placeholder={string.Password}
                        placeholderTextColor={'#00000060'}
                        value={password}
                        onChangeText={text => setPassword(text)}
                    />
                </View>

                <TouchableOpacity style={styles.ForgetButton}
                    onPress={() => navigation.navigate('ForgetPassword')}>
                    <Text style={styles.ForgetButtonText}>{string['Forget Password']}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Button}
                    onPress={() => LoginButton()}>
                    <Text style={styles.ButtonText}>{string['Sign in']}</Text>
                </TouchableOpacity>

                <View style={styles.Signincontainer}>
                    <Text style={styles.SignupText}>{string['Dont have an account?']}</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Signup')}
                    >

                        <Text style={styles.SignupButton}> {string['Sign up']}</Text>

                    </TouchableOpacity>
                </View>


            </ScrollView>
        </SafeAreaView>

    )
}

export default Login;
