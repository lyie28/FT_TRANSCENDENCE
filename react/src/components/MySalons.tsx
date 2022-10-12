import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { socket } from "./Socket";
import { ModalWindow } from "./ModaleWindow/LogiqueModale2";
import Select from 'react-select';
import AddPrivateMember from './AddPrivateMember';
import OwnerLeave from './OwnerLeave';
import MaterialIcon from 'material-icons-react';

/* John aurelie */

const bar = {
	display: "flex",
	justifyContent: "center",
	width: '100%'
}

const channelName = {
	width: "70%",
	display: "flex",
}

const channelNameNotif = {
	width: "70%",
	display: "flex",
	backgroundColor: '#3CCF4E',
}

const salons= {
	marginRight: "8px",
}

const channel = {
	width: "100%",
	display: "flex",
	justifyContent: "space-between",
	marginBottom: "8px"
}

const addNLeave = {
	display:'flex',
	flexDirection:'row' as 'row',
	justifyContent: "space-around",

}

/* WIP : liste de display des amis et myChannels pour pouvoir changer le currentChannel*/
const MySalons = (props) => {

	const [currentSalon, setCurrentSalon] = useState([] as any);// Salon courant
	const [joinedSalons, setJoinedSalons] = useState(new Map()); //Array de tous les salons a afficher, que l'on peut selectionner
	const [message, setMessage] = useState([] as any);// Message a envoyer au salon
	const [banOption, setBan] = useState({value:0, label:'Select...'});
	const [muteOption, setMute] = useState({value:0, label:'Select...'});
	const [admOption, setAdm] = useState({value:0, label:'Select...'});
	const [unmuteOption, setUnmute] = useState({value:0, label:'Select...'});
	const [unbanOption, setUnban] = useState({value:0, label:'Select...'});
	const [unadmOption, setUnadm] = useState({value:0, label:'Select...'});
	//const [usersRoom, setUsersRoom] = useState([]);
	const [tabAdm, setTabAdm] = useState([]);
	const [tabBan, setTabBan] = useState([]);
	const [tabMute, setTabMute] = useState([]);
	const [tabNonAdm, setTabNonAdm] = useState([]);
	const [tabNonMute, setTabNonMute] = useState([]);
	const [tabNonBan, setTabNonBan] = useState([]);
	
	/* Outils d'affichage de la modale */
	const [revele, setRevele] = useState(false);
	const [revele2, setRevele2] = useState(false);
	const [revele3, setRevele3] = useState(false);
	const [revele4, setRevele4] = useState(false);
	//const [roomId, setRoomId] = useState(0);
	const toggleModal = (salon) => {setRevele(!revele);} 
	const toggleModal2 = (salon) => {setRevele2(!revele2);} 
	const toggleModal3 = (data) => {setRevele3(!revele3);} 
	const toggleModal4 = () => {setRevele4(!revele4);}
	const [err, setErr] = useState("");
   
	/*------*/
	const pwdRef = useRef(null);
	
	useEffect(() => {
		props.callBack({msg: message, curSal: currentSalon});
	}, [message, currentSalon, props])

	/*get friendlist*/
	useEffect(() => {
		axios.get("http://localhost:3000/users/userRooms/" + props.actualUser.id, {withCredentials:true}).then((res) =>{
			for (let entry of res.data)
				setJoinedSalons(map =>new Map(map.set(entry.salonName, {notif: false, dm: entry.dm, avatar: entry.displayName, roomId: entry.roomId, creator: entry.creator, owner: entry.isAdmin, private:entry.private })))
			})
			.catch(error => {
				if (error.response && error.response.status)
				{
					if (error.response.status === 403)
						window.location.href = "http://localhost:4200/";
					else
						console.log("Error: ", error.response.code, " : ", error.response.message);
				}
				else if (error.message)
					console.log(error.message);
				else
					console.log("unknown error");
			})

	}, [props.actualUser.id])

	useEffect(() => {
	}, [joinedSalons])

    useEffect(() => {
        socket.off('someoneChangedLogin');
        socket.off('new-owner');
        socket.off('just-block');
        socket.off('joinedsalon');
        socket.off('leftsalon');
    }, [joinedSalons])

    useEffect(() => {
        socket.off('chat');
        socket.off('fetchmessage');
        socket.off('someoneChangedLogin');
    }, [currentSalon])

    useEffect(() => {
        socket.on('someoneChangedLogin', data => {
            const hypoRoomName = data.otherId < props.actualUser.id ? data.otherId + '.' + props.actualUser.id : props.actualUser.id + '.' + data.otherId;
            if (joinedSalons.has(hypoRoomName))
                setJoinedSalons(map => new Map(map.set(hypoRoomName, {...map.get(hypoRoomName), avatar: data.newLogin})));
            if (currentSalon.name === hypoRoomName) {
                setCurrentSalon({...currentSalon, 'display': data.newLogin});
            }
        });
    }, [joinedSalons, currentSalon, props.actualUser.id])
		
	//Ecoute chat pour afficher tout nouveaux messages
	useEffect(() => {
		//socket.off('chat');
		if (currentSalon.length !== 0) {
			socket.on('fetchmessage', data => {
				setMessage(data);
			});
			socket.emit('fetchmessage', {nameSalon: currentSalon.name, idUser: props.actualUser.id, roomId:currentSalon.roomId});
		}

		socket.on("chat", data => {
			setMessage((message) => {
				//si l'emittingRoom est le salon courant on update les messages, sinon on met une notif si c'est indiqué par .dontNotif
			if (data.emittingRoom === currentSalon.name)
			{
				return ([...message, data]);
			}
			else if (data.dontNotif)
				return (message);
			else {
				//socket.off('leftsalon');
				setJoinedSalons(map => new Map(map.set(data.emittingRoom, {...map.get(data.emittingRoom), dm: (data.emittingRoom !== data.displayName), notif: true, avatar: data.displayName, roomId:data.roomId, creator: data.creator, private: data.private})));
				return (message);
			}
			});
		});
	}, [currentSalon, props.actualUser.id])

	//Ecoute sur le channel joinedsalon pour ajouter les salons rejoints par l'user, dans ce socket ou un autre
	useEffect(() => {
		socket.on('new-owner', data => {
			axios.get("http://localhost:3000/users/userRooms/" + props.actualUser.id, {withCredentials:true}).then((res) =>{
				for (let entry of res.data)
					setJoinedSalons(map =>new Map(map.set(entry.salonName, {notif: false, dm: entry.dm, avatar: entry.displayName, roomId: entry.roomId, creator: entry.creator, owner: entry.isAdmin, private:entry.private })))
				})
				.catch(error => {
					if (error.response && error.response.status)
					{
						if (error.response.status === 403)
							window.location.href = "http://localhost:4200/";
						else
							console.log("Error: ", error.response.code, " : ", error.response.message);
					}
					else if (error.message)
						console.log(error.message);
					else
						console.log("unknown error");
				})
			
		})
		socket.on('just-block', data => {
			const map2 = new Map(joinedSalons);
			setJoinedSalons(map2);
				setMessage([]);
				setCurrentSalon([]);
		})
		socket.on('joinedsalon', data => {
			//socket.off('leftsalon');
			setJoinedSalons(map => new Map(map.set(data.salonName, {notif: false, dm: data.dm, avatar: data.displayName, roomId: data.roomId, owner: data.isAdmin, creator : data.creator, private: data.private})));
		});
	}, [joinedSalons, props.actualUser.id])

	//Ecoute sur le channel leftsalon pour suivre les sorties de salon dans n'importe quel socket
	//Le hook étant sur joinedSalon, il faut socket.off 'leftsalon' à chaque modif de joinedSalons
	useEffect(() => {
		socket.on('leftsalon', salon => {
			
			//On crée un nouvel objet map pour déclencher les hooks lors de l'activation du setter
			joinedSalons.delete(salon);
			const map2 = new Map(joinedSalons);
			//socket.off('leftsalon');
			setJoinedSalons(map2);
			if (salon === currentSalon.name) {
				setMessage([]);
				setCurrentSalon([]);
				//socket.off('chat');
				//socket.off('fetchmessage');
			}
		});
	}, [joinedSalons, currentSalon.name])

	const handleClick = (salon) => {
		//setRoomId(salon[1].roomId)
		if ((revele|| revele2 ||revele3) && currentSalon.roomId !== 'undefined')
			 return ;
		if (salon[1].avatar !== currentSalon.display) {
			//socket.off('leftsalon');           
			setJoinedSalons(map => new Map(map.set(salon[0], {...map.get(salon[0]), notif: false, roomId:salon[1].roomId, creator:salon[1].creator, private:salon[1].private})));
			//socket.off('chat');
			//socket.off('fetchmessage');
			setCurrentSalon({name: salon[0], display: salon[1].avatar, isDm: salon[1].dm, owner: salon[1].owner, roomId: salon[1].roomId, creator:salon[1].creator, private:salon[1].private});
		}

		axios.get("http://localhost:3000/users/test/" + currentSalon.roomId, {withCredentials:true}).then((res) => {

		const tab = [];
		var def;
	
		for (let entry of res.data) {
			def= {value:entry.useId, label: entry.userLogin, admin:entry.isAdmin}
			tab.push(def);
		}
		//setUsersRoom(tab);
		whichAdm(salon[1].roomId);
		whichBan(salon[1].roomId);
		whichMute(salon[1].roomId);
		whichNonAdm(salon[1].roomId);
		whichNonBan(salon[1].roomId);
		whichNonMute(salon[1].roomId);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	};
		const whichBan = (idRoom) => {
			axios.get("http://localhost:3000/users/whichBan/" + idRoom, {withCredentials:true}).then((res) => {
				const tab = [];
				var def;
				for (let entry of res.data) {
					def= {value:entry.id, label: entry.login}
					tab.push(def);
				}
				setTabBan(tab);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	}

	const whichNonBan = (idRoom) => {
		axios.get("http://localhost:3000/users/whichNonBan/" + idRoom, {withCredentials:true}).then((res) => {
		const tab = [];
		var def;
		for (let entry of res.data) {
			def= {value:entry.id, label: entry.login}
			tab.push(def);
		}
		setTabNonBan(tab);
	})
	.catch(error => {
		if (error.response && error.response.status)
		{
			if (error.response.status === 403)
				window.location.href = "http://localhost:4200/";
			else
				console.log("Error: ", error.response.code, " : ", error.response.message);
		}
		else if (error.message)
			console.log(error.message);
		else
			console.log("unknown error");
		})
	}
	
	const whichMute = (idRoom) => {
		axios.get("http://localhost:3000/users/whichMute/" + idRoom, {withCredentials:true}).then((res) => {
		const tab = [];
		var def;
		for (let entry of res.data) {
			def= {value:entry.id, label: entry.login}
			tab.push(def);
		}
		setTabMute(tab);
	})
	.catch(error => {
		if (error.response && error.response.status)
		{
			if (error.response.status === 403)
				window.location.href = "http://localhost:4200/";
			else
				console.log("Error: ", error.response.code, " : ", error.response.message);
		}
		else if (error.message)
			console.log(error.message);
		else
			console.log("unknown error");
	})
	}
	const whichNonMute = (idRoom) => {
		axios.get("http://localhost:3000/users/whichNonMute/" + idRoom, {withCredentials:true}).then((res) => {
		const tab = [];
		var def;
		for (let entry of res.data) {
			def= {value:entry.id, label: entry.login}
			tab.push(def);
		}
		setTabNonMute(tab);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	}

	const whichAdm = (idRoom) => {
		axios.get("http://localhost:3000/users/whichAdm/" + idRoom, {withCredentials:true}).then((res) => {
		const tab = [];
		var def;
		for (let entry of res.data) {
			def= {value:entry.id, label: entry.login}
			tab.push(def);
		}
		setTabAdm(tab);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	}

	const whichNonAdm = (idRoom) => {
		axios.get("http://localhost:3000/users/whichNonAdm/" + idRoom, {withCredentials:true}).then((res) => {
			const tab = [];
			var def;
			for (let entry of res.data) {
				def= {value:entry.id, label: entry.login}
				tab.push(def);
			}
			setTabNonAdm(tab);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	}

	const closeSalon = (event, salon, salon2) => {
		//A la fermeture d'un salon, on en informe le back qui va renvoyer
		// sur le canal leftsalon l'information du leave, pour que tous les sockets soient informés
		event.stopPropagation();
		socket.emit('user_leaves_room', {userId: props.actualUser.id, room: salon2, roomId: salon.roomId});
	};

	const alertCreator = () => {
		alert('Your the creator, choose a successor before leaving the channel')
		return;
	}

	const submitPassword = (event) => {
		if (pwdRef.current.value.length === 0) {
			alert('Password name cant be empty');
			event.preventDefault();
		}
		else {
			event.preventDefault();
			const inf = { userId : event.value, roomId: currentSalon.roomId, pwd: pwdRef.current.value};
			axios.post("http://localhost:3000/users/changemdp", inf, {withCredentials: true}).then((res) => {
				if (res.data.message !== "")
				{
					event.target.reset(); 
					alert("Password too large")
					event.preventDefault();
				}
				else
				{
					event.target.reset(); //clear all input values in the form withCredentials:true
					alert("Password has been set");
					event.preventDefault();
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
				else if (error.message)
					console.log(error.message);
				else
					console.log("unknown error");
			})
			
			}
		};
	
	const resetPassword = (event) => {
		const inf = { userId : event.value, roomId: currentSalon.roomId, pwd: ''};
		event.preventDefault();
		axios.post("http://localhost:3000/users/resetpwd", inf, {withCredentials:true}).then((res) => {
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
		alert("Password reset to null");
	};

	const setaMute = (event) => {
		setMute({value:event.value, label:event.label});
	}
	const setanAdm = (event) => {
		setAdm({value:event.value, label:event.label});
	}
	const setaBan = (event) => {
		setBan({value:event.value, label:event.label});
	}
	const setanUnmute = (event) => {
		setUnmute({value:event.value, label:event.label});
	}
	const setanUnban = (event) => {
		setUnban({value:event.value, label:event.label});
	}
	const setanUnadm = (event) => {
		setUnadm({value:event.value, label:event.label});
	}
	
	const addAdmin = () => {
		const inf = { userId : admOption.value, roomId: currentSalon.roomId, pwd: ''};
		axios.post("http://localhost:3000/users/setAdminTrue" , inf, {withCredentials:true}).then((res) => {
			socket.emit('new-owner', admOption.value);
			if (admOption.value !== 0)
				alert(admOption.label + " is now an admin");
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
		setAdm({value:0, label:'Select...'});
		whichAdm(currentSalon.roomId);
		whichNonAdm(currentSalon.roomId);
	}

	const removeAdmin = () => {
		const inf = { userId :unadmOption.value, roomId: currentSalon.roomId, pwd: ''};
		axios.post("http://localhost:3000/users/setAdminFalse" , inf, {withCredentials:true}).then((res) => {
			socket.emit('new-owner', unadmOption.value);
			if (unadmOption.value !== 0)
				alert(unadmOption.label + " is remove of admins");

		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	   
		setUnadm({value:0, label:'Select...'});
		whichAdm(currentSalon.roomId);
		whichNonAdm(currentSalon.roomId);
	}
   
	const muteUser = () => {
		const inf = { userId : muteOption.value, roomId: currentSalon.roomId, muteUser: true};
		axios.post("http://localhost:3000/users/mute/", inf, {withCredentials:true}).then((res) => {
	})
	.catch(error => {
		if (error.response && error.response.status)
		{
			if (error.response.status === 403)
				window.location.href = "http://localhost:4200/";
			else
				console.log("Error: ", error.response.code, " : ", error.response.message);
		}
		else if (error.message)
			console.log(error.message);
		else
			console.log("unknown error");
	})
		if (muteOption.value !== 0)
			alert(muteOption.label + " muted!");
		setMute({value:0, label:'Select...'});
		whichMute(currentSalon.roomId);
		whichNonMute(currentSalon.roomId);
	}

	const unmuteUser = () => {
		const inf = { userId : unmuteOption.value, roomId: currentSalon.roomId, muteUser: true};
		axios.post("http://localhost:3000/users/unmute/", inf, {withCredentials:true}).then((res) => {
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
			if (unmuteOption.value !== 0)
				alert(unmuteOption.label + " unmuted!");
			setUnmute({value:0, label:'Select...'});
			whichMute(currentSalon.roomId);
			whichNonMute(currentSalon.roomId);
	}

	const banUser = () => {
		const inf = { userId : banOption.value, roomId: currentSalon.roomId, banUser: true};
		axios.post("http://localhost:3000/users/ban/" , inf, {withCredentials:true}).then((res) => {
			socket.emit('user_isBan_room', {userId: banOption.value, room: currentSalon.name, roomId: currentSalon.roomId});
		
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
		if (banOption.value !== 0)
		   alert(banOption.label + " banned!");
		setBan({value:0, label:'Select...'});
		whichBan(currentSalon.roomId);
		whichNonBan(currentSalon.roomId);
	}

	const unbanUser = () => {
		const inf = { userId : unbanOption.value, roomId: currentSalon.roomId, banUser: true};
		axios.post("http://localhost:3000/users/unban/" , inf, {withCredentials:true}).then((res) => {
			if (unbanOption.value !== 0)
				socket.emit('user_joins_room', {userId: unbanOption.value, room: currentSalon.name, roomId:currentSalon.roomId});
			
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
		if (unbanOption.value !== 0)
				alert(unbanOption.label + " unbanned!");
			setUnban({value:0, label:'Select...'});
			whichBan(currentSalon.roomId);
			whichNonBan(currentSalon.roomId);
	}

	return(
		<div>
		<div style={salons}>   
		  {Array.from(joinedSalons.entries()).map((salon) => ( 
			<button key={salon[1].roomId} style={channel} onClick={() => {handleClick(salon)}}>
			   <div style={{position:'relative' as 'relative', width:'100%', display:'flex', justifyContent:'space-between'}}>
			{
			salon[1].notif ?
				<div style={channelNameNotif}>{salon[1].avatar}</div>
				:
				<div style={channelName}>{salon[1].avatar}</div>
			}
			{/* modale qui va etre un setting avec  dedans et si owner..... */}
				{(salon[1].owner && salon[1].creator === props.actualUser.id) ? <div style={{cursor:'pointer'}} onClick={()=>toggleModal(salon[1])}> ⚙️ </div> : null}
				{(salon[1].owner && salon[1].creator !== props.actualUser.id) ? <div style={{cursor:'pointer'}} onClick={() =>toggleModal2(salon[1])}> ⚙️ </div> : null}
				{/* Permet de quitter le channel */}
				<div>
					{
						((salon[1].creator === props.actualUser.id)) ?
						<div style={{cursor:"pointer"}} onClick={alertCreator}>x</div> : <div style={{cursor:"pointer"}} onClick={(event) => closeSalon(event, salon[1], salon[0])}>x</div>
					}
				</div>
				</div>
			</button>))}
		</div>
		<ModalWindow  revele={revele} setRevele={toggleModal}> 
	
			<h1>Owner Settings</h1>
			<div style={addNLeave}>
			{currentSalon.private === true ?  <div><h2>Private room</h2>
				<button className='largeButton' onClick={toggleModal3}>Add members</button>
				<AddPrivateMember idRoom={currentSalon.roomId} roomName={currentSalon.name} revele={revele3} toggle={toggleModal3} toggle2={toggleModal}></AddPrivateMember>
				</div> : <></> }
				<div style={{display:'flex', flexDirection:'column'}}>
				<h2 >Leave Channel</h2>
				<button onClick={toggleModal4}><MaterialIcon title="Logout" size="large" icon="logout" /></button></div>
				<OwnerLeave idRoom={currentSalon.roomId} idUser={props.actualUser.id} roomName={currentSalon.name} revele={revele4} toggle={toggleModal4} toggle2={toggleModal} revele2={revele}></OwnerLeave>
				{currentSalon.private === false ?
					<div>
						<h3>Public Room - Define password</h3>
						
							<form onSubmit={submitPassword}>
							<input
								ref={pwdRef}
								id="pwd"
								name="pwd"
								type="password"
								onChange={()=>setErr("")}
							/>
							<b>{err}</b>
							<button type="submit">Submit</button>
							</form>
							<button onClick={resetPassword}>Reset password</button>
						</div> : <></>}
						</div>
						<h3>Add/Remove admin's channel</h3>
						   <div style={bar}>
							<button onClick={addAdmin}>ADD</button><Select onChange={setanAdm} options={tabNonAdm} value={admOption}/>
							{tabAdm.length  === 0 ? null :<Select onChange={setanUnadm} options={tabAdm} value={unadmOption}/>}
							{tabAdm.length  === 0 ? null :<button onClick={removeAdmin}>REMOVE</button>}
						   </div>
						   
						<h3>Mute/Unmute User</h3>
							<div style={bar}>
							<button onClick={muteUser}>MUTE</button><Select onChange={setaMute} options={tabNonMute} value={muteOption}/>
							{tabMute.length  === 0 ? null :<Select onChange={setanUnmute} options={tabMute} value={unmuteOption}/>}
							{tabMute.length  === 0 ? null : <button onClick={unmuteUser}>UNMUTE</button>}
						</div>   
					<h3>Ban/Unban User</h3>
					<div style={bar}>
					<button onClick={banUser}>BAN</button><Select onChange={setaBan} options={tabNonBan} value={banOption}/>
					{tabBan.length  === 0 ? null : <Select onChange={setanUnban} options={tabBan} value={unbanOption}/>} 
					{tabBan.length  === 0 ? null :<button onClick={unbanUser}>UNBAN</button>}
					</div>
				</ModalWindow>
				<ModalWindow  revele={revele2} setRevele={toggleModal2}> 
						<h1>Admin Settings</h1>
						{currentSalon.private === true ?  <div><h2>Private room</h2>
					<button className='largeButton' onClick={toggleModal3}>Add members</button>
						<AddPrivateMember idRoom={currentSalon.roomId} roomName={currentSalon.name} revele={revele3} toggle={toggleModal3} toggle2={toggleModal2}></AddPrivateMember>
					</div> : <></> }
						<h3>Mute/Unmute User</h3>
							<div style={bar}>
							<button onClick={muteUser}>MUTE</button><Select onChange={setaMute} options={tabNonMute} value={muteOption}/>
							<Select onChange={setanUnmute} options={tabMute} value={unmuteOption}/><button onClick={unmuteUser}>UNMUTE</button>
						</div>   
					<h3>Ban/Unban User</h3>
					<div style={bar}>
					<button onClick={banUser}>BAN</button><Select onChange={setaBan} options={tabNonBan} value={banOption}/>
						<Select onChange={setanUnban} options={tabBan} value={unbanOption}/><button onClick={unbanUser}>UNBAN</button>
					</div>
				</ModalWindow>
		</div>
	);
 };

 export default MySalons;
