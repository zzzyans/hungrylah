import { Feather, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import CustomKeyboardView from '../components/CustomKeyboardView';
import Loading from '../components/Loading';
import { useAuth } from '../context/authContext';

export default function SignUp() {
  const router = useRouter();
  const {register} = useAuth();
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");

  const handleRegister = async ()=>{
    if (!emailRef.current || !passwordRef.current || !usernameRef.current || !confirmPasswordRef.current) {
      Alert.alert('Sign Up', "Please fill in all the fields.");
      return;
    }

    if (passwordRef.current !== confirmPasswordRef.current) {
      Alert.alert('Sign Up', "Passwords do not match.");
      return;
    }

    if (passwordRef.current.length < 8) {
      Alert.alert('Sign Up', "Password should be at least 8 characters long.");
      return;
    }

    setLoading(true);

    let response = await register(emailRef.current, passwordRef.current, usernameRef.current);
    setLoading(false);

    console.log('got result: ', response);
    if (!response.success) {
      Alert.alert('Sign Up', response.msg);
    } 

    router.replace('/onboarding/cuisinePreferences');

  }

  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View style={{paddingTop: hp(10), paddingHorizontal: wp(5), backgroundColor: "#F7E6AE"}} className="flex-1 gap-12">
        {/* signIn Image */}
        <View className="items-center">
          <Image style={{height: hp(20)}} resizeMode='contain' source={require('../assets/images/logo.png')} />
        </View>

        <View className="gap-10">
          <Text style={{fontSize: hp(4)}} className="font-bold tracking-wider text-center text-neutral-800">Sign Up</Text>
          {/* inputs */}
          <View className="gap-3">

            <View style={{height: hp(7), backgroundColor: "white", borderColor: "#B1EDE3", borderWidth: 1}} className="flex-row gap-4 px-4 items-center rounded-2xl">
              <Feather name="user" size={hp(2.7)} color="#C0A9D9" />
              <TextInput
                onChangeText={value=> usernameRef.current=value}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder='Username'
                placeholderTextColor={'gray'}
                textContentType="username"
                autoCapitalize="none"
              />
            </View>

            <View style={{height: hp(7), backgroundColor: "white", borderColor: "#B1EDE3", borderWidth: 1}} className="flex-row gap-4 px-4 items-center rounded-2xl">
              <Octicons name="mail" size={hp(2.7)} color="#C0A9D9" />
              <TextInput
                onChangeText={value=> emailRef.current=value}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder='Email Address'
                placeholderTextColor={'gray'}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />
            </View>

            <View style={{height: hp(7), backgroundColor: "white", borderColor: "#B1EDE3", borderWidth: 1}} className="flex-row gap-4 px-4 items-center rounded-2xl">
              <Octicons name="lock" size={hp(2.7)} color="#C0A9D9" />
              <TextInput
                onChangeText={value=> passwordRef.current=value}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder='Password'
                secureTextEntry
                placeholderTextColor={'gray'}
              />
            </View>

            <View style={{height: hp(7), backgroundColor: "white", borderColor: "#B1EDE3", borderWidth: 1}} className="flex-row gap-4 px-4 items-center rounded-2xl">
              <Octicons name="lock" size={hp(2.7)} color="#C0A9D9" />
              <TextInput
                onChangeText={value=> confirmPasswordRef.current=value}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder='Confirm Password'
                secureTextEntry
                placeholderTextColor={'gray'}
              />
            </View>

            {/* submit button */}
            <View style={{marginTop: hp(1.5)}}>
              {
                loading? (
                  <View className="flex-row justify-center">
                    <Loading size={hp(6.5)} color="#8EBEE0" /> 
                  </View>
                ):(
                  <TouchableOpacity onPress={handleRegister} style={{height: hp(6.5), backgroundColor: "#8EBEE0"}} className="rounded-xl justify-center items-center"> 
                    <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                )
              }
            </View>

            {/* sign in text */}
            <View className="flex-row justify-center">
              <Text style={{fontSize: hp(1.8)}} className="font-semibold text-neutral-500">Already have an account? </Text>
              <Pressable onPress={()=> router.push('signIn')}>
                <Text style={{fontSize: hp(1.8)}} className="font-semibold text-yellow-600">Sign In</Text>
              </Pressable>
              
            </View>

          </View>
          
        </View>
      </View>
    </CustomKeyboardView>
  )
}