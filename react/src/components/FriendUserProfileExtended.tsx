/*LAURA: friend profile part 2*/

import axios from "axios";
import { useEffect, useState } from "react";
import { ModalWindow } from './ModaleWindow/LogiqueModale2';
import MatchHistory from "./MatchHistory";
import { socket } from "./Socket";

const friendProfileStyle = {
	alignItems: 'center',
	justifyContent: 'center',
} as React.CSSProperties;

/* Composant affichant le profil detaille d'un utilisateur [login] recu en parametre {value} */
const FriendUserProfilExtended = ({Value}) => {
	
	const [ThisUser, setThisUser] = useState([] as any);
	const [friends, setFriends] = useState([] as any);
	const [InboundReq, setInboundReq] = useState([] as any);
	const [revele, setRevele] = useState(false);
	const [myId, setmyId] = useState([]);
	const toggleModal = () => {setRevele(!revele);} 
	const [history, setHistory] = useState([]);
	const [wins, setWins] = useState([]);
	const [ranking, setRanking] = useState([]);
	const [losses, setLosses] = useState([]);

	useEffect(() => {
		/*get user*/
		axios.get("http://localhost:3000/users/" + Value, {withCredentials:true}).then((res) => { 
		setThisUser(res.data);
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
		/*get friends list*/
		axios.get("http://localhost:3000/friends/friendRequest/me/friendlist", {withCredentials:true}).then((res) =>{
		setFriends(res.data);
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
		/*get userId*/   
		axios.get("http://localhost:3000/users/getMyId", {withCredentials:true}).then((res) =>{
			setmyId(res.data);
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
		/*get requests recus par cet utilisateur*/
		axios.get("http://localhost:3000/friends/friendRequest/me/hasSentMe/" + Value, {withCredentials:true}).then((res) =>{
		setInboundReq(res.data);
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

		axios.get("http://localhost:3000/stats/getMatchHistoryFriend/" + Value, {withCredentials:true}).then((res) =>{
			setHistory(res.data);
		})

		axios.get("http://localhost:3000/stats/getWinsFriend/" + Value, {withCredentials:true}).then((res) =>{
			setWins(res.data);
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

		axios.get("http://localhost:3000/stats/getLossesFriend/" + Value, {withCredentials:true}).then((res) =>{
			setLosses(res.data);
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

		axios.get("http://localhost:3000/stats/getRankingFriend/" + Value, {withCredentials:true}).then((res) =>{
			setRanking(res.data);
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
	},[Value]);

	socket.on("changeFriends", ({sender}, {receiver}, data) => {
		if (sender === myId || receiver === myId)
		{
		  axios.get("http://localhost:3000/friends/friendRequest/me/friendlist", {withCredentials:true}).then((res) =>{
		  setFriends(res.data);
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
		}})

/****************************************/
/*ACTION FUNCTIONS: send/accept/reject***/
/****************************************/

	const sendFriendRequest = event => {
		axios.get("http://localhost:3000/friends/friendRequest/send/" + ThisUser.id, {withCredentials:true}).then((res) => {
			const mess = res.data.error;
			/*Si la fonction send a retourne un erreur ?*/
			if (typeof(mess) === 'string')
			{
				const str = JSON.stringify(mess);
				/*affiche l'erreur*/
				alert(str);
			}
			else {
			/*sinon, tout s'est bien passe et on affiche le suivant:*/
				socket.emit('friendrequestnotif', {id: ThisUser.id, new: true});
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
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	}

	socket.on("changeColor", data => {
		axios.get("http://localhost:3000/users/" + Value, {withCredentials:true}).then((res) => { 
			setThisUser(res.data);
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
	});


	const AcceptRequest = event => {
		axios.get("http://localhost:3000/friends/friendRequest/accept/" + InboundReq.id, {withCredentials:true}).then((res) => {
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
		alert("Request accepted");
		socket.emit('friendrequestnotif', {id: ThisUser.id, new: false});
	}   

	const RejectRequest = event => {
		axios.get("http://localhost:3000/friends/friendRequest/reject/" + InboundReq.id, {withCredentials:true}).then((res) => {
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
		alert("Request rejected");
		socket.emit('friendrequestnotif', {id: ThisUser.id, new: false});
	}   

/****************************************/
/*ERROR HANDLING/EXCEPTIONS**************/
/****************************************/
	
	/*CAS 1: L'USER N'EXISTE PAS*/
	if(!ThisUser)
	return(
		<div style={friendProfileStyle}>
			<div><h1>This user does not exist</h1></div>
		</div>
	);

	/*CAS 2: ON a deja recu une requete de cet utilisateur*/
	if (!InboundReq.error)
	{
	/*CAS 2: si c'est une requete pending, on retourne avec les options d'accepter/rejeter la requete*/
	if (InboundReq.status === 'pending')
	{
	return(
		<div style={friendProfileStyle}>
			<p><svg width="112" height="100" viewBox='0 0 110 100'>
			  <foreignObject x="0" y="0" width="110" height="100" >
				<div><img style={{maxWidth: "100px", maxHeight: "100px", borderRadius: '100%' }} alt="friend-avatar" src={ThisUser.avatar}/></div>
			  </foreignObject>
			<rect width="20" height="20" x="75" y="80" rx="10" ry="10" fill={ThisUser.color}></rect></svg></p>
			{/*<img style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt="profil-avatar" src={ThisUser.avatar} />*/}
			<div><h1>{ThisUser.login}</h1></div>
			<p>Victoires: {wins} </p>
			<p>Defaites: {losses} </p>
			<p>Ranking {ranking} </p>
			<button onClick={toggleModal}>Match History</button>
			<ModalWindow revele={revele} setRevele={toggleModal}>
			<MatchHistory history={history}></MatchHistory>
			</ModalWindow>
			<p>Friend request is {InboundReq.status}</p>
			<button onClick={AcceptRequest}>Accept request?</button>
			<button onClick={RejectRequest}>Reject request?</button>
		</div>
	);
	}
	/*CAS 3: si on a recu une requete de cet utilisateur mais on l'a rejete on affiche ca*/
	else if (InboundReq.status === 'rejected')
	{
	return(
		<div style={friendProfileStyle}>
			<p><svg width="112" height="100" viewBox='0 0 110 100'>
			  <foreignObject x="0" y="0" width="110" height="100" >
				<div><img style={{maxWidth: "100px", maxHeight: "100px", borderRadius: '100%' }} alt="friend-avatar" src={ThisUser.avatar}/></div>
			  </foreignObject>
			<rect width="20" height="20" x="75" y="80" rx="10" ry="10" fill={ThisUser.color}></rect></svg></p>
			{/*<img style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt="profil-avatar" src={ThisUser.avatar} />*/}
			<div><h1>{ThisUser.login}</h1></div>
			<p>Victoires: {wins} </p>
			<p>Defaites: {losses} </p>
			<p>Ranking: {ranking} </p>
			<button onClick={toggleModal}>Match History</button>
			<ModalWindow revele={revele} setRevele={toggleModal}>
			<MatchHistory history={history}></MatchHistory>
			</ModalWindow>
			<p>Friend request is {InboundReq.status}</p>
		</div>
	);
	}
}
	/*CAS 4: si on est deja amis"*/ 
   var result = friends.map(a => a.login);
	if (result.includes(ThisUser.login)) {
		return(
			<div style={friendProfileStyle}>
				<p><svg width="112" height="100" viewBox='0 0 110 100'>
				<foreignObject x="0" y="0" width="110" height="100" >
					<div><img style={{maxWidth: "100px", maxHeight: "100px", borderRadius: '100%' }} alt="friend-avatar" src={ThisUser.avatar}/></div>
				</foreignObject>
				<rect width="20" height="20" x="75" y="80" rx="10" ry="10" fill={ThisUser.color}></rect></svg></p>
				{/*<img style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt="profil-avatar" src={ThisUser.avatar} />*/}
				<div><h1>{ThisUser.login}</h1></div>
				<p>Victoires: {wins} </p>
				<p>Defaites: {losses} </p>
				<p>Ranking: {ranking} </p>
				<button onClick={toggleModal}>Match History</button>
				<ModalWindow revele={revele} setRevele={toggleModal}>
				<MatchHistory history={history}></MatchHistory>
				</ModalWindow>
				<p>Friend :)</p>
			</div>
		);
	}
	/*SI ON RENTRE PAS DANS LES EXCEPTIONS, on affiche le profil d'utilisateur cherche avec l'option pour envoyer une requete d'ami*/
	else 
		return(
			<div style={friendProfileStyle}>
				<p><svg width="112" height="100" viewBox='0 0 110 100'>
				<foreignObject x="0" y="0" width="110" height="100" >
					<div><img style={{maxWidth: "100px", maxHeight: "100px", borderRadius: '100%' }} alt="friend-avatar" src={ThisUser.avatar}/></div>
				</foreignObject>
				<rect width="20" height="20" x="75" y="80" rx="10" ry="10" fill={ThisUser.color}></rect></svg></p>
				{/*<img style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt="profil-avatar" src={ThisUser.avatar} />*/}
				<div><h1>{ThisUser.login}</h1></div>
				<p>Victoires: {wins} </p>
				<p>Defaites: {losses} </p>
				<p>Ranking: {ranking} </p>
				<button onClick={toggleModal}>Match History</button>
				<ModalWindow revele={revele} setRevele={toggleModal}>
				<MatchHistory history={history}></MatchHistory>
				</ModalWindow>
				<button onClick={sendFriendRequest}>Send Friend Request</button>
			</div>
		);
}

export default FriendUserProfilExtended