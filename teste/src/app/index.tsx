import {View, Text, StyleSheet} from "react-native"
import {Link} from "expo-router"

export default function Index(){
    return (
        <View style={styles.container}>
            
       <Link href= "/singup" style={styles.title}>Faça seu cadastro</Link>

        </View>

    )
}

const styles = StyleSheet.create ({

container: { flex: 1, justifyContent: "center", alignItems: "center"},

title: { fontSize: 22, fontWeight: "bold"}, 

})