import {View, Text, StyleSheet} from "react-native"
import {Link} from "expo-router"

export default function Index(){
    return (
        <View style={styles.container}>
                
         <Text style={styles.title}> Cadastrado </Text>

        </View>

    )
}

const styles = StyleSheet.create ({

container: { flex: 1, justifyContent: "center", alignItems: "center"},

title: { fontSize: 22, fontWeight: "bold"}, 

})