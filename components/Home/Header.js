import { Dimensions, Image, StyleSheet, TextInput, View } from 'react-native';

export default function Header() {
  return (
    <View style = {{display: 'flex', flexDirection: 'row',
      justifyContent: 'space-evenly', alignItems: 'center', paddingTop: 20}}>
      <Image source ={require('../../assets/images/logo.png')} 
        style = {styles.logo}
      />
      <View>
        <TextInput placeholder='Search' 
        style = {styles.SearchBar} 
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    logo: {
        width: 50,
        height: 50
    },
    SearchBar: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 4,
        borderRadius: 50,
        paddingLeft: 10,
        width: Dimensions.get('window').width * 0.7,
        height: 40
    }

});