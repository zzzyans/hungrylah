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

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const usernameRef = useRef("");

  const handleRegister = async ()=>{
    if (!emailRef.current || !passwordRef.current || !usernameRef.current) {
      Alert.alert('Sign In', "Please fill in all the fields.");
      return;
    }

    setLoading(true);

    let response = await register(emailRef.current, passwordRef.current, usernameRef.current);
    setLoading(false);

    console.log('got result: ', response);
    if (!response.success) {
      Alert.alert('Sign Up', response.msg);
    }
    else {
      // redirect to home
      router.replace('home');
    }
  }

  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View style={{paddingTop: hp(7), paddingHorizontal: wp(5)}} className="flex-1 gap-12">
        {/* signIn Image */}
        <View className="items-center">
          <Image style={{height: hp(20)}} resizeMode='contain' source={require('../assets/images/logo.png')} />
        </View>

        <View className="gap-10">
          <Text style={{fontSize: hp(4)}} className="font-bold tracking-wider text-center text-netural-800">Sign Up</Text>
          {/* inputs */}
          <View className="gap-4">

            <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
              <Feather name="user" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value=> usernameRef.current=value}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder='Username'
                placeholderTextColor={'gray'}
              />
            </View>

            <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
              <Octicons name="mail" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value=> emailRef.current=value}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder='Email Address'
                placeholderTextColor={'gray'}
              />
            </View>

            <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
              <Octicons name="lock" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value=> passwordRef.current=value}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder='Password'
                secureTextEntry
                placeholderTextColor={'gray'}
              />
            </View>

            {/* submit button */}
            <View>
              {
                loading? (
                  <View className="flex-row justify-center">
                    <Loading size={hp(6.5)} /> 
                  </View>
                ):(
                  <TouchableOpacity onPress={handleRegister} style={{height: hp(6.5)}} className="bg-yellow-500 rounded-xl justify-center items-center"> 
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