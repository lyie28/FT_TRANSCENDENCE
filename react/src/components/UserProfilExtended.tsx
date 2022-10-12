/* aurel */
import axios from "axios";
import Friends from './friends'
import FriendReqs from './friendreqs'
import { useEffect, useState } from "react";
import { ModalWindow } from './ModaleWindow/LogiqueModale2';
import MatchHistory from "./MatchHistory";
import Leaderboard from "./Leaderboard";
import UserFormAvatar from "./UserFormAvatar";
import UserForm from "./UserForm";
import MaterialIcon from 'material-icons-react';

/* Composant affichant le profil detaille d'un utilisateur [name] recu en parametre */
const UserProfilExtended = ({user, reqnotif, toggleProfil, toggleProfil2}) => {
	
	const [wins, setWins] = useState([]);
	const [losses, setLosses] = useState([]);
	const [history, setHistory] = useState([]);
	const [ranking, setRanking] = useState([]);

	const [reveleHistory, setReveleHistory] = useState(false);
	const toggleHistory = () => {setReveleHistory(!reveleHistory);} 
	//---
	const [reveleForm, setReveleForm] = useState(false);
	const toggleForm = () => {setReveleForm(!reveleForm);} 
	
	useEffect(() => {
		axios.get("http://localhost:3000/stats/getWins", {withCredentials:true}).then((res) =>{
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

		axios.get("http://localhost:3000/stats/getLosses", {withCredentials:true}).then((res) =>{
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

		axios.get("http://localhost:3000/stats/getMatchHistory", {withCredentials:true}).then((res) =>{
			setHistory(res.data);
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

		axios.get("http://localhost:3000/stats/getRanking", {withCredentials:true}).then((res) =>{
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

	}, [])
	
	return(
		<div>
			<div style={{display:'flex', justifyContent:'center'}}>
				<img style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt='profilImage' src={user.avatar} />                  
			</div >
			<div style={{display:'flex', justifyContent: 'center'}}>
				<h1 style={{display:'flex', marginBottom:'0', paddingRight:'16px'}}>{user.login}</h1>
				<button className="iconButton"><MaterialIcon title="Edit" size='medium' icon="edit" onClick={toggleForm} /></button>
			</div>
			<ModalWindow revele={reveleForm} setRevele={toggleForm}>
				<div style={{display:'flex', justifyContent:'space-around'}}>
				<div style={{width:'50%', height:'auto', borderRight:'solid'}}><h2>Change your informations</h2><UserForm user={user} toggle={toggleForm}/></div>
				<div><h2>Change your photo</h2><UserFormAvatar user={user} toggle={toggleForm}/></div>
				</div>
			</ModalWindow>

			<br></br>
			<div style={{display:'flex', justifyContent:'center', width:'100%'}}>
				<div><Friends user={user} toggleProfil={toggleProfil} toggleProfil2={toggleProfil2}></Friends></div>
				<div><FriendReqs reqnotif={reqnotif}></FriendReqs></div>
				<div><Leaderboard></Leaderboard></div>
				<div><button onClick={toggleHistory}>Match History</button></div>
			</div>
			<br></br>
			<br></br>
			<div style={{display:'flex', flexDirection: 'column'}}>
				<div style={{display:'flex', justifyContent:'center'}}>Victoires: {wins}</div><br></br>
				<div style={{display:'flex', justifyContent:'center'}}>Defaites: {losses}</div><br></br>
				<div style={{display:'flex', justifyContent:'center'}}>Ranking: {ranking}</div><br></br>
			</div>
			<ModalWindow revele={reveleHistory} setRevele={toggleHistory}>
				<MatchHistory history={history}></MatchHistory>
			</ModalWindow>
		</div>
	);
}

export default UserProfilExtended