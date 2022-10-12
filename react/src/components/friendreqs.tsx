/*LAURA: friend requests component qui ouvre la fenetre FriendReqsModale quand on clicke sur le button "friend requests" */

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import AcceptButton from './AcceptButton';
import { ModalWindow } from './ModaleWindow/LogiqueModale2';
import RejectButton from './RejectButton';
import { socket } from './Socket';
import './css/globalStyle.css'


const FriendReqss = ({reqnotif}) => {

	const [reqs, setreqs] = useState([]);
	const [refresh, setRefresh] = useState(false);
	/* Outils d'affichage de la modale */
	const [revele, setRevele] = useState(false);
	const [myId, setmyId] = useState([]);
	const toggleModal = () => {setRevele(!revele);} 
	/*------*/

	useEffect(() => {
		setRefresh(false);
		axios.get("http://localhost:3000/friends/friendRequest/me/received-requests", {withCredentials:true}).then((res) =>{
			setreqs(res.data);
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
	},[refresh]);

	socket.on("changeReqs", ({receiver}, data) => {
		if (receiver === myId)
		{
			axios.get("http://localhost:3000/friends/friendRequest/me/received-requests", {withCredentials:true}).then((res) =>{
			setreqs(res.data);
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
	}})

	return(
		<div>
		{
			reqnotif ?
			<button onClick={toggleModal} style={{backgroundColor:'#3CCF4E'}}>Friend Reqs</button>
			:
			<button onClick={toggleModal}>Friend Reqs</button>
		}
			<ModalWindow revele={revele} setRevele={toggleModal}>
				<h1>Friend Requests</h1>
				<div className='lists'>  
				{reqs.map(reqs => (
					<div key={reqs.id}><img style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt="avatar" src={reqs.sender.avatar}/><br></br> 
					{reqs.status} request from {reqs.sender.login}
					<AcceptButton FriendReq = {reqs} setRefresh={setRefresh}></AcceptButton>
					<RejectButton FriendReq = {reqs} setRefresh={setRefresh}></RejectButton></div>
				))}
				</div>
			</ModalWindow>
		</div>
		);
}
export default FriendReqss