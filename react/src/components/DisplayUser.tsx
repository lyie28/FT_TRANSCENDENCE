import FriendUserProfilExtended from "./FriendUserProfileExtended";
import { ModalWindow } from "./ModaleWindow/LogiqueModale2";
import MaterialIcon from 'material-icons-react';
import { useState } from "react";
import { socket } from "./Socket";
import axios from "axios";

const displayUserStyle = {
	display: "flex",
	alignItems:"center",
	flexDirection: "row" as "row",
}

const  DisplayUser = ({userConnected, userSelected, isFriend, togglePlay, togglePlay2}) => {
		//---
		const [reveleProfil, setReveleProfil] = useState(false);
		const toggleProfil = () => {setReveleProfil(!reveleProfil);}
		const [color, setColor] = useState(userSelected.color);
		const [playing, setPlaying] = useState(userSelected.color === 'rgba(255, 0, 255, 0.9)');
		const [playing2, setPlaying2] = useState(userConnected.color === 'rgba(255, 0, 255, 0.9)');
		//---
		const [bloc, setBlock] = useState(false);

		axios.get("http://localhost:3000/users/getColor/" + userSelected.id, {withCredentials:true}).then((res) => {
			setPlaying(res.data === 'rgba(255, 0, 255, 0.9)');
				setColor(res.data)
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
					if (error.response.status === 403)
							window.location.href = "http://localhost:4200/";
					else
							console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.request)
					console.log("Unknown error");
			else
					console.log(error.message);
		})

		axios.get("http://localhost:3000/users/getColor/" + userConnected.id, {withCredentials:true}).then((res) => {
				setPlaying2(res.data === 'rgba(255, 0, 255, 0.9)')
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
					if (error.response.status === 403)
							window.location.href = "http://localhost:4200/";
					else
							console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.request)
					console.log("Unknown error");
			else
					console.log(error.message);
		})

		axios.get("http://localhost:3000/users/isBlock/" +  userConnected.id + "/"+ userSelected.id, {withCredentials:true}).then((res) => {
			if (res.data === false) {
				setBlock(false);
			}
			else {
				setBlock(true);
			}
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
						window.location.href = "http://localhost:4200/";
				else
						console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.request)
					console.log("Unknown error");
			else
					console.log(error.message);
		})

		socket.on("changeColor", data => {
			axios.get("http://localhost:3000/users/getColor/" + userSelected.id, {withCredentials:true}).then((res) =>{
				setPlaying(res.data === 'rgba(255, 0, 255, 0.9)');
				setColor(res.data)
			 })
			.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
						window.location.href = "http://localhost:4200/";
				else
						console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.request)
					console.log("Unknown error");
			else
					console.log(error.message);
			})
		});

		/* Lancer un message prive */
		const beginChat = (friend) => {
			const roomname = friend.id < userConnected.id ? friend.id + '.' + userConnected.id : userConnected.id + '.' + friend.id;
			socket.emit('addsalon', userConnected.id, true, true, roomname, friend.login);
		};

		/* Ajouter en ami */
		const sendFriendRequest = event => {
				axios.get("http://localhost:3000/friends/friendRequest/send/" + userSelected.id, {withCredentials:true}).then((res) => {
					const mess = res.data.error;
				/*Si la fonction send a retourne un erreur ?*/
					if (typeof(mess) === 'string')
					{
							const str = JSON.stringify(mess);
							/*affiche l'erreur*/
							alert(str);
					}
					else {
							socket.emit('friendrequestnotif', {id: userSelected.id, new: true});
							/*sinon, tout s'est bien passe et on affiche le suivant:*/
							alert("Friend request sent");
					}
				})
				.catch(error => {
					if (error.response && error.response.status)
					{
						if (error.response.status === 403)
								window.location.href = "http://localhost:4200/";
						else
								console.log("Error: ", error.response.code, " : ", error.response.message);
					}
					else if (error.request)
							console.log("Unknown error");
					else
							console.log(error.message);
			})
		}

	//set version of game when defeat someone and send the request to other user
	const defeat = () => {
		socket.emit('defeat', userConnected, userSelected.id, 0);
		togglePlay();
	}

	const block = () => {
		axios.get("http://localhost:3000/users/setBlock/" + userConnected.id + "/"+ userSelected.id, {withCredentials:true}).then((res) => {
			setBlock(true);
			socket.emit("just-block", userConnected);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
						window.location.href = "http://localhost:4200/";
				else
						console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.request)
					console.log("Unknown error");
			else
					console.log(error.message);
		})
	}	
	
	const watch = () => {
			socket.emit("watch-friend", userSelected.id, userConnected);
			togglePlay2();
	}

	const  unblock = () => {
		axios.get("http://localhost:3000/users/setUnblock/" + userConnected.id + "/"+ userSelected.id, {withCredentials:true}).then((res) => {
			setBlock(false);
			socket.emit("just-block", userConnected);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
						window.location.href = "http://localhost:4200/";
				else
						console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.request)
					console.log("Unknown error");
			else
					console.log(error.message);
		})
	}


    /* Affiche un user et toute les options associee. Regarder le profil, add(si pas amis), chat, etc... */
    if(isFriend)
    {
      return(

        <div style={displayUserStyle}>
          <svg width="48" height="40" viewBox='0 0 45 40'>
          <foreignObject x="0" y="0" width="45" height="40" >

			<img  onClick={toggleProfil} style={{maxWidth: "40px", maxHeight: "40px", borderRadius: '100%' }} alt="user-avatar" src={userSelected.avatar}/>
          </foreignObject>
          <rect width="11" height="11" x="30" y="29" rx="5" ry="5" fill={color}></rect></svg>
        
		<button style={{display: "inline", textDecoration: "underline"}} onClick={toggleProfil}>
          {userSelected.login}</button>
            <button><MaterialIcon title="Direct message" icon="chat" onClick={() => {beginChat(userSelected)}} /></button> 
            {!playing2 && <button><MaterialIcon title="Defeat" icon="videogame_asset" onClick={defeat} /></button>}
            <button>{bloc ? <i onClick={unblock} ><MaterialIcon title="Unblock" icon="block"/>(Unblock)</i> : <i onClick={block}><MaterialIcon title="Block" icon="block"/>(Block)</i>}</button>
            {playing && !playing2 && <button> <i onClick={watch}><MaterialIcon title="Watch a match" icon="connected_tv"/></i> </button>}
          <ModalWindow revele={reveleProfil} setRevele={toggleProfil}>
            <FriendUserProfilExtended Value={userSelected.login}/>
          </ModalWindow>
        </div>
      );
    }
    else
    {
      return(
        <div style={displayUserStyle}>
          <svg width="48" height="40" viewBox='0 0 45 40'>
          <foreignObject x="0" y="0" width="45" height="40" >
        	<img  onClick={toggleProfil} style={{maxWidth: "40px", maxHeight: "40px", borderRadius: '100%' }} alt="user-avatar" src={userSelected.avatar}/>
          </foreignObject>
          <rect width="11" height="11" x="30" y="29" rx="5" ry="5" fill={color}></rect></svg>
		
          <p className="linkLog" style={{display: "inline", textDecoration: "underline"}} onClick={toggleProfil}>{userSelected.login}</p> 
            <button><MaterialIcon title="Add friend" icon="person_add" onClick={sendFriendRequest} /></button>
            <button><MaterialIcon title="Direct message"  icon="chat" onClick={() => {beginChat(userSelected)}} /></button> 
            {!playing2 && <button><MaterialIcon  title="Defeat" icon="videogame_asset" onClick={defeat} /></button>}
            <button>{bloc ? <i onClick={unblock} ><MaterialIcon title="Unblock" icon="block"/>(Unblock)</i> : <i onClick={block}><MaterialIcon title="Block" icon="block"/>(Block)</i>}</button>
            {playing && !playing2 && <button> <i onClick={watch}><MaterialIcon icon="connected_tv"/></i> </button>}
          	<ModalWindow revele={reveleProfil} setRevele={toggleProfil}>
            <FriendUserProfilExtended Value={userSelected.login}/>
          </ModalWindow>
        </div>
      );
    }
 };

 export default DisplayUser;
 
	